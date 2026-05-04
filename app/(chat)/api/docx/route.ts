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
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.5; color: #333; }
          h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          h2 { color: #1e3a8a; margin-top: 24pt; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; text-transform: uppercase; }
          h3 { color: #1d4ed8; margin-top: 18pt; }
          h4 { color: #2563eb; font-style: italic; }
          p { margin-bottom: 10pt; text-align: justify; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15pt; }
          th { background-color: #f3f4f6; color: #111827; font-weight: bold; padding: 8pt; border: 1px solid #d1d5db; text-align: left; }
          td { padding: 8pt; border: 1px solid #d1d5db; vertical-align: top; }
          code { font-family: 'Courier New', monospace; background-color: #f1f5f9; color: #ef4444; padding: 2pt 4pt; border-radius: 3pt; }
          pre { background-color: #1e293b; color: #f8fafc; padding: 12pt; border-radius: 6pt; font-family: 'Courier New', monospace; font-size: 9pt; white-space: pre-wrap; }
          .severity-critical { color: #b91c1c; font-weight: bold; }
          .severity-high { color: #c2410c; font-weight: bold; }
          .severity-medium { color: #b45309; font-weight: bold; }
          .severity-low { color: #15803d; font-weight: bold; }
          .title-page { text-align: center; margin-top: 100pt; margin-bottom: 100pt; }
          .footer { font-size: 9pt; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="title-page">
          <h1 style="font-size: 36pt; border: none; margin-bottom: 20pt;">${title}</h1>
          <div style="height: 2px; background-color: #1e40af; width: 50%; margin: 0 auto 20pt;"></div>
          <p style="font-size: 18pt; color: #4b5563; margin-bottom: 40pt;">Security Assessment & Penetration Testing Report</p>
          <div style="margin-top: 100pt;">
            <p style="font-size: 14pt; font-weight: bold;">Prepared By:</p>
            <p style="font-size: 16pt; color: #1e40af;">Kali AI Autonomous Security Framework</p>
            <p style="font-size: 12pt; color: #6b7280;">Date: ${new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
          </div>
          <div style="margin-top: 60pt; border: 1px solid #f87171; padding: 20pt; background-color: #fef2f2; border-radius: 10pt;">
            <p style="color: #b91c1c; font-weight: bold; margin-bottom: 0;">CONFIDENTIAL DOCUMENT</p>
            <p style="font-size: 10pt; color: #7f1d1d; margin-top: 5pt;">This document contains sensitive security information. Unauthorized disclosure is strictly prohibited.</p>
          </div>
        </div>
        <br clear="all" style="page-break-before:always" />
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
        <p>CONFIDENTIAL &bull; This report is generated for authorized security assessment purposes only.</p>
      </div>
    `);

    return new NextResponse((docxBuffer as any), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.docx"`,
      },
    });
  } catch (error) {
    console.error('DOCX generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
