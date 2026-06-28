import { prismaContext } from '../utils/prismaContext.js';

/**
 * Middleware — wraps the downstream request chain inside an AsyncLocalStorage
 * context so that the Prisma tenant-isolation extension can read the
 * authenticated user's `schoolId` and `role` at query time.
 *
 * Must be placed AFTER `authenticateJWT` so that `req.user` is populated.
 */
export function withTenantContext(req, res, next) {
  const store = {
    schoolId: req.user?.schoolId ?? null,
    role: req.user?.role ?? null,
  };
  prismaContext.run(store, () => next());
}
