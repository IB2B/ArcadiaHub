import { baseTemplate, styles } from './base';

interface AccessRequestRejectionProps {
  firstName: string;
  companyName: string;
  reason?: string;
}

export function accessRequestRejectionTemplate({ firstName, companyName, reason }: AccessRequestRejectionProps) {
  const content = `
    <h2 style="${styles.heading}">
      Access Request Update
    </h2>

    <p style="${styles.paragraph}">
      Dear ${firstName},
    </p>

    <p style="${styles.paragraph}">
      Thank you for your interest in joining our partner network. After careful review, we are unable to approve the access request for <strong>${companyName}</strong> at this time.
    </p>

    ${reason ? `
    <div style="${styles.note}">
      <p style="margin: 0 0 6px; color: #4a5568; font-size: 14px; font-weight: 600;">Reason:</p>
      <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.6;">${reason}</p>
    </div>
    ` : ''}

    <p style="${styles.paragraph}">
      If you believe this decision was made in error or you have additional information to provide, please contact our support team.
    </p>

    <p style="${styles.paragraphMuted}">
      We appreciate your understanding and wish you the best in your endeavors.
    </p>
  `;

  const text = `
Access Request Update

Dear ${firstName},

Thank you for your interest in joining our partner network. After careful review, we are unable to approve the access request for ${companyName} at this time.

${reason ? `Reason: ${reason}\n` : ''}
If you believe this decision was made in error or you have additional information to provide, please contact our support team.

We appreciate your understanding and wish you the best in your endeavors.
  `.trim();

  return {
    subject: `Access Request Update — ${companyName}`,
    html: baseTemplate({ content, preheader: 'An update regarding your partner access request.' }),
    text,
  };
}
