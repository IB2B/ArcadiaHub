import { baseTemplate, styles } from './base';

interface CommentMentionProps {
  firstName: string;
  mentionedBy: string;
  entityType: string;
  entityTitle: string;
  commentPreview: string;
  commentUrl: string;
}

const entityLabels: Record<string, string> = {
  case: 'case',
  blog_post: 'blog post',
  event: 'event',
  academy_content: 'academy content',
};

export function commentMentionTemplate({ firstName, mentionedBy, entityType, entityTitle, commentPreview, commentUrl }: CommentMentionProps) {
  const entityLabel = entityLabels[entityType] || entityType;

  const content = `
    <h2 style="${styles.heading}">You were mentioned in a comment</h2>

    <p style="${styles.paragraph}">
      Hi ${firstName}, <strong>${mentionedBy}</strong> mentioned you in a comment on the ${entityLabel} <strong>"${entityTitle}"</strong>.
    </p>

    <div style="${styles.note}">
      <p style="margin: 0; color: #4a5568; font-size: 14px; font-style: italic;">"${commentPreview}"</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 20px 0 30px;">
          <a href="${commentUrl}" style="${styles.button}">
            View Comment
          </a>
        </td>
      </tr>
    </table>

    <p style="${styles.paragraphMuted}">
      You can reply directly from your partner dashboard.
    </p>
  `;

  const text = `
You were mentioned in a comment

Hi ${firstName}, ${mentionedBy} mentioned you in a comment on the ${entityLabel} "${entityTitle}".

"${commentPreview}"

View the comment: ${commentUrl}
  `.trim();

  return {
    subject: `${mentionedBy} mentioned you in a comment`,
    html: baseTemplate({ content, preheader: `${mentionedBy} mentioned you in a comment.` }),
    text,
  };
}
