import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { supportRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { APP_META } from '@/lib/appMeta';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'contact@mklanguage.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@mklanguage.com';

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
  const timestamp = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support Request</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.4);">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #F7C948 0%, #ff8c00 100%); padding: 32px 24px; text-align: center;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="text-align: center;">
                          <div style="width: 64px; height: 64px; margin: 0 auto 12px auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                            <img src="https://mklanguage.com/icon-192.png" alt="" width="64" height="64" style="display: block; width: 64px; height: 64px;" />
                          </div>
                          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #000; letter-spacing: -0.5px;">New Support Request</h1>
                          <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(0,0,0,0.7);">${APP_META.storeName}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px 24px;">

                    <!-- Subject -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #252525; border-radius: 12px; padding: 16px;">
                          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #F7C948; text-transform: uppercase; letter-spacing: 1px;">Subject</p>
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #ffffff;">${subject}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- From -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #252525; border-radius: 12px; padding: 16px;">
                          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #F7C948; text-transform: uppercase; letter-spacing: 1px;">From</p>
                          <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 500;">${name}</p>
                          <p style="margin: 4px 0 0 0; font-size: 14px; color: #888888;">
                            <a href="mailto:${email}" style="color: #F7C948; text-decoration: none;">${email}</a>
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Message -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #252525; border-radius: 12px; padding: 16px;">
                          <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; color: #F7C948; text-transform: uppercase; letter-spacing: 1px;">Message</p>
                          <p style="margin: 0; font-size: 15px; color: #e0e0e0; line-height: 1.6; white-space: pre-wrap;">${description}</p>
                        </td>
                      </tr>
                    </table>
  `;

  if (errorDetails && (errorDetails.message || errorDetails.digest || errorDetails.stack)) {
    html += `
                    <!-- Error Details -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #3d1f1f; border-radius: 12px; padding: 16px; border: 1px solid #5c2a2a;">
                          <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 600; color: #ff6b6b; text-transform: uppercase; letter-spacing: 1px;">⚠️ Error Details</p>
    `;

    if (errorDetails.message) {
      html += `
                          <div style="margin-bottom: 12px;">
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #ff9999; font-weight: 600;">Error Message:</p>
                            <p style="margin: 0; font-size: 13px; color: #ffcccc; background-color: #2d1515; padding: 10px; border-radius: 6px; font-family: 'SF Mono', Monaco, monospace; word-break: break-word;">${errorDetails.message}</p>
                          </div>
      `;
    }

    if (errorDetails.digest) {
      html += `
                          <div style="margin-bottom: 12px;">
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #ff9999; font-weight: 600;">Error ID:</p>
                            <p style="margin: 0; font-size: 13px; color: #ffcccc; background-color: #2d1515; padding: 10px; border-radius: 6px; font-family: 'SF Mono', Monaco, monospace;">${errorDetails.digest}</p>
                          </div>
      `;
    }

    if (errorDetails.stack) {
      html += `
                          <div>
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #ff9999; font-weight: 600;">Stack Trace:</p>
                            <p style="margin: 0; font-size: 11px; color: #ffcccc; background-color: #2d1515; padding: 10px; border-radius: 6px; font-family: 'SF Mono', Monaco, monospace; overflow-x: auto; white-space: pre-wrap; word-break: break-word; max-height: 200px; overflow-y: auto;">${errorDetails.stack}</p>
                          </div>
      `;
    }

    html += `
                        </td>
                      </tr>
                    </table>
    `;
  }

  html += `
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px; background-color: #141414; border-top: 1px solid #333;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="text-align: center;">
                          <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">
                            Sent from <span style="color: #F7C948; font-weight: 600;">${APP_META.storeName}</span>
                          </p>
                          <p style="margin: 0; font-size: 12px; color: #555;">
                            ${timestamp}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
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
