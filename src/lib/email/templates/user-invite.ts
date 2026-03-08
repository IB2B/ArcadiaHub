import { baseTemplate, styles } from './base';

interface UserInviteProps {
  firstName: string;
  setupUrl: string;
}

export function userInviteTemplate({ firstName, setupUrl }: UserInviteProps) {
  const content = `
    <h2 style="${styles.heading}">You've been invited, ${firstName}!</h2>

    <p style="${styles.paragraph}">
      You've been invited to join Arcadia Hub. Click the button below to set up your password and access your account.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 10px 0 30px;">
          <a href="${setupUrl}" style="${styles.button}">
            Set Up Your Account
          </a>
        </td>
      </tr>
    </table>

    <p style="${styles.paragraphMuted}">
      This link will expire in 24 hours. If it expires, please contact your administrator.
    </p>

    <p style="${styles.paragraphMuted}">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
  `;

  const text = `
You've been invited, ${firstName}!

You've been invited to join Arcadia Hub. Click the link below to set up your password and access your account.

${setupUrl}

This link will expire in 24 hours. If it expires, please contact your administrator.

If you didn't expect this invitation, you can safely ignore this email.
  `.trim();

  return {
    subject: `You're invited to Arcadia Hub`,
    html: baseTemplate({ content, preheader: "You've been invited to join Arcadia Hub." }),
    text,
  };
}
