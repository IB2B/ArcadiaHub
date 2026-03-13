import { baseTemplate, styles } from './base';

interface UserInviteProps {
  firstName: string;
  companyName: string;
  invitedByName: string;
  setupUrl: string;
}

export function userInviteTemplate({ firstName, companyName, invitedByName, setupUrl }: UserInviteProps) {
  const content = `
    <h2 style="${styles.heading}">
      You've Been Invited
    </h2>

    <p style="${styles.paragraph}">
      Hi ${firstName}, <strong>${invitedByName}</strong> has invited you to join the <strong>${companyName}</strong> account on the partner platform.
    </p>

    <p style="${styles.paragraph}">
      Click the button below to set up your password and access your account.
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
      This invitation link will expire in 24 hours. If it expires, please contact your account manager to resend the invite.
    </p>

    <p style="${styles.paragraphMuted}">
      If you didn't expect this invitation, please ignore this email.
    </p>
  `;

  const text = `
You've Been Invited

Hi ${firstName}, ${invitedByName} has invited you to join the ${companyName} account on the partner platform.

Click the link below to set up your password and access your account:
${setupUrl}

This invitation link will expire in 24 hours. If it expires, please contact your account manager to resend the invite.

If you didn't expect this invitation, please ignore this email.
  `.trim();

  return {
    subject: `You've been invited to ${companyName}'s partner account`,
    html: baseTemplate({ content, preheader: `${invitedByName} invited you to join ${companyName}.` }),
    text,
  };
}
