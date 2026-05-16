import { Resend } from "resend";

export async function sendHtmlEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) {
    throw new Error("Resend is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL).");
  }

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    throw new Error(error.message);
  }
}
