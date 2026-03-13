import { baseTemplate, styles } from './base';

interface CaseStatusUpdateProps {
  firstName: string;
  caseCode: string;
  clientName: string;
  oldStatus: string;
  newStatus: string;
  notes?: string;
  caseUrl: string;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  SUSPENDED: 'Suspended',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function caseStatusUpdateTemplate({
  firstName,
  caseCode,
  clientName,
  oldStatus,
  newStatus,
  notes,
  caseUrl,
}: CaseStatusUpdateProps) {
  const oldLabel = statusLabels[oldStatus] || oldStatus;
  const newLabel = statusLabels[newStatus] || newStatus;

  const content = `
    <h2 style="${styles.heading}">
      Case Status Updated
    </h2>

    <p style="${styles.paragraph}">
      Hi ${firstName}, the status of case <strong>${caseCode}</strong> (${clientName}) has been updated.
    </p>

    <div style="${styles.note}">
      <p style="margin: 0 0 8px; color: #718096; font-size: 14px;">
        <strong>${oldLabel}</strong> &rarr; <strong>${newLabel}</strong>
      </p>
      ${notes ? `<p style="margin: 0; color: #4a5568; font-size: 14px;">${notes}</p>` : ''}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 10px 0 30px;">
          <a href="${caseUrl}" style="${styles.button}">
            View Case
          </a>
        </td>
      </tr>
    </table>

    <p style="${styles.paragraphMuted}">
      If you have any questions about this update, please contact your account manager.
    </p>
  `;

  const text = `
Case Status Updated

Hi ${firstName}, the status of case ${caseCode} (${clientName}) has been updated.

${oldLabel} → ${newLabel}
${notes ? `Note: ${notes}` : ''}

View your case: ${caseUrl}

If you have any questions about this update, please contact your account manager.
  `.trim();

  return {
    subject: `Case ${caseCode} — Status Updated to ${newLabel}`,
    html: baseTemplate({ content, preheader: `Case ${caseCode} status changed to ${newLabel}.` }),
    text,
  };
}
