import { baseTemplate, styles } from './base';

interface PasswordResetProps {
  firstName?: string;
  resetUrl: string;
}

export function passwordResetTemplate({ firstName, resetUrl }: PasswordResetProps) {
  const greeting = firstName ? `Hello ${firstName},` : 'Hello,';

  const content = `
    <h2 style="${styles.heading}">
      ${greeting}
    </h2>

    <p style="${styles.paragraph}">
      We received a request to reset your password. Click the button below to create a new password.
    </p>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 10px 0 30px;">
          <a href="${resetUrl}" style="${styles.button}">
            Reset Password
          </a>
        </td>
      </tr>
    </table>

    <p style="${styles.paragraphMuted}">
      This link will expire in 1 hour. If it expires, you can request a new one from the login page.
    </p>

    <p style="${styles.paragraphMuted}">
      If you didn't request a password reset, you can safely ignore this email.
    </p>
  `;

  const text = `
${greeting}

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour. If it expires, you can request a new one from the login page.

If you didn't request a password reset, you can safely ignore this email.
  `.trim();

  return {
    subject: 'Reset Your Password',
    html: baseTemplate({ content, preheader: 'Reset your password' }),
    text,
  };
}
