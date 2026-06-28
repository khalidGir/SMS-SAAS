import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client.ts';
import { getPrismaContext } from './prismaContext.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isSqlite = (process.env.DATABASE_URL || '').startsWith('file:');

let prisma;
if (isSqlite) {
  const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
  const dbPath = path.resolve(__dirname, '..', '..', 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

// ---------------------------------------------------------------------------
// Tenant isolation and soft-delete extension
// ---------------------------------------------------------------------------
const TENANT_SCOPED = [
  'AcademicSession',
  'Class',
  'FeeStructure',
  'Invoice',
  'Student',
  'User',
];

const SCOPE_OPS = ['findMany', 'findUnique', 'findFirst', 'update', 'delete', 'aggregate', 'count'];

const SOFT_DELETE_OPS = ['findMany', 'findUnique', 'findFirst', 'aggregate', 'count'];

const MODELS_WITH_DELETED_AT = [
  'AcademicSession',
  'FeeStructure',
  'Invoice',
  'School',
  'Student',
  'Term',
  'User',
];

const xprisma = prisma.$extends({
  name: 'tenant-isolation',
  query: {
    $allModels: {
      async findMany({ model, operation, args, query }) {
        args = applyTenantScope(model, operation, args);
        return query(args);
      },
      async findUnique({ model, operation, args, query }) {
        args = applyTenantScope(model, operation, args);
        return query(args);
      },
      async findFirst({ model, operation, args, query }) {
        args = applyTenantScope(model, operation, args);
        return query(args);
      },
      async update({ model, operation, args, query }) {
        args = applyTenantScope(model, operation, args);
        return query(args);
      },
      async delete({ model, operation, args, query }) {
        args = applyTenantScope(model, operation, args);
        return query(args);
      },
      async aggregate({ model, operation, args, query }) {
        args = applyTenantScope(model, operation, args);
        return query(args);
      },
      async count({ model, operation, args, query }) {
        args = applyTenantScope(model, operation, args);
        return query(args);
      },
    },
  },
});

function applyTenantScope(model, operation, args) {
  const ctx = getPrismaContext();
  if (!ctx) return args;

  if (ctx.role !== 'SUPER_ADMIN' && !ctx.schoolId && TENANT_SCOPED.includes(model)) {
    throw new Error(
      `Tenant context (schoolId) is required for ${model}.${operation}. ` +
      `Authenticate with a school-scoped account.`,
    );
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

export default xprisma;
