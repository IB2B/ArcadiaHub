import { baseTemplate, styles } from './base';

interface NotificationProps {
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export function notificationTemplate({ title, message, actionUrl, actionLabel }: NotificationProps) {
  const buttonHtml = actionUrl && actionLabel ? `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 10px 0 30px;">
          <a href="${actionUrl}" style="${styles.button}">
            ${actionLabel}
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  const content = `
    <h2 style="${styles.heading}">
      ${title}
    </h2>

    <p style="${styles.paragraph}">
      ${message}
    </p>

    ${buttonHtml}
  `;

  const text = `
${title}

${message}

${actionUrl ? `${actionLabel}: ${actionUrl}` : ''}
  `.trim();

  return {
    subject: title,
    html: baseTemplate({ content, preheader: message.substring(0, 100) }),
    text,
  };
}
