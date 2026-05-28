import type postgres from 'postgres';
import { getMockLeadById } from '@/lib/mock-leads';

type SqlTag = ReturnType<typeof postgres>;

export type ManagedUserRole = 'admin' | 'member';

export type ManagedUserRecord = {
  id: number;
  username: string;
  fullName: string;
  role: ManagedUserRole;
  active: boolean;
  passwordHash: string;
};

type MockUserAssignments = {
  leadIds: Set<number>;
  routeIds: Set<number>;
};

let mockUsers: ManagedUserRecord[] = [];
let mockNextUserId = 1;
const mockAssignments = new Map<number, MockUserAssignments>();

export async function ensureUserManagementSchema(sql: SqlTag) {
  await sql`
    CREATE TABLE IF NOT EXISTS app_users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'member',
      password_hash TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
      updated_at TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
    )
  `;

  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_user_id INTEGER REFERENCES app_users(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE route_plans ADD COLUMN IF NOT EXISTS assigned_user_id INTEGER REFERENCES app_users(id) ON DELETE SET NULL`;
}

function getOrCreateAssignmentRecord(userId: number): MockUserAssignments {
  const existing = mockAssignments.get(userId);
  if (existing) return existing;
  const created: MockUserAssignments = { leadIds: new Set<number>(), routeIds: new Set<number>() };
  mockAssignments.set(userId, created);
  return created;
}

export function listMockUsers() {
  return mockUsers
    .map((user) => {
      const assignments = getOrCreateAssignmentRecord(user.id);
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        active: user.active,
        leadCount: assignments.leadIds.size,
        routeCount: assignments.routeIds.size,
      };
    })
    .sort((a, b) => {
      if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
      return a.fullName.localeCompare(b.fullName);
    });
}

export function findMockUserByUsername(username: string) {
  const normalized = username.trim().toLowerCase();
  return mockUsers.find((user) => user.username === normalized);
}

export function findMockUserById(id: number) {
  return mockUsers.find((user) => user.id === id);
}

export function createMockUser(input: {
  username: string;
  fullName: string;
  role: ManagedUserRole;
  passwordHash: string;
}) {
  const user: ManagedUserRecord = {
    id: mockNextUserId++,
    username: input.username.trim().toLowerCase(),
    fullName: input.fullName.trim(),
    role: input.role,
    active: true,
    passwordHash: input.passwordHash,
  };

  mockUsers.push(user);
  getOrCreateAssignmentRecord(user.id);
  return user;
}

export function updateMockUser(
  userId: number,
  updates: {
    username: string;
    fullName: string;
    role: ManagedUserRole;
    active: boolean;
    passwordHash?: string;
  }
) {
  const user = findMockUserById(userId);
  if (!user) return null;

  user.username = updates.username.trim().toLowerCase();
  user.fullName = updates.fullName.trim();
  user.role = updates.role;
  user.active = updates.active;
  if (updates.passwordHash) user.passwordHash = updates.passwordHash;

  getOrCreateAssignmentRecord(userId);
  return user;
}

export function deleteMockUser(userId: number) {
  const index = mockUsers.findIndex((user) => user.id === userId);
  if (index < 0) return false;
  mockUsers.splice(index, 1);
  mockAssignments.delete(userId);
  return true;
}

export function getMockAssignments(userId: number) {
  const record = getOrCreateAssignmentRecord(userId);
  const leads = Array.from(record.leadIds)
    .map((leadId) => getMockLeadById(leadId))
    .filter((lead): lead is NonNullable<typeof lead> => Boolean(lead))
    .map((lead) => ({ id: lead.id, businessName: lead.businessName, leadStatus: lead.leadStatus }));

  const routes = Array.from(record.routeIds)
    .map((routeId) => ({ id: routeId, name: `Route #${routeId}`, routeDate: '', status: 'Draft' }));

  return { leads, routes };
}

export function setMockAssignments(userId: number, leadIds: number[], routeIds: number[]) {
  for (const [uid, record] of mockAssignments.entries()) {
    if (uid === userId) continue;
    for (const leadId of leadIds) record.leadIds.delete(leadId);
    for (const routeId of routeIds) record.routeIds.delete(routeId);
  }

  const target = getOrCreateAssignmentRecord(userId);
  target.leadIds = new Set(leadIds);
  target.routeIds = new Set(routeIds);
}

