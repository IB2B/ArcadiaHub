import { baseTemplate, styles } from './base';

interface EventPublishedProps {
  eventTitle: string;
  eventType: string;
  startDatetime: string;
  location?: string;
  registrationUrl: string;
}

export function eventPublishedTemplate({ eventTitle, eventType, startDatetime, location, registrationUrl }: EventPublishedProps) {
  const eventDate = new Date(startDatetime).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const eventTime = new Date(startDatetime).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const content = `
    <h2 style="${styles.heading}">New ${eventType.toLowerCase()}: ${eventTitle}</h2>

    <p style="${styles.paragraph}">
      A new event has been published and is available for registration.
    </p>

    <div style="${styles.note}">
      <p style="margin: 0 0 8px; color: #4a5568; font-size: 14px;">
        <strong>Date:</strong> ${eventDate} at ${eventTime}
      </p>
      ${location ? `<p style="margin: 0; color: #4a5568; font-size: 14px;"><strong>Location:</strong> ${location}</p>` : ''}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 20px 0 30px;">
          <a href="${registrationUrl}" style="${styles.button}">
            View &amp; Register
          </a>
        </td>
      </tr>
    </table>

    <p style="${styles.paragraphMuted}">
      Log in to your partner dashboard to register and view full event details.
    </p>
  `;

  const text = `
New ${eventType.toLowerCase()}: ${eventTitle}

A new event has been published and is available for registration.

Date: ${eventDate} at ${eventTime}${location ? `\nLocation: ${location}` : ''}

Register here: ${registrationUrl}
  `.trim();

  return {
    subject: `New event: ${eventTitle}`,
    html: baseTemplate({ content, preheader: `New event published — ${eventTitle}` }),
    text,
  };
}
