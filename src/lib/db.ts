import postgres from 'postgres';

const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const fromCamel = (s: string) => s.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`);

let _sql: ReturnType<typeof postgres> | undefined;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }
  return url;
}

function shouldUseSsl(databaseUrl: string) {
  const explicit = process.env.DB_SSL_MODE?.toLowerCase();
  if (explicit === 'require') return 'require' as const;
  if (explicit === 'disable') return false;

  try {
    const hostname = new URL(databaseUrl).hostname.toLowerCase();
    const localHosts = new Set(['localhost', '127.0.0.1', '::1', 'db', 'postgres']);
    return localHosts.has(hostname) ? false : ('require' as const);
  } catch {
    return 'require' as const;
  }
}

function assertDatabasePolicy(databaseUrl: string) {
  const allowRemoteDb = process.env.ALLOW_REMOTE_DB === 'true';
  const normalized = databaseUrl.toLowerCase();

  if (!allowRemoteDb && normalized.includes('supabase.com')) {
    throw new Error('Supabase connections are blocked for Full CRM Demo. Use a local PostgreSQL DATABASE_URL or set ALLOW_REMOTE_DB=true explicitly.');
  }
}

function getDb() {
  if (!_sql) {
    const databaseUrl = getDatabaseUrl();
    assertDatabasePolicy(databaseUrl);

    _sql = postgres(databaseUrl, {
      ssl: shouldUseSsl(databaseUrl),
      max: 1,
      idle_timeout: 60,
      max_lifetime: 300,
      connect_timeout: 10,
      prepare: false,
      transform: {
        column: { from: toCamel, to: fromCamel },
      },
    });
  }
  return _sql;
}

export default getDb;