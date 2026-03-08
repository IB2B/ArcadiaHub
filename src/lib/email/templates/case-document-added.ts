import { baseTemplate, styles } from './base';

interface CaseDocumentAddedTemplateProps {
  firstName: string;
  caseCode: string;
  documentTitle: string;
  caseUrl: string;
}

export function caseDocumentAddedTemplate({ firstName, caseCode, documentTitle, caseUrl }: CaseDocumentAddedTemplateProps) {
  const content = `
    <h2 style="${styles.heading}">New Document Added to Your Case</h2>
    <p style="${styles.paragraph}">Hi ${firstName},</p>
    <p style="${styles.paragraph}">A new document has been added to your case <strong>${caseCode}</strong>:</p>
    <div style="${styles.note}">
      <p style="margin: 0; color: #4a5568; font-size: 16px; font-weight: 500;">${documentTitle}</p>
    </div>
    <p style="${styles.paragraph}">Click the button below to view your case and download the document.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${caseUrl}" style="${styles.button}">View Case</a>
    </p>
    <p style="${styles.paragraphMuted}">If you have questions about this document, please contact your account manager.</p>
  `;

  return {
    subject: `New document added to case ${caseCode}`,
    html: baseTemplate({ content, preheader: `"${documentTitle}" has been added to case ${caseCode}` }),
    text: `Hi ${firstName},\n\nA new document "${documentTitle}" has been added to your case ${caseCode}.\n\nView it here: ${caseUrl}`,
  };
}
