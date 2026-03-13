import { baseTemplate, styles } from './base';

interface SuggestionReplyProps {
  firstName: string;
  subject: string;
  reply: string;
  suggestionUrl: string;
}

export function suggestionReplyTemplate({ firstName, subject, reply, suggestionUrl }: SuggestionReplyProps) {
  const content = `
    <h2 style="${styles.heading}">
      Reply to Your Suggestion
    </h2>

    <p style="${styles.paragraph}">
      Hi ${firstName}, an admin has replied to your suggestion.
    </p>

    <div style="${styles.note}">
      <p style="margin: 0 0 4px; color: #718096; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Your suggestion</p>
      <p style="margin: 0 0 12px; color: #1a1a2e; font-size: 15px; font-weight: 600;">${subject}</p>
      <p style="margin: 0 0 4px; color: #718096; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Admin reply</p>
      <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.6;">${reply}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 10px 0 30px;">
          <a href="${suggestionUrl}" style="${styles.button}">
            View Your Suggestions
          </a>
        </td>
      </tr>
    </table>
  `;

  const text = `
Reply to Your Suggestion

Hi ${firstName}, an admin has replied to your suggestion.

Your suggestion: ${subject}

Admin reply: ${reply}

View your suggestions: ${suggestionUrl}
  `.trim();

  return {
    subject: `Reply to your suggestion: ${subject}`,
    html: baseTemplate({ content, preheader: 'An admin replied to your suggestion.' }),
    text,
  };
}
