import postgres from 'postgres';

const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const fromCamel = (s: string) => s.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`);

let _sql: ReturnType<typeof postgres> | undefined;

type SqlTag = ReturnType<typeof postgres>;

export const isNoDbMode = process.env.DEMO_NO_DB === 'true' || !process.env.DATABASE_URL;

function buildMockAggregateRow(query: string) {
  const aggregateRegex = /(?:count|sum|max|min|avg)\s*\([^)]*\)\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;
  const aliases = [...query.matchAll(aggregateRegex)].map((m) => m[1]);
  if (aliases.length === 0) return null;

  return aliases.reduce<Record<string, number>>((acc, alias) => {
    acc[alias] = 0;
    return acc;
  }, {});
}

function createMockSql(): SqlTag {
  const mock = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.reduce((acc, part, i) => {
      const v = i < values.length ? String(values[i]) : '';
      return acc + part + v;
    }, '').trim().toLowerCase();

    if (query.startsWith('select')) {
      if (query.includes(' as v')) {
        return [{ v: 0 }] as unknown[];
      }
      if (query.includes(' as c')) {
        return [{ c: 0 }] as unknown[];
      }

      const aggregateRow = buildMockAggregateRow(query);
      if (aggregateRow) {
        return [aggregateRow] as unknown[];
      }
      return [] as unknown[];
    }

    if (query.startsWith('insert')) {
      if (query.includes('returning')) {
        return [{ id: Date.now() }] as unknown[];
      }
      return [] as unknown[];
    }

    if (query.startsWith('update') || query.startsWith('delete')) {
      if (query.includes('returning')) {
        return [{}] as unknown[];
      }
      return [] as unknown[];
    }

    return [] as unknown[];
  }) as unknown as SqlTag;

  (mock as unknown as { unsafe: (value: string) => string }).unsafe = (value: string) => value;
  (mock as unknown as { begin: <T>(fn: (tx: SqlTag) => Promise<T>) => Promise<T> }).begin = async <T>(
    fn: (tx: SqlTag) => Promise<T>
  ) => fn(mock);

  return mock;
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required unless DEMO_NO_DB=true');
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
  if (isNoDbMode) {
    return createMockSql();
  }

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