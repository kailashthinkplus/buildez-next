import { NextRequest, NextResponse } from "next/server";
import { InviteStatus, TeamRole, prisma } from "@buildez/db";

import { getUser } from "@/lib/auth/getUser";

const assignableRoles = new Set<TeamRole>([
  TeamRole.ADMIN,
  TeamRole.EDITOR,
  TeamRole.VIEWER,
]);

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

async function access(requireManager = false) {
  const auth = await getUser();
  if (!auth?.tenant || !auth.user) return null;
  if (requireManager && !auth.permissions.manageTeam) return null;
  return auth;
}

async function loadTeam(tenantId: string) {
  return prisma.team.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
  });
}

async function ensureTeam(tenantId: string, tenantName: string) {
  const existing = await loadTeam(tenantId);
  if (existing) return existing;
  const base = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
  return prisma.team.create({
    data: {
      tenantId,
      name: `${tenantName} Team`,
      slug: `${base}-${tenantId.slice(-8)}`,
    },
  });
}

export async function GET() {
  const auth = await access();
  if (!auth) return jsonError("Unauthorized", 401);

  const team = await loadTeam(auth.tenant.id);
  const [members, invites] = team
    ? await Promise.all([
        prisma.teamMember.findMany({
          where: { teamId: team.id },
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, lastLoginAt: true } } },
          orderBy: { createdAt: "asc" },
        }),
        prisma.teamInvite.findMany({
          where: { teamId: team.id, status: InviteStatus.PENDING },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], []];

  const owner = auth.tenant.ownerId
    ? await prisma.user.findUnique({
        where: { id: auth.tenant.ownerId },
        select: { id: true, name: true, email: true, avatarUrl: true, lastLoginAt: true },
      })
    : null;
  const limit = auth.plan?.Plan?.teamMembers ?? 1;

  return NextResponse.json({
    team: team ? { id: team.id, name: team.name } : null,
    owner,
    members: members.filter((member) => member.userId !== owner?.id),
    invites,
    limits: { used: (owner ? 1 : 0) + members.filter((member) => member.userId !== owner?.id).length + invites.length, total: limit },
    canManage: Boolean(auth.permissions.manageTeam),
    currentUserId: auth.user.id,
  });
}

export async function POST(req: NextRequest) {
  const auth = await access(true);
  if (!auth) return jsonError("You do not have permission to manage this team.", 403);
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body.role === "string" ? body.role.toUpperCase() as TeamRole : TeamRole.VIEWER;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return jsonError("Enter a valid email address.", 400);
  if (!assignableRoles.has(role)) return jsonError("Choose a valid role.", 400);

  const team = await ensureTeam(auth.tenant.id, auth.tenant.name);
  const [memberCount, inviteCount] = await Promise.all([
    prisma.teamMember.count({ where: { teamId: team.id, userId: { not: auth.tenant.ownerId ?? undefined } } }),
    prisma.teamInvite.count({ where: { teamId: team.id, status: InviteStatus.PENDING } }),
  ]);
  const limit = auth.plan?.Plan?.teamMembers ?? 1;
  if (1 + memberCount + inviteCount >= limit) return jsonError("Your plan's team member limit has been reached.", 409);
  if (auth.user.email?.toLowerCase() === email) return jsonError("You are already the workspace owner.", 409);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const alreadyMember = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId: team.id, userId: existingUser.id } } });
    if (alreadyMember) return jsonError("This user is already a team member.", 409);
    const member = await prisma.teamMember.create({ data: { teamId: team.id, userId: existingUser.id, role } });
    await prisma.tenantEvent.create({ data: { tenantId: auth.tenant.id, type: "team_member_added", payload: { userId: existingUser.id, role, invitedBy: auth.user.id } } });
    return NextResponse.json({ kind: "member", member }, { status: 201 });
  }

  const pending = await prisma.teamInvite.findFirst({ where: { teamId: team.id, email, status: InviteStatus.PENDING } });
  if (pending) return jsonError("An invitation is already pending for this email.", 409);
  const invite = await prisma.teamInvite.create({
    data: { teamId: team.id, email, role, invitedBy: auth.user.id, expiresAt: new Date(Date.now() + 7 * 86400000) },
  });
  await prisma.tenantEvent.create({ data: { tenantId: auth.tenant.id, type: "team_invite_created", payload: { inviteId: invite.id, email, role, invitedBy: auth.user.id } } });
  return NextResponse.json({ kind: "invite", invite }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await access(true);
  if (!auth) return jsonError("You do not have permission to manage this team.", 403);
  const body = await req.json().catch(() => ({}));
  const role = typeof body.role === "string" ? body.role.toUpperCase() as TeamRole : null;
  if (!role || !assignableRoles.has(role)) return jsonError("Choose a valid role.", 400);
  const team = await loadTeam(auth.tenant.id);
  if (!team) return jsonError("Team not found.", 404);

  if (typeof body.memberId === "string") {
    const member = await prisma.teamMember.findFirst({ where: { id: body.memberId, teamId: team.id }, select: { id: true, userId: true } });
    if (!member || member.userId === auth.tenant.ownerId) return jsonError("Member not found.", 404);
    const updated = await prisma.teamMember.update({ where: { id: member.id }, data: { role } });
    return NextResponse.json({ member: updated });
  }
  if (typeof body.inviteId === "string") {
    const invite = await prisma.teamInvite.findFirst({ where: { id: body.inviteId, teamId: team.id, status: InviteStatus.PENDING } });
    if (!invite) return jsonError("Invitation not found.", 404);
    const updated = await prisma.teamInvite.update({ where: { id: invite.id }, data: { role } });
    return NextResponse.json({ invite: updated });
  }
  return jsonError("Member or invitation is required.", 400);
}

export async function DELETE(req: NextRequest) {
  const auth = await access(true);
  if (!auth) return jsonError("You do not have permission to manage this team.", 403);
  const team = await loadTeam(auth.tenant.id);
  if (!team) return jsonError("Team not found.", 404);
  const memberId = req.nextUrl.searchParams.get("memberId");
  const inviteId = req.nextUrl.searchParams.get("inviteId");

  if (memberId) {
    const member = await prisma.teamMember.findFirst({ where: { id: memberId, teamId: team.id }, select: { id: true, userId: true } });
    if (!member || member.userId === auth.tenant.ownerId || member.userId === auth.user.id) return jsonError("This member cannot be removed.", 400);
    await prisma.teamMember.delete({ where: { id: member.id } });
    return NextResponse.json({ success: true });
  }
  if (inviteId) {
    const invite = await prisma.teamInvite.findFirst({ where: { id: inviteId, teamId: team.id, status: InviteStatus.PENDING } });
    if (!invite) return jsonError("Invitation not found.", 404);
    await prisma.teamInvite.update({ where: { id: invite.id }, data: { status: InviteStatus.REVOKED } });
    return NextResponse.json({ success: true });
  }
  return jsonError("Member or invitation is required.", 400);
}
