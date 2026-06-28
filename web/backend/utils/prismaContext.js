import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * AsyncLocalStorage-based tenant context for Prisma query isolation.
 *
 * On every authenticated request, `withTenantContext` middleware runs
 * the downstream pipeline inside a context store that carries the
 * authenticated user's `schoolId` and `role`. The Prisma `$extends`
 * extension reads this store at query time and auto-injects tenant
 * filters into the `where` clause.
 */
export const prismaContext = new AsyncLocalStorage();

/**
 * Retrieve the current tenant context store.
 *
 * @returns {{ schoolId: string|null, role: string|null }|undefined}
 */
export function getPrismaContext() {
  return prismaContext.getStore();
}
