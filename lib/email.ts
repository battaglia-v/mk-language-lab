import { Resend } from 'resend';
import { APP_META } from '@/lib/appMeta';

type ResendClient = { emails: { send: (options: { from: string; to: string; subject: string; html: string }) => Promise<unknown> } };
const resend: ResendClient | null = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@mklanglabs.com';
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
  if (!resend) {
    console.warn('[EMAIL] Resend not configured, skipping password reset email');
    return { success: false, error: 'Email service not configured' };
  }

  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;
  const greeting = name ? `Hi ${name},` : 'Hi,';

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
  if (!resend) {
    console.warn('[EMAIL] Resend not configured, skipping verification email');
    return { success: false, error: 'Email service not configured' };
  }

  const verifyUrl = `${appUrl}/auth/verify-email?token=${token}`;
  const greeting = name ? `Hi ${name},` : 'Hi,';

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
