import { baseTemplate, styles } from './base';

interface SuggestionReceivedProps {
  firstName: string;
  subject: string;
  adminUrl: string;
}

export function suggestionReceivedTemplate({ firstName, subject, adminUrl }: SuggestionReceivedProps) {
  const content = `
    <h2 style="${styles.heading}">
      New Suggestion Received
    </h2>

    <p style="${styles.paragraph}">
      A partner has submitted a new suggestion that requires your attention.
    </p>

    <div style="${styles.note}">
      <p style="margin: 0 0 4px; color: #718096; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Subject</p>
      <p style="margin: 0; color: #1a1a2e; font-size: 15px; font-weight: 600;">${subject}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 10px 0 30px;">
          <a href="${adminUrl}" style="${styles.button}">
            Review Suggestion
          </a>
        </td>
      </tr>
    </table>

    <p style="${styles.paragraphMuted}">
      You received this email because you are an administrator of the platform.
    </p>
  `;

  const text = `
New Suggestion Received

A partner has submitted a new suggestion: "${subject}"

Review it here: ${adminUrl}

You received this email because you are an administrator of the platform.
  `.trim();

  return {
    subject: `New Suggestion: ${subject}`,
    html: baseTemplate({ content, preheader: `New partner suggestion: ${subject}` }),
    text,
  };
}
