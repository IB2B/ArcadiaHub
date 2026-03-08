import { baseTemplate, styles } from './base';

interface AccessRequestRejectionProps {
  firstName: string;
  companyName: string;
  reviewNotes?: string;
}

export function accessRequestRejectionTemplate({ firstName, companyName, reviewNotes }: AccessRequestRejectionProps) {
  const content = `
    <h2 style="${styles.heading}">Update on your access request</h2>

    <p style="${styles.paragraph}">
      Hi ${firstName}, thank you for your interest in the Arcadia Hub partner programme.
    </p>

    <p style="${styles.paragraph}">
      After reviewing your application for <strong>${companyName}</strong>, we regret to inform you that we are unable to approve your request at this time.
    </p>

    ${reviewNotes ? `
    <div style="${styles.note}">
      <p style="margin: 0 0 6px; color: #4a5568; font-size: 14px; font-weight: 600;">Review notes:</p>
      <p style="margin: 0; color: #4a5568; font-size: 14px;">${reviewNotes}</p>
    </div>
    ` : ''}

    <p style="${styles.paragraphMuted}">
      If you believe this decision was made in error or if you would like to provide additional information, please contact our support team.
    </p>
  `;

  const text = `
Update on your access request

Hi ${firstName}, thank you for your interest in the Arcadia Hub partner programme.

After reviewing your application for ${companyName}, we regret to inform you that we are unable to approve your request at this time.

${reviewNotes ? `Review notes:\n${reviewNotes}\n` : ''}
If you believe this decision was made in error or if you would like to provide additional information, please contact our support team.
  `.trim();

  return {
    subject: `Your partner access request for ${companyName}`,
    html: baseTemplate({ content, preheader: 'An update on your partner access request.' }),
    text,
  };
}
