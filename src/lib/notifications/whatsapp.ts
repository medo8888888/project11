import twilio from "twilio";

let client: ReturnType<typeof twilio> | null = null;
function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !authToken) return null;
  if (!client) client = twilio(sid, authToken);
  return client;
}

/** `to` should be an E.164 phone number, e.g. +15551234567 */
export async function sendWhatsApp(to: string, body: string) {
  const twilioClient = getClient();
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+14155238886"

  if (!twilioClient || !from) {
    console.log(`[whatsapp:dev] to=${to}\n${body}`);
    return { sid: "dev-noop" };
  }

  const message = await twilioClient.messages.create({
    from,
    to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
    body,
  });
  return message;
}
