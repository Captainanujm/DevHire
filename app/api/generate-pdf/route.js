// app/api/generate-pdf/route.js

import { NextResponse } from 'next/server';
import Template1 from '../../resume-builder/Template1';

// 🛑 IMPORTANT: The problem imports are REMOVED from the top of the file.

export async function POST(request) {
  
  // 🛠️ FIX: Dynamic imports for server-side dependencies to bypass Next.js build checks
  const ReactDOMServer = (await import('react-dom/server')).default;
  const html_to_pdf = (await import('html-pdf-node')).default; 
  
  try {
    const resumeData = await request.json();
    const { template, ...data } = resumeData;

    let ResumeComponent;
    if (template === 'Template1') {
      // Ensure Template1 is imported correctly
      ResumeComponent = Template1;
    } else {
      return NextResponse.json({ message: 'Invalid template selected' }, { status: 400 });
    }

    // 1. Render the React component (Server Component) to a raw HTML string
    // This is the line that required the previous troublesome import
    const componentHtml = ReactDOMServer.renderToString(<ResumeComponent data={data} />);
    
    // 2. Wrap the component HTML in a full document structure
    const finalHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>DevHire Resume</title>
      </head>
      <body>
          <div class="resume-wrapper">${componentHtml}</div>
      </body>
      </html>
    `;

    // 3. Configure PDF Options
    const file = { content: finalHtml };
    const options = { 
        format: 'A4',
        printBackground: true, 
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
    };

    // 4. Generate the PDF buffer
    const pdfBuffer = await html_to_pdf.generatePdf(file, options); // This also relies on dynamic import

    // 5. Return the PDF buffer
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${data.basicInfo?.name || 'DevHire'}_Resume.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF Generation Failed:', error);
    return NextResponse.json(
      { message: 'Internal Server Error during PDF generation or data processing.' },
      { status: 500 }
    );
  }
}