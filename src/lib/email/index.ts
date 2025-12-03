import { sendEmail, SendEmailResult } from './send';
import { partnerWelcomeTemplate } from './templates/partner-welcome';
import { passwordResetTemplate } from './templates/password-reset';
import { notificationTemplate } from './templates/notification';

// Re-export types
export type { SendEmailResult, SendEmailParams } from './send';

/**
 * Send welcome email to newly approved partner
 */
export async function sendPartnerWelcomeEmail(params: {
  to: string;
  firstName: string;
  companyName: string;
  loginUrl: string;
}): Promise<SendEmailResult> {
  const { to, firstName, companyName, loginUrl } = params;
  const template = partnerWelcomeTemplate({ firstName, companyName, loginUrl });

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  firstName?: string;
  resetUrl: string;
}): Promise<SendEmailResult> {
  const { to, firstName, resetUrl } = params;
  const template = passwordResetTemplate({ firstName, resetUrl });

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send generic notification email
 */
export async function sendNotificationEmail(params: {
  to: string | string[];
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}): Promise<SendEmailResult> {
  const { to, title, message, actionUrl, actionLabel } = params;
  const template = notificationTemplate({ title, message, actionUrl, actionLabel });

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
