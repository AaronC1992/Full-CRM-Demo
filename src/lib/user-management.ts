import type postgres from 'postgres';

type SqlTag = ReturnType<typeof postgres>;

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
