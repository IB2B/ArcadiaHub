import { baseTemplate, styles } from './base';

interface SuggestionReceivedTemplateProps {
  firstName: string;
  subject: string;
}

export function suggestionReceivedTemplate({ firstName, subject }: SuggestionReceivedTemplateProps) {
  const content = `
    <h2 style="${styles.heading}">We Received Your Feedback</h2>
    <p style="${styles.paragraph}">Hi ${firstName},</p>
    <p style="${styles.paragraph}">Thank you for taking the time to share your feedback. We've received your suggestion:</p>
    <div style="${styles.note}">
      <p style="margin: 0; color: #4a5568; font-size: 16px; font-weight: 500;">${subject}</p>
    </div>
    <p style="${styles.paragraph}">Our team will review it carefully. We appreciate your input in helping us improve the platform.</p>
    <p style="${styles.paragraphMuted}">You can track the status of your suggestions from your dashboard at any time.</p>
  `;

  return {
    subject: `We received your feedback`,
    html: baseTemplate({ content, preheader: 'Your suggestion has been received and is under review.' }),
    text: `Hi ${firstName},\n\nThank you for your feedback. We've received your suggestion: "${subject}".\n\nOur team will review it and get back to you if needed.`,
  };
}
