import { baseTemplate, styles } from './base';

interface PartnerWelcomeProps {
  firstName: string;
  companyName: string;
  loginUrl: string;
}

export function partnerWelcomeTemplate({ firstName, companyName, loginUrl }: PartnerWelcomeProps) {
  const content = `
    <h2 style="${styles.heading}">
      Welcome, ${firstName}!
    </h2>

    <p style="${styles.paragraph}">
      Great news! Your partner access request for <strong>${companyName}</strong> has been approved.
    </p>

    <p style="${styles.paragraph}">
      You can now access your partner dashboard to explore training materials, manage cases, access documents, and more.
    </p>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 10px 0 30px;">
          <a href="${loginUrl}" style="${styles.button}">
            Set Up Your Password
          </a>
        </td>
      </tr>
    </table>

    <p style="${styles.paragraphMuted}">
      This link will expire in 24 hours. If it expires, you can request a new one from the login page.
    </p>

    <p style="${styles.paragraphMuted}">
      If you didn't request this account, please ignore this email.
    </p>
  `;

  const text = `
Welcome, ${firstName}!

Great news! Your partner access request for ${companyName} has been approved.

You can now access your partner dashboard to explore training materials, manage cases, access documents, and more.

Click the link below to set up your password and access your account:
${loginUrl}

This link will expire in 24 hours. If it expires, you can request a new one from the login page.

If you didn't request this account, please ignore this email.
  `.trim();

  return {
    subject: `Your Partner Account is Ready`,
    html: baseTemplate({ content, preheader: 'Your partner access has been approved!' }),
    text,
  };
}
