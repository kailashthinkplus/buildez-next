// /apps/web-app/lib/auth/session.ts
import { cookies } from "next/headers";
import { AuthProvider, prisma } from "@buildez/db";

const isProd = process.env.NODE_ENV === "production";
export const SESSION_COOKIE = isProd ? "__Secure-session" : "session";

/* ======================
   CREATE SESSION
====================== */
export async function createSession({
  user,
  provider,
  ttlHours = 24,
}: {
  user: any;
  provider: AuthProvider;
  ttlHours?: number;
}) {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  const cookieStore = await cookies();

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      provider,
      expiresAt,
      ipAddress: "",
      userAgent: "",
    },
  });

  cookieStore.set({
    name: SESSION_COOKIE,
    value: session.id,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return session;
}

/* ======================
   DELETE SESSION
====================== */
export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { revoked: true },
    });
  }

  cookieStore.set({
    name: SESSION_COOKIE,
    value: "",
    path: "/",
    expires: new Date(0),
  });
}

/* ======================
   GET CURRENT USER
====================== */
export async function getCurrentUser(req?: Request) {
  const cookieValue =
    req?.headers.get("cookie") ||
    (await cookies()).get(SESSION_COOKIE)?.value;

  if (!cookieValue) return null;

  let sessionId: string | null = null;

  if (req) {
    const cookieList = req.headers.get("cookie")?.split(";") || [];
    for (const entry of cookieList) {
      const [key, value] = entry.trim().split("=");
      if (key === SESSION_COOKIE) sessionId = value;
    }
  } else {
    sessionId = (await cookies()).get(SESSION_COOKIE)?.value || null;
  }

  if (!sessionId) return null;

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        include: {
          ownedTenants: true,  // tenants where user is OWNER
          tenantUsers: true,   // tenants where user is MEMBER
          teamMemberships: {
            include: {
              team: true,
            },
          },
        },
      },
    },
  });

  if (!session) return null;

  return session.user;
}

/* ======================
   REQUIRE USER
====================== */
export async function requireUser(req?: Request) {
  const user = await getCurrentUser(req);
  if (!user) throw new Error("Unauthorized");
  return user;
}
