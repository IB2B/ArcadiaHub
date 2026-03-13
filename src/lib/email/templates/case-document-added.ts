import { baseTemplate, styles } from './base';

interface CaseDocumentAddedProps {
  firstName: string;
  caseCode: string;
  documentTitle: string;
  caseUrl: string;
}

export function caseDocumentAddedTemplate({
  firstName,
  caseCode,
  documentTitle,
  caseUrl,
}: CaseDocumentAddedProps) {
  const content = `
    <h2 style="${styles.heading}">
      New Document Added
    </h2>

    <p style="${styles.paragraph}">
      Hi ${firstName}, a new document has been added to your case <strong>${caseCode}</strong>.
    </p>

    <div style="${styles.note}">
      <p style="margin: 0; color: #4a5568; font-size: 14px;">
        <strong>Document:</strong> ${documentTitle}
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 10px 0 30px;">
          <a href="${caseUrl}" style="${styles.button}">
            View Case Documents
          </a>
        </td>
      </tr>
    </table>

    <p style="${styles.paragraphMuted}">
      Log in to your dashboard to view and download the document.
    </p>
  `;

  const text = `
New Document Added

Hi ${firstName}, a new document has been added to your case ${caseCode}.

Document: ${documentTitle}

View your case documents: ${caseUrl}

Log in to your dashboard to view and download the document.
  `.trim();

  return {
    subject: `New Document for Case ${caseCode}`,
    html: baseTemplate({ content, preheader: `A new document has been added to case ${caseCode}.` }),
    text,
  };
}
