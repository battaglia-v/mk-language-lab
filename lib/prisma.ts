import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // Skip initialization during build if DATABASE_URL is not available
  if (!process.env.DATABASE_URL) {
    console.warn('[prisma] DATABASE_URL not found, returning null client');
    return null as unknown as PrismaClient;
  }

  // Note: Neon pooler already handles connection pooling
  // Don't add connection_limit parameters to pooled connections
  // Just use the DATABASE_URL as-is
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Optimize for serverless environments (Vercel)
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
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
