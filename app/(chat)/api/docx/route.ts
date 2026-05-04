import { NextRequest, NextResponse } from 'next/server';
import HTMLtoDOCX from 'html-to-docx';
import { marked } from 'marked';

export async function POST(req: NextRequest) {
  try {
    const { content, title, isHtml } = await req.json();

    if (!content || !title) {
      return new NextResponse('Missing content or title', { status: 400 });
    }

    // Use marked for markdown to HTML conversion if not already HTML
    const htmlBody = isHtml ? content : await marked.parse(content);

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.5; color: #333; }
          h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px; margin-top: 20pt; }
          h2 { color: #1e3a8a; margin-top: 18pt; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          h3 { color: #1d4ed8; margin-top: 16pt; }
          p { margin-bottom: 10pt; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15pt; }
          th { background-color: #f3f4f6; color: #111827; font-weight: bold; padding: 6pt; border: 1px solid #d1d5db; text-align: left; }
          td { padding: 6pt; border: 1px solid #d1d5db; vertical-align: top; }
          code { font-family: 'Courier New', monospace; background-color: #f1f5f9; color: #ef4444; padding: 1pt 2pt; }
          pre { background-color: #1e293b; color: #f8fafc; padding: 10pt; font-family: 'Courier New', monospace; font-size: 9pt; }
          .title-page { text-align: center; margin-top: 50pt; margin-bottom: 50pt; }
          .confidential { color: #b91c1c; font-weight: bold; border: 1px solid #b91c1c; padding: 10pt; margin-top: 30pt; }
        </style>
      </head>
      <body>
        <div class="title-page">
          <h1 style="font-size: 32pt; border: none;">${title}</h1>
          <p style="font-size: 16pt; color: #4b5563;">Security Assessment & Penetration Testing Report</p>
          <div style="margin-top: 100pt;">
            <p><strong>Prepared By:</strong></p>
            <p style="color: #1e40af; font-size: 14pt;">Kali AI Autonomous Security Framework</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="confidential">
            <p>CONFIDENTIAL DOCUMENT</p>
            <p style="font-size: 9pt; font-weight: normal;">This document contains sensitive security information. Unauthorized disclosure is strictly prohibited.</p>
          </div>
        </div>
        <div style="page-break-after: always;"></div>
        ${htmlBody}
      </body>
      </html>
    `;

    const docxBuffer = await HTMLtoDOCX(fullHtml, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    }, `
      <div style="text-align: center; font-size: 10pt; color: #888;">
        <p>CONFIDENTIAL - This report is generated for authorized security assessment purposes only.</p>
      </div>
    `);

    return new Response(docxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.docx"`,
      },
    });
  } catch (error) {
    console.error('DOCX generation error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
