import { verifyAccessToken } from '../utils/token.js';

/**
 * authenticateJWT middleware
 *
 * Extracts Bearer token from the Authorization header,
 * verifies it, and injects the decoded payload into req.user.
 *
 * Decoded payload shape:
 *   { userId, schoolId, role, email, iat, exp }
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 'MISSING_TOKEN',
        message: 'Missing or invalid authorization header',
      },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.sub,
      schoolId: decoded.schoolId,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Access token has expired'
        : 'Invalid access token';

    return res.status(401).json({
      status: 'error',
      error: {
        code: 'INVALID_TOKEN',
        message,
      },
    });
  }
}
