import { Resend } from 'resend';
import { APP_META } from '@/lib/appMeta';

type ResendClient = { emails: { send: (options: { from: string; to: string; subject: string; html: string }) => Promise<unknown> } };

// Initialize Resend client lazily to ensure env vars are loaded
function getResendClient(): ResendClient | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[EMAIL] RESEND_API_KEY not configured');
    return null;
  }
  return new Resend(apiKey);
}

// Use Resend's default domain if custom domain not configured
// Once domain is verified in Resend, set RESEND_FROM_EMAIL=noreply@mklanguage.com
function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
}

const appName = APP_META.storeName;
const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Send password reset email with secure token link
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name?: string | null
): Promise<EmailResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn('[EMAIL] Resend not configured, skipping password reset email');
    return { success: false, error: 'Email service not configured' };
  }

  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const fromEmail = getFromEmail();

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Reset your ${appName} password`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🇲🇰 ${appName}</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">${greeting}</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Can't click the button? Copy this link:<br>
              <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log('[EMAIL] Password reset email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Failed to send password reset email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send email verification email with secure token link
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string | null
): Promise<EmailResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn('[EMAIL] Resend not configured, skipping verification email');
    return { success: false, error: 'Email service not configured' };
  }

  const verifyUrl = `${appUrl}/auth/verify-email?token=${token}`;
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const fromEmail = getFromEmail();

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Verify your ${appName} email`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🇲🇰 ${appName}</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">${greeting}</p>
            <p>Welcome to ${appName}! Please verify your email address to get started with your Macedonian learning journey:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Verify Email</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
            <p style="color: #6b7280; font-size: 14px;">If you didn't create an account with us, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Can't click the button? Copy this link:<br>
              <a href="${verifyUrl}" style="color: #dc2626; word-break: break-all;">${verifyUrl}</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log('[EMAIL] Verification email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Failed to send verification email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send feedback notification email to admin
 */
export async function sendFeedbackNotification(
  feedbackData: {
    type: string;
    message: string;
    email?: string | null;
    rating?: number;
    context?: {
      page?: string;
      userAgent?: string;
      locale?: string;
    };
    userId?: string | null;
    userName?: string | null;
  }
): Promise<EmailResult> {
  const resend = getResendClient();
  const fromEmail = getFromEmail();
  
  console.log('[EMAIL] Feedback notification - checking configuration:', {
    hasApiKey: !!process.env.RESEND_API_KEY,
    fromEmail,
    resendInitialized: !!resend,
  });

  if (!resend) {
    console.warn('[EMAIL] Resend not configured, skipping feedback notification');
    return { success: false, error: 'Email service not configured' };
  }

  const adminEmail = process.env.FEEDBACK_EMAIL || process.env.SUPPORT_EMAIL || 'contact@mklanguage.com';
  const typeLabel = feedbackData.type.charAt(0).toUpperCase() + feedbackData.type.slice(1);
  const ratingStars = feedbackData.rating ? '⭐'.repeat(feedbackData.rating) : 'Not rated';

  console.log('[EMAIL] Attempting to send feedback notification:', {
    from: fromEmail,
    to: adminEmail,
  });

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `[${typeLabel}] New Feedback - ${appName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📬 New ${typeLabel} Feedback</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 100px;">Type:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${typeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Rating:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${ratingStars}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${feedbackData.email || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600;">User:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${feedbackData.userName || feedbackData.userId || 'Anonymous'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Page:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${feedbackData.context?.page || 'Unknown'}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
              <p style="margin: 0 0 10px 0; font-weight: 600;">Message:</p>
              <p style="margin: 0; white-space: pre-wrap;">${feedbackData.message}</p>
            </div>
            ${feedbackData.email ? `
            <div style="margin-top: 20px; text-align: center;">
              <a href="mailto:${feedbackData.email}?subject=Re: Your feedback on ${appName}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reply to User</a>
            </div>
            ` : ''}
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Submitted at: ${new Date().toISOString()}<br>
              User Agent: ${feedbackData.context?.userAgent || 'Unknown'}
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log('[EMAIL] Feedback notification sent to:', adminEmail, 'Result:', JSON.stringify(result));
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Failed to send feedback notification:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
