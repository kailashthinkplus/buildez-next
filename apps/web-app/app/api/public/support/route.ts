import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { rateLimitIp } from "@/lib/api/rate-limit";
import { ApiError } from "@/lib/api/errors";
import { sendAdminAlert } from "@/lib/email/adminAlert";

const TYPES = ["SUPPORT", "BUG", "ABUSE"] as const;
type SupportType = (typeof TYPES)[number];

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) || null : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // captcha not configured yet — skip enforcement
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body })
    .then((res) => res.json())
    .catch(() => ({ success: false }));
  return result?.success === true;
}

export async function POST(req: NextRequest) {
  try {
    await rateLimitIp(req, { limit: 5, windowSeconds: 600 });
  } catch (error) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }

  const body = await req.json().catch(() => ({}));
  const type: SupportType = TYPES.includes(body.type) ? body.type : "SUPPORT";
  const email = text(body.email, 254);
  const message = text(body.message, 5000);
  const name = text(body.name, 160);
  const subject = text(body.subject, 200);
  const pageUrl = text(body.pageUrl, 500);
  const severity = text(body.severity, 40);

  if (!email || !isValidEmail(email)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  if (!message || message.length < 10) return NextResponse.json({ error: "Please describe the issue in at least 10 characters." }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";
  const captchaOk = await verifyTurnstile(String(body.captchaToken || ""), ip);
  if (!captchaOk) return NextResponse.json({ error: "Verification failed. Please retry the check and submit again." }, { status: 400 });

  const created = await prisma.supportRequest.create({
    data: { type, email, message, name, subject, pageUrl, severity },
  });

  const TYPE_LABEL: Record<SupportType, string> = { SUPPORT: "Support request", BUG: "Bug report", ABUSE: "Abuse report" };
  void sendAdminAlert({
    title: `${TYPE_LABEL[type]} received`,
    message: [
      `From: ${name || "(no name)"} <${email}>`,
      subject ? `Subject: ${subject}` : null,
      severity ? `Severity: ${severity}` : null,
      pageUrl ? `Page: ${pageUrl}` : null,
      "",
      message,
    ].filter((line) => line !== null).join("\n"),
    ctaLabel: "Open in Super Admin",
    ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://getbuildezy.com"}/super/support/${created.id}`,
  });

  return NextResponse.json({ id: created.id, status: created.status, createdAt: created.createdAt }, { status: 201 });
}
