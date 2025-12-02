import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // Skip initialization during build if DATABASE_URL is not available
  if (!process.env.DATABASE_URL) {
    console.warn('[prisma] DATABASE_URL not found, returning null client');
    return null as unknown as PrismaClient;
  }

  // Add connection pool configuration for serverless environments
  // These settings help prevent connection exhaustion in serverless environments
  // where function instances are ephemeral
  const baseUrl = process.env.DATABASE_URL;
  const hasParams = baseUrl.includes('?');
  const poolParams = 'connection_limit=10&pool_timeout=10&connect_timeout=10';
  const datasourceUrl = `${baseUrl}${hasParams ? '&' : '?'}${poolParams}`;

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Optimize for serverless environments (Vercel)
    datasources: {
      db: {
        url: datasourceUrl,
      },
    },
  })
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
