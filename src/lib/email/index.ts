import { sendEmail, SendEmailResult } from './send';
import { partnerWelcomeTemplate } from './templates/partner-welcome';
import { passwordResetTemplate } from './templates/password-reset';
import { notificationTemplate } from './templates/notification';
import { accessRequestReceivedTemplate } from './templates/access-request-received';
import { accessRequestRejectionTemplate } from './templates/access-request-rejection';
import { caseStatusUpdateTemplate } from './templates/case-status-update';
import { eventPublishedTemplate } from './templates/event-published';
import { userInviteTemplate } from './templates/user-invite';
import { commentMentionTemplate } from './templates/comment-mention';
import { caseDocumentAddedTemplate } from './templates/case-document-added';
import { suggestionReceivedTemplate } from './templates/suggestion-received';

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

/**
 * Send confirmation email when an access request is received
 */
export async function sendAccessRequestReceivedEmail(params: {
  to: string;
  firstName: string;
  companyName: string;
}): Promise<SendEmailResult> {
  const template = accessRequestReceivedTemplate(params);
  return sendEmail({ to: params.to, subject: template.subject, html: template.html, text: template.text });
}

/**
 * Send rejection email when an access request is rejected
 */
export async function sendAccessRequestRejectionEmail(params: {
  to: string;
  firstName: string;
  companyName: string;
  reviewNotes?: string;
}): Promise<SendEmailResult> {
  const { to, ...templateParams } = params;
  const template = accessRequestRejectionTemplate(templateParams);
  return sendEmail({ to, subject: template.subject, html: template.html, text: template.text });
}

/**
 * Send an alert email to the admin notification address
 */
export async function sendAdminAlertEmail(params: {
  subject: string;
  body: string;
  actionUrl?: string;
}): Promise<SendEmailResult> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    return { success: false, error: 'ADMIN_NOTIFICATION_EMAIL not configured' };
  }

  const template = notificationTemplate({
    title: params.subject,
    message: params.body,
    actionUrl: params.actionUrl,
  });

  return sendEmail({
    to: adminEmail,
    subject: params.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send case status update email to a partner
 */
export async function sendCaseStatusUpdateEmail(params: {
  to: string;
  firstName: string;
  caseCode: string;
  oldStatus: string;
  newStatus: string;
  caseUrl: string;
}): Promise<SendEmailResult> {
  const { to, ...templateParams } = params;
  const template = caseStatusUpdateTemplate(templateParams);
  return sendEmail({ to, subject: template.subject, html: template.html, text: template.text });
}

/**
 * Send event published email to a list of recipients
 */
export async function sendEventPublishedEmail(params: {
  recipients: string[];
  eventTitle: string;
  eventType: string;
  startDatetime: string;
  location?: string;
  registrationUrl: string;
}): Promise<SendEmailResult> {
  if (!process.env.PARTNER_BULK_EMAIL_ENABLED || process.env.PARTNER_BULK_EMAIL_ENABLED !== 'true') {
    return { success: false, error: 'Bulk email not enabled' };
  }

  const { recipients, ...templateParams } = params;
  if (recipients.length === 0) return { success: true };

  const template = eventPublishedTemplate(templateParams);
  return sendEmail({ to: recipients, subject: template.subject, html: template.html, text: template.text });
}

/**
 * Send invite email to a newly created user
 */
export async function sendUserInviteEmail(params: {
  to: string;
  firstName: string;
  setupUrl: string;
}): Promise<SendEmailResult> {
  const { to, ...templateParams } = params;
  const template = userInviteTemplate(templateParams);
  return sendEmail({ to, subject: template.subject, html: template.html, text: template.text });
}

/**
 * Send case document added email to a partner
 */
export async function sendCaseDocumentAddedEmail(params: {
  to: string;
  firstName: string;
  caseCode: string;
  documentTitle: string;
  caseUrl: string;
}): Promise<SendEmailResult> {
  const { to, ...templateParams } = params;
  const template = caseDocumentAddedTemplate(templateParams);
  return sendEmail({ to, subject: template.subject, html: template.html, text: template.text });
}

/**
 * Send suggestion received confirmation to the submitting partner
 */
export async function sendSuggestionReceivedEmail(params: {
  to: string;
  firstName: string;
  subject: string;
}): Promise<SendEmailResult> {
  const { to, ...templateParams } = params;
  const template = suggestionReceivedTemplate(templateParams);
  return sendEmail({ to, subject: template.subject, html: template.html, text: template.text });
}

/**
 * Send comment mention notification email
 */
export async function sendCommentMentionEmail(params: {
  to: string;
  firstName: string;
  mentionedBy: string;
  entityType: string;
  entityTitle: string;
  commentPreview: string;
  commentUrl: string;
}): Promise<SendEmailResult> {
  const { to, ...templateParams } = params;
  const template = commentMentionTemplate(templateParams);
  return sendEmail({ to, subject: template.subject, html: template.html, text: template.text });
}
