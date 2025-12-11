import { randomBytes, createHash } from 'crypto';
import prisma from '@/lib/prisma';

const PASSWORD_RESET_EXPIRY_HOURS = 1;
const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a token for secure storage
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Create a password reset token for a user
 * Returns the raw token (to send in email) - stores hashed version in DB
 */
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null;
  }

  const token = generateToken();
  const hashedToken = hashToken(token);
  const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000);

  // Delete any existing password reset tokens for this user
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: `password-reset:${email}`,
    },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: `password-reset:${email}`,
      token: hashedToken,
      expires,
    },
  });

  return token;
}

/**
 * Verify a password reset token and return the email if valid
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const hashedToken = hashToken(token);

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token: hashedToken,
      identifier: { startsWith: 'password-reset:' },
      expires: { gt: new Date() },
    },
  });

  if (!verificationToken) {
    return null;
  }

  // Extract email from identifier
  const email = verificationToken.identifier.replace('password-reset:', '');
  return email;
}

/**
 * Consume (delete) a password reset token after successful reset
 */
export async function consumePasswordResetToken(token: string): Promise<void> {
  const hashedToken = hashToken(token);
  await prisma.verificationToken.deleteMany({
    where: { token: hashedToken },
  });
}

/**
 * Create an email verification token for a user
 * Returns the raw token (to send in email) - stores hashed version in DB
 */
export async function createEmailVerificationToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null;
  }

  const token = generateToken();
  const hashedToken = hashToken(token);
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

  // Delete any existing verification tokens for this user
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: `email-verify:${email}`,
    },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: `email-verify:${email}`,
      token: hashedToken,
      expires,
    },
  });

  return token;
}

/**
 * Verify an email verification token and return the email if valid
 */
export async function verifyEmailVerificationToken(token: string): Promise<string | null> {
  const hashedToken = hashToken(token);

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token: hashedToken,
      identifier: { startsWith: 'email-verify:' },
      expires: { gt: new Date() },
    },
  });

  if (!verificationToken) {
    return null;
  }

  // Extract email from identifier
  const email = verificationToken.identifier.replace('email-verify:', '');
  return email;
}

/**
 * Consume (delete) an email verification token and mark user as verified
 */
export async function consumeEmailVerificationToken(token: string): Promise<boolean> {
  const hashedToken = hashToken(token);

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token: hashedToken,
      identifier: { startsWith: 'email-verify:' },
      expires: { gt: new Date() },
    },
  });

  if (!verificationToken) {
    return false;
  }

  const email = verificationToken.identifier.replace('email-verify:', '');

  // Update user and delete token in a transaction
  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: hashedToken,
        },
      },
    }),
  ]);

  return true;
}
