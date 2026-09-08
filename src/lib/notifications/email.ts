import { Resend } from "resend";

let client: Resend | null = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const resend = getClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "notifications@example.com";

  if (!resend) {
    // Dev/CI fallback: no API key configured, log instead of failing the caller.
    console.log(`[email:dev] to=${to} subject="${subject}"\n${html}`);
    return { id: "dev-noop" };
  }

  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error("[email] send failed", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
  return data;
}
