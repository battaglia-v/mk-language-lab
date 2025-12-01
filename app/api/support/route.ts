import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { supportRateLimit, checkRateLimit } from '@/lib/rate-limit';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SUPPORT_EMAIL = 'vpbattaglia@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Validation schema
const supportRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  errorDetails: z.object({
    message: z.string().optional(),
    digest: z.string().optional(),
    stack: z.string().optional(),
  }).optional(),
});

type SupportRequest = z.infer<typeof supportRequestSchema>;

function formatEmailHtml(data: SupportRequest): string {
  const { name, email, subject, description, errorDetails } = data;

  let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #D7263D 0%, #F7C948 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-top: none;
          }
          .section {
            background: white;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 6px;
            border-left: 4px solid #D7263D;
          }
          .label {
            font-weight: 600;
            color: #D7263D;
            margin-bottom: 5px;
          }
          .error-section {
            background: #fff5f5;
            padding: 15px;
            margin-top: 20px;
            border-radius: 6px;
            border: 2px solid #D7263D;
          }
          .error-label {
            font-weight: 600;
            color: #D7263D;
            margin-bottom: 10px;
          }
          pre {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 12px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">Support Request</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Macedonian Learning App</p>
        </div>

        <div class="content">
          <div class="section">
            <div class="label">Subject</div>
            <div>${subject}</div>
          </div>

          <div class="section">
            <div class="label">From</div>
            <div>${name} (${email})</div>
          </div>

          <div class="section">
            <div class="label">Description</div>
            <div style="white-space: pre-wrap;">${description}</div>
          </div>
  `;

  if (errorDetails && (errorDetails.message || errorDetails.digest || errorDetails.stack)) {
    html += `
          <div class="error-section">
            <div class="error-label">Error Details</div>
    `;

    if (errorDetails.message) {
      html += `
            <div style="margin-bottom: 10px;">
              <strong>Error Message:</strong>
              <pre>${errorDetails.message}</pre>
            </div>
      `;
    }

    if (errorDetails.digest) {
      html += `
            <div style="margin-bottom: 10px;">
              <strong>Error ID:</strong>
              <pre>${errorDetails.digest}</pre>
            </div>
      `;
    }

    if (errorDetails.stack) {
      html += `
            <div>
              <strong>Stack Trace:</strong>
              <pre>${errorDetails.stack}</pre>
            </div>
      `;
    }

    html += `
          </div>
    `;
  }

  html += `
        </div>

        <div class="footer">
          <p>This support request was sent via the Macedonian Learning App error handling system.</p>
        </div>
      </body>
    </html>
  `;

  return html;
}

function formatEmailText(data: SupportRequest): string {
  const { name, email, subject, description, errorDetails } = data;

  let text = `
SUPPORT REQUEST - Macedonian Learning App
==========================================

Subject: ${subject}
From: ${name} (${email})

Description:
${description}
`;

  if (errorDetails && (errorDetails.message || errorDetails.digest || errorDetails.stack)) {
    text += `

ERROR DETAILS
=============
`;

    if (errorDetails.message) {
      text += `
Error Message:
${errorDetails.message}
`;
    }

    if (errorDetails.digest) {
      text += `
Error ID: ${errorDetails.digest}
`;
    }

    if (errorDetails.stack) {
      text += `
Stack Trace:
${errorDetails.stack}
`;
    }
  }

  text += `

--
This support request was sent via the Macedonian Learning App error handling system.
`;

  return text;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent spam
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await checkRateLimit(supportRateLimit, ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = supportRequestSchema.parse(body);

    // Check if Resend is configured
    if (!resend) {
      console.error('Resend API key not configured');
      // Log the support request for manual follow-up
      console.log('Support request (email not sent):', {
        ...validatedData,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        { error: 'Email service not configured. Your request has been logged.' },
        { status: 503 }
      );
    }

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: SUPPORT_EMAIL,
      replyTo: validatedData.email,
      subject: `Support Request: ${validatedData.subject}`,
      html: formatEmailHtml(validatedData),
      text: formatEmailText(validatedData),
    });

    if (emailResult.error) {
      console.error('Failed to send support email:', emailResult.error);

      // Log the support request for manual follow-up
      console.log('Support request (email failed):', {
        ...validatedData,
        timestamp: new Date().toISOString(),
        emailError: emailResult.error,
      });

      return NextResponse.json(
        { error: 'Failed to send support request. Please try again later.' },
        { status: 500 }
      );
    }

    // Log successful submission
    console.log('Support request sent successfully:', {
      emailId: emailResult.data?.id,
      from: validatedData.email,
      subject: validatedData.subject,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Support request sent successfully',
        emailId: emailResult.data?.id,
      },
      { status: 200 }
    );

  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Error processing support request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
