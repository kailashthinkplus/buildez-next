import nodemailer, { type Transporter } from "nodemailer";

/*
 * Google Workspace SMTP (works the same as personal Gmail SMTP): send
 * from a Workspace mailbox using an app password rather than the
 * account password. Configure via:
 *   SMTP_HOST=smtp.gmail.com (default)
 *   SMTP_PORT=465 (default)
 *   SMTP_USER=you@yourdomain.com
 *   SMTP_APP_PASSWORD=<16-character app password>
 *   SMTP_FROM="BuildEZ <you@yourdomain.com>" (optional, defaults to SMTP_USER)
 *
 * Without SMTP_USER/SMTP_APP_PASSWORD configured, mail is logged to the
 * server console instead of sent — the same dev-safe fallback the
 * existing super-admin OTP flow already relies on.
 */

let transporter: Transporter | null = null;
let transporterConfigured = false;

function getTransporter(): Transporter | null {
  if (transporterConfigured) return transporter;
  transporterConfigured = true;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;
  if (!user || !pass) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendMail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ delivered: boolean }> {
  const client = getTransporter();

  if (!client) {
    console.log("📧 EMAIL [DEV FALLBACK — SMTP not configured]:", {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return { delivered: false };
  }

  await client.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  return { delivered: true };
}
