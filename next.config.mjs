/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Include the SQLite database and native bindings in the serverless output bundle
  outputFileTracingIncludes: {
    '/api/**': ['./data/crm.db', './node_modules/better-sqlite3/**'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'better-sqlite3'];
    }
    return config;
  },
};

export default nextConfig;
