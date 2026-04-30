import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
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
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          :root {
            --primary: #3b82f6;
            --slate-50: #f8fafc;
            --slate-100: #f1f5f9;
            --slate-200: #e2e8f0;
            --slate-300: #cbd5e1;
            --slate-400: #94a3b8;
            --slate-500: #64748b;
            --slate-600: #475569;
            --slate-700: #334155;
            --slate-800: #1e293b;
            --slate-900: #0f172a;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: var(--slate-800);
            margin: 0;
            padding: 0;
            background: white;
            font-size: 11pt;
          }

          .container {
            padding: 25mm 20mm;
            max-width: 170mm;
            margin: 0 auto;
          }

          .header {
            margin-bottom: 50pt;
            text-align: center;
            border-bottom: 2pt solid var(--slate-100);
            padding-bottom: 30pt;
          }

          .report-type {
            font-size: 9pt;
            color: var(--slate-500);
            margin-bottom: 12pt;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 600;
          }

          .title {
            margin: 0;
            font-size: 32pt;
            font-weight: 800;
            color: var(--slate-900);
            line-height: 1.1;
          }

          .meta {
            margin-top: 20pt;
            color: var(--slate-500);
            font-size: 10pt;
          }

          /* Content Styling */
          h1 {
            font-size: 22pt;
            color: var(--slate-900);
            font-weight: 800;
            margin-top: 40pt;
            margin-bottom: 16pt;
            border-bottom: 1px solid var(--slate-200);
            padding-bottom: 8pt;
          }

          h2 {
            font-size: 18pt;
            color: var(--slate-800);
            font-weight: 700;
            margin-top: 32pt;
            margin-bottom: 12pt;
          }

          h3 {
            font-size: 14pt;
            color: var(--slate-700);
            font-weight: 600;
            margin-top: 24pt;
            margin-bottom: 8pt;
          }

          p {
            margin-bottom: 12pt;
          }

          ul, ol {
            margin-bottom: 16pt;
            padding-left: 20pt;
          }

          li {
            margin-bottom: 6pt;
          }

          strong {
            font-weight: 600;
            color: var(--slate-900);
          }

          code {
            font-family: 'SFMono-Regular', Consolas, monospace;
            background: var(--slate-100);
            padding: 2pt 4pt;
            border-radius: 4pt;
            font-size: 9pt;
            color: #e11d48;
          }

          pre {
            background: var(--slate-900);
            color: var(--slate-100);
            padding: 16pt;
            border-radius: 8pt;
            overflow-x: auto;
            margin: 16pt 0;
            font-size: 9pt;
            line-height: 1.4;
          }

          pre code {
            background: transparent;
            color: inherit;
            padding: 0;
            font-size: inherit;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 24pt 0;
            font-size: 9.5pt;
          }

          th {
            background: var(--slate-50);
            font-weight: 700;
            text-align: left;
            border-bottom: 2pt solid var(--slate-200);
            padding: 10pt 8pt;
            color: var(--slate-900);
          }

          td {
            border-bottom: 1px solid var(--slate-100);
            padding: 10pt 8pt;
            vertical-align: top;
          }

          blockquote {
            border-left: 4pt solid var(--primary);
            background: var(--slate-50);
            margin: 16pt 0;
            padding: 12pt 16pt;
            color: var(--slate-700);
            font-style: italic;
          }

          /* Page Control */
          @media print {
            h1, h2, h3 {
              page-break-after: avoid;
            }
            table, pre, blockquote {
              page-break-inside: avoid;
            }
          }

          .footer {
            margin-top: 60pt;
            padding-top: 20pt;
            border-top: 1px solid var(--slate-100);
            font-size: 8.5pt;
            color: var(--slate-400);
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="report-type">Advanced Security Assessment</div>
            <h1 class="title">${title}</h1>
            <p class="meta">Generated by Kali AI Framework &bull; ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
          </div>
          <div class="content">
            ${htmlBody}
          </div>
          <div class="footer">
            CONFIDENTIAL &bull; This report is generated for authorized security assessment purposes only.
            <br/>Generated via Kali AI Platform autonomous engine.
          </div>
        </div>
      </body>
      </html>
    `;

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
      });

      return new NextResponse((pdfBuffer as any), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.pdf"`,
        },
      });
    } finally {
      if (browser) await browser.close();
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
