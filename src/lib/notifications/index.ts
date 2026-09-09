import { sendEmail } from "./email";
import { sendWhatsApp } from "./whatsapp";

export { sendEmail, sendWhatsApp };

type Recipient = {
  name: string;
  email: string;
  phone?: string | null;
  notifyEmail?: boolean;
  notifyWhatsapp?: boolean;
};

/**
 * Fires both channels in parallel and never lets one failure block the other —
 * SLA reminders are best-effort delivery, not a transaction. Recipients can opt
 * out of a channel via notifyEmail/notifyWhatsapp (defaults to opted-in).
 */
export async function notify(recipient: Recipient, subject: string, htmlBody: string, textBody: string) {
  const wantsEmail = recipient.notifyEmail !== false;
  const wantsWhatsapp = recipient.notifyWhatsapp !== false && Boolean(recipient.phone);

  const results = await Promise.allSettled([
    wantsEmail ? sendEmail(recipient.email, subject, htmlBody) : Promise.resolve(null),
    wantsWhatsapp ? sendWhatsApp(recipient.phone!, textBody) : Promise.resolve(null),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const channel = i === 0 ? "email" : "whatsapp";
      console.error(`[notify] ${channel} failed for ${recipient.email}:`, r.reason);
    }
  });

  return results;
}

export function nudgeMessage(projectTitle: string, projectCode: string, url: string) {
  return {
    subject: `Action needed: Project ${projectCode} awaiting your review`,
    text: `Project ${projectCode} (${projectTitle}) is awaiting your review. Click link to access: ${url}`,
    html: `<p>Project <strong>${projectCode} — ${escapeHtml(projectTitle)}</strong> is awaiting your review.</p>
<p><a href="${url}">Click here to review</a></p>`,
  };
}

export function escalationMessage(projectTitle: string, projectCode: string, url: string, discipline: string) {
  return {
    subject: `OVERDUE: Project ${projectCode} needs immediate attention`,
    text: `URGENT: Project ${projectCode} (${projectTitle}) — ${discipline} review is now OVERDUE (2+ days pending). Please act now: ${url}`,
    html: `<p style="color:#b91c1c;font-weight:bold;">URGENT — OVERDUE REVIEW</p>
<p>Project <strong>${projectCode} — ${escapeHtml(projectTitle)}</strong>: the ${escapeHtml(
      discipline
    )} review has been pending for 2+ days.</p>
<p><a href="${url}">Review now</a></p>`,
  };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
