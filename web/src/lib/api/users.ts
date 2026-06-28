export interface PlatformUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'REGISTRAR' | 'ACCOUNTANT';
  schoolId: string;
  schoolName: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

export interface PlatformUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'REGISTRAR' | 'ACCOUNTANT';
  schoolId: string;
}

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const users: PlatformUser[] = [
  {
    id: 'usr-1',
    firstName: 'Abebe',
    lastName: 'Kebede',
    email: 'admin@nexasoftacademy.edu',
    phone: '+251-91-100-2001',
    role: 'ADMIN',
    schoolId: 'sch-1',
    schoolName: 'NexaSoft Academy (Addis Ababa)',
    status: 'ACTIVE',
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'usr-2',
    firstName: 'Chaltu',
    lastName: 'Yosef',
    email: 'registrar@nexasoftacademy.edu',
    phone: '+251-91-100-2002',
    role: 'REGISTRAR',
    schoolId: 'sch-1',
    schoolName: 'NexaSoft Academy (Addis Ababa)',
    status: 'ACTIVE',
    createdAt: '2025-09-15T08:05:00Z',
  },
  {
    id: 'usr-3',
    firstName: 'Beyonce',
    lastName: 'Amanuel',
    email: 'accountant@nexasoftacademy.edu',
    phone: '+251-91-100-2003',
    role: 'ACCOUNTANT',
    schoolId: 'sch-1',
    schoolName: 'NexaSoft Academy (Addis Ababa)',
    status: 'ACTIVE',
    createdAt: '2025-09-15T08:10:00Z',
  },
  {
    id: 'usr-4',
    firstName: 'Hana',
    lastName: 'Tadesse',
    email: 'admin@brightfuture.et',
    phone: '+251-91-200-3002',
    role: 'ADMIN',
    schoolId: 'sch-2',
    schoolName: 'Bright Future School',
    status: 'ACTIVE',
    createdAt: '2026-01-10T09:00:00Z',
  },
];

export async function fetchUsers(): Promise<PlatformUser[]> {
  await delay();
  return [...users];
}

export async function createUser(input: PlatformUserInput): Promise<PlatformUser> {
  await delay(600);
  const schoolNames: Record<string, string> = {
    'sch-1': 'NexaSoft Academy (Addis Ababa)',
    'sch-2': 'Bright Future School',
    'sch-3': 'Sunrise International School',
  };
  const user: PlatformUser = {
    id: `usr-${Date.now()}`,
    ...input,
    schoolName: schoolNames[input.schoolId] ?? 'Unknown School',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

export async function updateUserStatus(id: string, status: 'ACTIVE' | 'DISABLED'): Promise<PlatformUser | null> {
  await delay(400);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], status };
  return users[idx];
}
