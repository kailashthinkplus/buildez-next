export function otpEmailContent(input: { code: string; purpose: "reset your password" | "verify your email" }) {
  const subject = `${input.code} is your BuildEZ verification code`;
  const text = `Your BuildEZ code to ${input.purpose} is ${input.code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`;
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:420px;margin:0 auto;padding:32px 24px;color:#12141a">
      <p style="font-size:14px;color:#5b6472;margin:0 0 20px">Use this code to ${input.purpose}:</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:.14em;text-align:center;padding:18px;border-radius:12px;background:#f2f3f5;margin-bottom:20px">${input.code}</div>
      <p style="font-size:13px;color:#5b6472;margin:0">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  return { subject, text, html };
}
