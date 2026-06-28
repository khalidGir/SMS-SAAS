/**
 * requireRoles middleware factory
 *
 * Creates middleware that checks the authenticated user's role
 * against an allowed whitelist of roles.
 *
 * Usage:
 *   router.get('/students', authenticateJWT, requireRoles('ADMIN', 'REGISTRAR'), handler)
 *
 * Returns 403 Forbidden if the user's role is not in the allowed list.
 * Must be used after authenticateJWT so req.user is populated.
 *
 * If no roles are provided, access is denied.
 */
export function requireRoles(...allowedRoles) {
  if (allowedRoles.length === 0) {
    return (req, res) => {
      return res.status(403).json({
        status: 'error',
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied',
        },
      });
    };
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: 'FORBIDDEN',
          message: `Role '${req.user.role}' is not permitted for this resource`,
        },
      });
    }

    next();
  };
}
