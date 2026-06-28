import type { School } from './schools';

export interface SuperAdminDashboard {
  totalSchools: number;
  activeSchools: number;
  suspendedSchools: number;
  platformUsers: number;
  recentRegistrations: School[];
}

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function fetchSuperAdminDashboard(): Promise<SuperAdminDashboard> {
  await delay();
  return {
    totalSchools: 3,
    activeSchools: 2,
    suspendedSchools: 1,
    platformUsers: 4,
    recentRegistrations: [
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
    ],
  };
}
