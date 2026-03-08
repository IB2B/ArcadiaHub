import { baseTemplate, styles } from './base';

interface CaseStatusUpdateProps {
  firstName: string;
  caseCode: string;
  oldStatus: string;
  newStatus: string;
  caseUrl: string;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  SUSPENDED: 'Suspended',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function caseStatusUpdateTemplate({ firstName, caseCode, oldStatus, newStatus, caseUrl }: CaseStatusUpdateProps) {
  const oldLabel = statusLabels[oldStatus] || oldStatus;
  const newLabel = statusLabels[newStatus] || newStatus;

  const content = `
    <h2 style="${styles.heading}">Case status updated</h2>

    <p style="${styles.paragraph}">
      Hi ${firstName}, the status of case <strong>${caseCode}</strong> has been updated.
    </p>

    <div style="${styles.note}">
      <p style="margin: 0; color: #4a5568; font-size: 15px;">
        <span style="color: #718096;">${oldLabel}</span>
        &nbsp;→&nbsp;
        <strong style="color: #1a1a2e;">${newLabel}</strong>
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 20px 0 30px;">
          <a href="${caseUrl}" style="${styles.button}">
            View Case
          </a>
        </td>
      </tr>
    </table>

    <p style="${styles.paragraphMuted}">
      Log in to your partner dashboard to view full case details and history.
    </p>
  `;

  const text = `
Case status updated

Hi ${firstName}, the status of case ${caseCode} has been updated.

${oldLabel} → ${newLabel}

View the case: ${caseUrl}
  `.trim();

  return {
    subject: `Case ${caseCode} — Status updated to ${newLabel}`,
    html: baseTemplate({ content, preheader: `Case ${caseCode} status changed to ${newLabel}.` }),
    text,
  };
}
