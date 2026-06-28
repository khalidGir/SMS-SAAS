import * as DATA from './mockData.js';

// ── Relation map (model → related model, FK mapping) ──
const RELATIONS = {
  user: {
    school: { type: 'belongsTo', model: 'school', fk: 'schoolId', pk: 'id' },
  },
  student: {
    school: { type: 'belongsTo', model: 'school', fk: 'schoolId', pk: 'id' },
  },
  invoice: {
    student: { type: 'belongsTo', model: 'student', fk: 'studentId', pk: 'id' },
    feeStructure: { type: 'belongsTo', model: 'feeStructure', fk: 'feeStructureId', pk: 'id' },
    term: { type: 'belongsTo', model: 'term', fk: 'termId', pk: 'id' },
    school: { type: 'belongsTo', model: 'school', fk: 'schoolId', pk: 'id' },
    payments: { type: 'hasMany', model: 'payment', fk: 'invoiceId', pk: 'id' },
  },
  payment: {
    invoice: { type: 'belongsTo', model: 'invoice', fk: 'invoiceId', pk: 'id' },
    recordedBy: { type: 'belongsTo', model: 'user', fk: 'recordedById', pk: 'id' },
  },
  enrollment: {
    class: { type: 'belongsTo', model: 'class', fk: 'classId', pk: 'id' },
    session: { type: 'belongsTo', model: 'academicSession', fk: 'sessionId', pk: 'id' },
    student: { type: 'belongsTo', model: 'student', fk: 'studentId', pk: 'id' },
  },
  academicSession: {
    terms: { type: 'hasMany', model: 'term', fk: 'academicSessionId', pk: 'id' },
  },
  term: {
    academicSession: { type: 'belongsTo', model: 'academicSession', fk: 'academicSessionId', pk: 'id' },
  },
  feeStructure: {
    term: { type: 'belongsTo', model: 'term', fk: 'termId', pk: 'id' },
  },
};

// ── TENANT_SCOPED models (schoolId auto-injected) ──
const TENANT_SCOPED = ['AcademicSession', 'Class', 'FeeStructure', 'Invoice', 'Student', 'User'];
const SOFT_DELETE_MODELS = ['AcademicSession', 'FeeStructure', 'Invoice', 'School', 'Student', 'Term', 'User'];

let tenantCtx = { schoolId: null, role: null };

export function setTenantContext(ctx) {
  tenantCtx = ctx;
}

function getModelTable(model) {
  const map = {
    user: 'users', student: 'students', invoice: 'invoices', payment: 'payments',
    feeStructure: 'feeStructures', school: 'schools', class: 'classes',
    academicSession: 'academicSessions', term: 'terms', enrollment: 'enrollments',
  };
  const key = model[0].toLowerCase() + model.slice(1);
  return map[key] || key;
}

function deepClone(obj) {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return new Date(obj);
  if (Array.isArray(obj)) return obj.map(deepClone);
  if (typeof obj === 'object') {
    const clone = {};
    for (const k of Object.keys(obj)) clone[k] = deepClone(obj[k]);
    return clone;
  }
  return obj;
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

let idCounter = Date.now();
function shortId() {
  return `mock-${++idCounter}`;
}

// ── Where clause evaluator ──
function matchRecord(record, where) {
  if (!where) return true;
  for (const [key, value] of Object.entries(where)) {
    if (key === 'AND') {
      if (!value.every(c => matchRecord(record, c))) return false;
      continue;
    }
    if (key === 'OR') {
      if (!value.some(c => matchRecord(record, c))) return false;
      continue;
    }
    if (key === 'NOT') {
      if (matchRecord(record, value)) return false;
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      for (const [op, opVal] of Object.entries(value)) {
        const rv = record[key];
        switch (op) {
          case 'equals': if (rv !== opVal) return false; break;
          case 'not': if (rv === opVal) return false; break;
          case 'in': if (!(Array.isArray(opVal) && opVal.includes(rv))) return false; break;
          case 'notIn': if (Array.isArray(opVal) && opVal.includes(rv)) return false; break;
          case 'contains':
            if (rv === null || rv === undefined) return false;
            if (!String(rv).includes(opVal)) return false;
            break;
          case 'startsWith':
            if (rv === null || rv === undefined) return false;
            if (!String(rv).startsWith(opVal)) return false;
            break;
          case 'endsWith':
            if (rv === null || rv === undefined) return false;
            if (!String(rv).endsWith(opVal)) return false;
            break;
          case 'gt': if (!(rv > opVal)) return false; break;
          case 'gte': if (!(rv >= opVal)) return false; break;
          case 'lt': if (!(rv < opVal)) return false; break;
          case 'lte': if (!(rv <= opVal)) return false; break;
          default: return false;
        }
      }
    } else {
      if (record[key] !== value) return false;
    }
  }
  return true;
}

// ── OrderBy ──
function applyOrderBy(results, orderBy) {
  if (!orderBy) return results;
  const arr = [...results];
  arr.sort((a, b) => {
    for (const [field, dir] of Object.entries(orderBy)) {
      const mul = dir === 'desc' ? -1 : 1;
      const va = a[field], vb = b[field];
      if (va == null && vb == null) continue;
      if (va == null) return 1 * mul;
      if (vb == null) return -1 * mul;
      if (va < vb) return -1 * mul;
      if (va > vb) return 1 * mul;
    }
    return 0;
  });
  return arr;
}

// ── Select ──
function pickFields(record, select) {
  if (!select) return record;
  const result = {};
  for (const [field, include] of Object.entries(select)) {
    if (include) result[field] = record[field];
  }
  return result;
}

// ── Include (relations) ──
function resolveIncludes(record, include, tables) {
  if (!include) return record;
  const result = { ...record };
  for (const [relName, relConfig] of Object.entries(include)) {
    if (!relConfig) continue;
    const rel = RELATIONS[relName];
    if (!rel) continue;
    const relatedTable = tables[rel.model];

    if (rel.type === 'belongsTo') {
      const related = relatedTable.find(r => r[rel.pk] === record[rel.fk]) || null;
      result[relName] = related ? resolveIncludes(
        pickFields(related, relConfig.select),
        relConfig.include,
        tables,
      ) : null;
    } else if (rel.type === 'hasMany') {
      let related = relatedTable.filter(r => r[rel.fk] === record[rel.pk]);
      if (relConfig.where) related = related.filter(r => matchRecord(r, relConfig.where));
      if (relConfig.orderBy) related = applyOrderBy(related, relConfig.orderBy);
      if (relConfig.take) related = related.slice(0, relConfig.take);
      if (relConfig.skip) related = related.slice(relConfig.skip);
      result[relName] = related.map(r => resolveIncludes(
        pickFields(r, relConfig.select),
        relConfig.include,
        tables,
      ));
    }
  }
  return result;
}

// ── Build mock model API ──
function createModel(modelName, tableRef) {
  const nameUpper = modelName[0].toUpperCase() + modelName.slice(1);

  function applyTenantScope(where) {
    if (!tenantCtx || !tenantCtx.schoolId) return where;
    if (tenantCtx.role === 'SUPER_ADMIN') return where;
    if (!TENANT_SCOPED.includes(nameUpper)) return where;
    return { ...where, schoolId: tenantCtx.schoolId };
  }

  function applySoftDelete(where) {
    if (!SOFT_DELETE_MODELS.includes(nameUpper)) return where;
    return { ...where, deletedAt: null };
  }

  function filter(where) {
    let w = where;
    if (!w && tenantCtx.schoolId) w = {};
    w = applySoftDelete(applyTenantScope(w || {}));
    return tableRef.filter(r => matchRecord(r, w));
  }

  return {
    async findUnique({ where, include, select }) {
      const rows = filter(where);
      const record = rows[0] || null;
      if (!record) return null;
      const resolved = resolveIncludes(record, include, getTables());
      return pickFields(resolved, select);
    },

    async findFirst({ where, include, select, orderBy }) {
      let rows = filter(where);
      rows = applyOrderBy(rows, orderBy);
      const record = rows[0] || null;
      if (!record) return null;
      const resolved = resolveIncludes(record, include, getTables());
      return pickFields(resolved, select);
    },

    async findMany({ where, include, select, orderBy, skip, take } = {}) {
      let rows = filter(where);
      rows = applyOrderBy(rows, orderBy);
      if (skip) rows = rows.slice(skip);
      if (take !== undefined) rows = rows.slice(0, take);
      return rows.map(r => pickFields(resolveIncludes(r, include, getTables()), select));
    },

    async create({ data }) {
      const now = new Date();
      const newRecord = deepClone({
        ...data,
        id: data.id || shortId(),
        createdAt: now,
        updatedAt: now,
      });
      tableRef.push(newRecord);
      return newRecord;
    },

    async update({ where, data }) {
      const idx = tableRef.findIndex(r => matchRecord(r, applySoftDelete(applyTenantScope(where))));
      if (idx === -1) throw new Error(`${nameUpper} not found for update`);
      tableRef[idx] = { ...tableRef[idx], ...deepClone(data), updatedAt: new Date() };
      return tableRef[idx];
    },

    async updateMany({ where, data }) {
      const matching = tableRef.filter(r => matchRecord(r, applySoftDelete(applyTenantScope(where))));
      for (const record of matching) {
        Object.assign(record, deepClone(data), { updatedAt: new Date() });
      }
      return { count: matching.length };
    },

    async count({ where } = {}) {
      return filter(where).length;
    },

    async aggregate({ where, _count, _sum, _avg, _min, _max }) {
      const rows = filter(where);
      const result = {};

      if (_count) {
        result._count = {};
        for (const field of Object.keys(_count)) {
          if (_count[field]) {
            result._count[field] = field === '_all' || field === 'id'
              ? rows.length
              : rows.filter(r => r[field] != null).length;
          }
        }
      }

      if (_sum) {
        result._sum = {};
        for (const [field, doIt] of Object.entries(_sum)) {
          if (doIt) result._sum[field] = rows.reduce((s, r) => s + (Number(r[field]) || 0), 0);
        }
      }

      if (_avg) {
        result._avg = {};
        for (const [field, doIt] of Object.entries(_avg)) {
          if (doIt) {
            const sum = rows.reduce((s, r) => s + (Number(r[field]) || 0), 0);
            result._avg[field] = rows.length ? sum / rows.length : 0;
          }
        }
      }

      if (_min) {
        result._min = {};
        for (const [field, doIt] of Object.entries(_min)) {
          if (doIt) {
            const vals = rows.map(r => r[field]).filter(v => v != null);
            result._min[field] = vals.length ? vals.reduce((a, b) => a < b ? a : b) : null;
          }
        }
      }

      if (_max) {
        result._max = {};
        for (const [field, doIt] of Object.entries(_max)) {
          if (doIt) {
            const vals = rows.map(r => r[field]).filter(v => v != null);
            result._max[field] = vals.length ? vals.reduce((a, b) => a > b ? a : b) : null;
          }
        }
      }

      return result;
    },

    async deleteMany({ where } = {}) {
      let w = where;
      if (!w && tenantCtx.schoolId) w = {};
      w = applySoftDelete(applyTenantScope(w || {}));
      const before = tableRef.length;
      let i = tableRef.length;
      while (i--) { if (matchRecord(tableRef[i], w)) tableRef.splice(i, 1); }
      return { count: before - tableRef.length };
    },
  };
}

// ── Table accessor ──
function getTables() {
  return {
    users, students, invoices, payments,
    feeStructures, schools, classes,
    academicSessions, terms, enrollments,
  };
}

// ── Deep clone data for isolation between requests ──
let users = deepClone(DATA.users);
let students = deepClone(DATA.students);
let invoices = deepClone(DATA.invoices);
let payments = deepClone(DATA.payments);
let feeStructures = deepClone(DATA.feeStructures);
let schools = deepClone(DATA.schools);
let classes = deepClone(DATA.classes);
let academicSessions = deepClone(DATA.academicSessions);
let terms = deepClone(DATA.terms);
let enrollments = deepClone(DATA.enrollments);

function resetData() {
  users = deepClone(DATA.users);
  students = deepClone(DATA.students);
  invoices = deepClone(DATA.invoices);
  payments = deepClone(DATA.payments);
  feeStructures = deepClone(DATA.feeStructures);
  schools = deepClone(DATA.schools);
  classes = deepClone(DATA.classes);
  academicSessions = deepClone(DATA.academicSessions);
  terms = deepClone(DATA.terms);
  enrollments = deepClone(DATA.enrollments);
}

// ── Build Prisma-shaped object ──
export function createMockPrisma() {
  resetData();

  const models = {
    user: createModel('user', users),
    student: createModel('student', students),
    invoice: createModel('invoice', invoices),
    payment: createModel('payment', payments),
    feeStructure: createModel('feeStructure', feeStructures),
    school: createModel('school', schools),
    class: createModel('class', classes),
    academicSession: createModel('academicSession', academicSessions),
    term: createModel('term', terms),
    enrollment: createModel('enrollment', enrollments),
  };

  return {
    ...models,
    $transaction: async (fn) => {
      const tx = createMockPrisma();
      return fn(tx);
    },
    $disconnect: async () => {},
  };
}
