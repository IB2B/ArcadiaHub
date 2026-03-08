import { baseTemplate, styles } from './base';

interface AccessRequestReceivedProps {
  firstName: string;
  companyName: string;
}

export function accessRequestReceivedTemplate({ firstName, companyName }: AccessRequestReceivedProps) {
  const content = `
    <h2 style="${styles.heading}">We received your request, ${firstName}!</h2>

    <p style="${styles.paragraph}">
      Thank you for submitting a partner access request for <strong>${companyName}</strong>.
    </p>

    <p style="${styles.paragraph}">
      Our team will review your application and get back to you as soon as possible. This typically takes 1–3 business days.
    </p>

    <div style="${styles.note}">
      <p style="margin: 0; color: #4a5568; font-size: 14px;">
        You'll receive an email notification once your request has been reviewed.
      </p>
    </div>

    <p style="${styles.paragraphMuted}">
      If you have any questions in the meantime, please don't hesitate to reach out to our support team.
    </p>
  `;

  const text = `
We received your request, ${firstName}!

Thank you for submitting a partner access request for ${companyName}.

Our team will review your application and get back to you as soon as possible. This typically takes 1–3 business days.

You'll receive an email notification once your request has been reviewed.

If you have any questions in the meantime, please don't hesitate to reach out to our support team.
  `.trim();

  return {
    subject: `We received your access request — ${companyName}`,
    html: baseTemplate({ content, preheader: 'Your partner access request has been received.' }),
    text,
  };
}
