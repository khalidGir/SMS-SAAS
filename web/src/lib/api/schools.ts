export interface School {
  id: string;
  name: string;
  domain: string;
  address: string;
  phone: string;
  email: string;
  planType: 'BASIC' | 'STANDARD' | 'PREMIUM';
  status: 'ACTIVE' | 'SUSPENDED';
  userCount: number;
  createdAt: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
}

export interface SchoolInput {
  name: string;
  domain: string;
  address: string;
  phone: string;
  email: string;
  planType: 'BASIC' | 'STANDARD' | 'PREMIUM';
  adminName: string;
  adminEmail: string;
  adminPhone: string;
}

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let schools: School[] = [
  {
    id: 'sch-1',
    name: 'NexaSoft Academy (Addis Ababa)',
    domain: 'nexasoftacademy.edu',
    address: 'Bole Road, Addis Ababa, Ethiopia',
    phone: '+251-11-555-0100',
    email: 'info@nexasoftacademy.edu',
    planType: 'PREMIUM',
    status: 'ACTIVE',
    userCount: 4,
    createdAt: '2025-09-15T08:00:00Z',
    adminName: 'Abebe Kebede',
    adminEmail: 'admin@nexasoftacademy.edu',
    adminPhone: '+251-91-100-2001',
  },
  {
    id: 'sch-2',
    name: 'Bright Future School',
    domain: 'brightfuture.et',
    address: 'Mexico Square, Addis Ababa, Ethiopia',
    phone: '+251-11-554-0200',
    email: 'contact@brightfuture.et',
    planType: 'STANDARD',
    status: 'ACTIVE',
    userCount: 2,
    createdAt: '2026-01-10T09:00:00Z',
    adminName: 'Hana Tadesse',
    adminEmail: 'admin@brightfuture.et',
    adminPhone: '+251-91-200-3002',
  },
  {
    id: 'sch-3',
    name: 'Sunrise International School',
    domain: 'sunriseint.com',
    address: 'Piassa, Addis Ababa, Ethiopia',
    phone: '+251-11-553-0300',
    email: 'info@sunriseint.com',
    planType: 'BASIC',
    status: 'SUSPENDED',
    userCount: 0,
    createdAt: '2025-06-01T10:00:00Z',
    adminName: 'Getachew Desta',
    adminEmail: 'admin@sunriseint.com',
    adminPhone: '+251-91-300-4003',
  },
];

export async function fetchSchools(): Promise<School[]> {
  await delay();
  return [...schools];
}

export async function fetchSchoolById(id: string): Promise<School | null> {
  await delay(200);
  return schools.find((s) => s.id === id) ?? null;
}

export async function createSchool(input: SchoolInput): Promise<School> {
  await delay(600);
  const school: School = {
    id: `sch-${Date.now()}`,
    ...input,
    status: 'ACTIVE',
    userCount: 1,
    createdAt: new Date().toISOString(),
  };
  schools.push(school);
  return school;
}

export async function updateSchool(id: string, input: Partial<SchoolInput & { status: 'ACTIVE' | 'SUSPENDED' }>): Promise<School | null> {
  await delay(500);
  const idx = schools.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  schools[idx] = { ...schools[idx], ...input };
  return schools[idx];
}

export async function deleteSchool(id: string): Promise<boolean> {
  await delay(500);
  const idx = schools.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  schools = schools.filter((s) => s.id !== id);
  return true;
}
