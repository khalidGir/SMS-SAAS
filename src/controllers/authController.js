import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../utils/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * POST /api/v1/auth/login
 *
 * Validates credentials against seeded users using bcrypt,
 * enforces account-lockout after 5 failed attempts,
 * returns a short-lived Access Token (15m) and sets a Refresh Token cookie (7d).
 */
export async function login(req, res) {
  // Validate input
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return res.status(422).json({
      status: 'error',
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        fields: fieldErrors,
      },
    });
  }

  const { email, password, rememberMe } = parsed.data;

  try {
    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { school: { select: { name: true } } },
    });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    // 2. Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMs = new Date(user.lockedUntil).getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(423).json({
        status: 'error',
        error: {
          code: 'ACCOUNT_LOCKED',
          message: `Account locked. Try again in ${remainingMin} minute(s).`,
        },
      });
    }

    // 3. Compare password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      // Increment failed attempts
      const newAttempts = user.failedAttempts + 1;
      const updateData = { failedAttempts: newAttempts };

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      }

      await prisma.user.update({ where: { id: user.id }, data: updateData });

      return res.status(401).json({
        status: 'error',
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    // 4. Success — reset failed attempts & update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null, lastLogin: new Date() },
    });

    // 5. Sign tokens
    const tokenPayload = {
      sub: user.id,
      schoolId: user.schoolId,
      role: user.role,
      email: user.email,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ sub: user.id });

    // 6. Set refresh token as HTTP-only cookie
    //    Extended duration (7 days) if "Remember Me" is checked, else session cookie.
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
    };

    if (rememberMe) {
      cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    }

    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.school?.name ?? '',
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  }
}

/**
 * POST /api/v1/auth/refresh
 *
 * Validates the refresh token cookie and issues a new access token.
 */
export async function refresh(req, res) {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({
      status: 'error',
      error: { code: 'MISSING_REFRESH_TOKEN', message: 'Refresh token not provided' },
    });
  }

  try {
    const decoded = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { school: { select: { name: true } } },
    });
    if (!user || user.status !== 'Active') {
      return res.status(401).json({
        status: 'error',
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'User not found or inactive' },
      });
    }

    const tokenPayload = {
      sub: user.id,
      schoolId: user.schoolId,
      role: user.role,
      email: user.email,
    };

    const accessToken = signAccessToken(tokenPayload);

    return res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.school?.name ?? '',
        },
      },
    });
  } catch {
    return res.status(401).json({
      status: 'error',
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token expired or invalid' },
    });
  }
}

/**
 * POST /api/v1/auth/forgot-password
 *
 * Generates a reset token, stores its hash on the user record,
 * and logs the reset link (in production, send via email).
 */
export async function forgotPassword(req, res) {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      status: 'error',
      error: { code: 'VALIDATION_ERROR', message: 'Invalid email', fields: parsed.error.flatten().fieldErrors },
    });
  }

  const { email } = parsed.data;

  // Always return 200 to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    console.log(`[DEV] Password reset link for ${email}: /reset-password?token=${rawToken}`);
  }

  return res.status(200).json({
    status: 'success',
    message: 'If the email exists, a reset link has been sent.',
  });
}

/**
 * POST /api/v1/auth/reset-password
 *
 * Validates the reset token and updates the user's password.
 */
export async function resetPassword(req, res) {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      status: 'error',
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
    });
  }

  const { token, password } = parsed.data;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        error: { code: 'INVALID_RESET_TOKEN', message: 'Reset token is invalid or expired' },
      });
    }

    const newPasswordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        resetToken: null,
        resetTokenExpires: null,
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  }
}

/**
 * POST /api/v1/auth/logout
 *
 * Clears the refresh token cookie.
 */
export function logout(req, res) {
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
}
