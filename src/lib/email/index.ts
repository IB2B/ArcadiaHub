import { sendEmail, SendEmailResult } from './send';
import { partnerWelcomeTemplate } from './templates/partner-welcome';
import { passwordResetTemplate } from './templates/password-reset';
import { notificationTemplate } from './templates/notification';
import { accessRequestReceivedTemplate } from './templates/access-request-received';
import { accessRequestRejectionTemplate } from './templates/access-request-rejection';
import { caseStatusUpdateTemplate } from './templates/case-status-update';
import { caseDocumentAddedTemplate } from './templates/case-document-added';
import { userInviteTemplate } from './templates/user-invite';
import { suggestionReceivedTemplate } from './templates/suggestion-received';
import { suggestionReplyTemplate } from './templates/suggestion-reply';

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
 * Send confirmation email to access request applicant
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
 * Send rejection email to access request applicant
 */
export async function sendAccessRequestRejectionEmail(params: {
  to: string;
  firstName: string;
  companyName: string;
  reason?: string;
}): Promise<SendEmailResult> {
  const template = accessRequestRejectionTemplate(params);
  return sendEmail({ to: params.to, subject: template.subject, html: template.html, text: template.text });
}

/**
 * Send case status update email to partner
 */
export async function sendCaseStatusUpdateEmail(params: {
  to: string;
  firstName: string;
  caseCode: string;
  clientName: string;
  oldStatus: string;
  newStatus: string;
  notes?: string;
  caseUrl: string;
}): Promise<SendEmailResult> {
  const template = caseStatusUpdateTemplate(params);
  return sendEmail({ to: params.to, subject: template.subject, html: template.html, text: template.text });
}

/**
 * Send case document added email to partner
 */
export async function sendCaseDocumentAddedEmail(params: {
  to: string;
  firstName: string;
  caseCode: string;
  documentTitle: string;
  caseUrl: string;
}): Promise<SendEmailResult> {
  const template = caseDocumentAddedTemplate(params);
  return sendEmail({ to: params.to, subject: template.subject, html: template.html, text: template.text });
}

/**
 * Send sub-user invite email
 */
export async function sendUserInviteEmail(params: {
  to: string;
  firstName: string;
  companyName: string;
  invitedByName: string;
  setupUrl: string;
}): Promise<SendEmailResult> {
  const template = userInviteTemplate(params);
  return sendEmail({ to: params.to, subject: template.subject, html: template.html, text: template.text });
}

/**
 * Send new suggestion notification email to admins
 */
export async function sendSuggestionReceivedEmail(params: {
  to: string | string[];
  firstName: string;
  subject: string;
  adminUrl: string;
}): Promise<SendEmailResult> {
  const template = suggestionReceivedTemplate(params);
  return sendEmail({ to: params.to, subject: template.subject, html: template.html, text: template.text });
}

/**
 * Send suggestion reply email to partner
 */
export async function sendSuggestionReplyEmail(params: {
  to: string;
  firstName: string;
  subject: string;
  reply: string;
  suggestionUrl: string;
}): Promise<SendEmailResult> {
  const template = suggestionReplyTemplate(params);
  return sendEmail({ to: params.to, subject: template.subject, html: template.html, text: template.text });
}
