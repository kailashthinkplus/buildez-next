import { sendMail } from "./sendMail";
import { sendAdminAlert } from "./adminAlert";
import { welcomeEmailContent } from "./welcomeTemplate";

/**
 * Fires the welcome email and the superadmin new-signup alert. Both are
 * fire-and-forget: a mail failure must never break account creation, so
 * errors are caught and logged rather than thrown.
 */
export function notifyNewSignup(input: {
  email: string;
  firstName?: string | null;
  name?: string | null;
  provider: "password" | "google";
  continueUrl: string;
}) {
  const { subject, text, html } = welcomeEmailContent({ firstName: input.firstName, continueUrl: input.continueUrl });
  void sendMail({ to: input.email, subject, text, html }).catch((error) => {
    console.error("WELCOME EMAIL FAILED:", error);
  });

  void sendAdminAlert({
    title: "New BuildEZ signup",
    message: `${input.name || input.email} just signed up via ${input.provider}.\nEmail: ${input.email}`,
  });
}
