import 'dotenv/config';
import { getPrismaContext } from './prismaContext.js';

const isDemo = process.env.DEMO_MODE === 'true' || !process.env.DATABASE_URL;

let xprisma;

if (isDemo) {
  const { createMockPrisma, setTenantContext } = await import('./mockPrisma.js');
  const mock = createMockPrisma();

  function wrapWithTenant(model) {
    const wrapped = {};
    for (const [method, fn] of Object.entries(model)) {
      wrapped[method] = async (...args) => {
        const ctx = getPrismaContext();
        if (ctx) setTenantContext({ schoolId: ctx.schoolId, role: ctx.role });
        return fn(...args);
      };
    }
    return wrapped;
  }

  const modelNames = ['user', 'student', 'invoice', 'payment', 'feeStructure', 'school', 'class', 'academicSession', 'term', 'enrollment'];
  for (const name of modelNames) {
    mock[name] = wrapWithTenant(mock[name]);
  }

  xprisma = mock;
} else {
  const { PrismaClient } = await import('../../generated/prisma/client.ts');
  const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
  const { fileURLToPath } = await import('url');
  const path = await import('path');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dbUrl = process.env.DATABASE_URL;
  const isSqlite = !dbUrl || dbUrl.startsWith('file:');

  let prisma;
  if (isSqlite) {
    const dbPath = path.resolve(__dirname, '..', '..', 'dev.db');
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    prisma = new PrismaClient({ adapter });
  } else {
    prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  }

  const TENANT_SCOPED = ['AcademicSession', 'Class', 'FeeStructure', 'Invoice', 'Student', 'User'];
  const SCOPE_OPS = ['findMany', 'findUnique', 'findFirst', 'update', 'delete', 'aggregate', 'count'];
  const SOFT_DELETE_OPS = ['findMany', 'findUnique', 'findFirst', 'aggregate', 'count'];
  const MODELS_WITH_DELETED_AT = ['AcademicSession', 'FeeStructure', 'Invoice', 'School', 'Student', 'Term', 'User'];

  xprisma = prisma.$extends({
    name: 'tenant-isolation',
    query: {
      $allModels: {
        async findMany({ model, operation, args, query }) { args = applyTenantScope(model, operation, args); return query(args); },
        async findUnique({ model, operation, args, query }) { args = applyTenantScope(model, operation, args); return query(args); },
        async findFirst({ model, operation, args, query }) { args = applyTenantScope(model, operation, args); return query(args); },
        async update({ model, operation, args, query }) { args = applyTenantScope(model, operation, args); return query(args); },
        async delete({ model, operation, args, query }) { args = applyTenantScope(model, operation, args); return query(args); },
        async aggregate({ model, operation, args, query }) { args = applyTenantScope(model, operation, args); return query(args); },
        async count({ model, operation, args, query }) { args = applyTenantScope(model, operation, args); return query(args); },
      },
    },
  });

  function applyTenantScope(model, operation, args) {
    const ctx = getPrismaContext();
    if (!ctx) return args;
    if (ctx.role !== 'SUPER_ADMIN' && !ctx.schoolId && TENANT_SCOPED.includes(model)) {
      throw new Error(`Tenant context (schoolId) is required for ${model}.${operation}. Authenticate with a school-scoped account.`);
    }
    args = { ...args };
    args.where = { ...args.where };
    if (ctx.schoolId && SCOPE_OPS.includes(operation) && TENANT_SCOPED.includes(model)) {
      args.where.schoolId = ctx.schoolId;
    }
    if (SOFT_DELETE_OPS.includes(operation) && MODELS_WITH_DELETED_AT.includes(model)) {
      args.where.deletedAt = null;
    }
    return args;
  }
}

export default xprisma;
