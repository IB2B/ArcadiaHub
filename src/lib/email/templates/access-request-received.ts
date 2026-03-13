import { baseTemplate, styles } from './base';

interface AccessRequestReceivedProps {
  firstName: string;
  companyName: string;
}

export function accessRequestReceivedTemplate({ firstName, companyName }: AccessRequestReceivedProps) {
  const content = `
    <h2 style="${styles.heading}">
      Request Received, ${firstName}!
    </h2>

    <p style="${styles.paragraph}">
      Thank you for submitting an access request for <strong>${companyName}</strong>.
      We have received your application and our team is reviewing it.
    </p>

    <p style="${styles.paragraph}">
      You will receive an email once your request has been reviewed, typically within 2–3 business days.
    </p>

    <div style="${styles.note}">
      <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
        If you have any questions in the meantime, please don't hesitate to contact our support team.
      </p>
    </div>

    <p style="${styles.paragraphMuted}">
      If you did not submit this request, please ignore this email.
    </p>
  `;

  const text = `
Request Received, ${firstName}!

Thank you for submitting an access request for ${companyName}. We have received your application and our team is reviewing it.

You will receive an email once your request has been reviewed, typically within 2-3 business days.

If you have any questions in the meantime, please don't hesitate to contact our support team.

If you did not submit this request, please ignore this email.
  `.trim();

  return {
    subject: `Access Request Received — ${companyName}`,
    html: baseTemplate({ content, preheader: 'We received your access request and are reviewing it.' }),
    text,
  };
}
