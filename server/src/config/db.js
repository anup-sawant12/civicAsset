const dotenv = require('dotenv');
dotenv.config();

let prismaInstance = null;
let initPromise = null;

/**
 * Lazily initialize and return the PrismaClient instance.
 * In Prisma 7, connects via the official @prisma/adapter-pg driver adapter.
 */
async function getClient() {
  if (prismaInstance) return prismaInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let PrismaClientClass;
    try {
      const clientPkg = require('@prisma/client');
      PrismaClientClass = clientPkg.PrismaClient;
    } catch (e) {
      try {
        const clientMod = await import('../../generated/prisma/client.ts');
        PrismaClientClass = clientMod.PrismaClient;
      } catch (err) {
        console.error('Failed to load PrismaClient:', err);
        throw err;
      }
    }

    try {
      const { PrismaPg } = require('@prisma/adapter-pg');
      const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
      prismaInstance = new PrismaClientClass({ adapter });
    } catch (err) {
      console.warn('PrismaPg adapter initialization warning, trying fallback:', err.message);
      try {
        prismaInstance = new PrismaClientClass({
          datasourceUrl: process.env.DATABASE_URL
        });
      } catch (fallbackErr) {
        prismaInstance = new PrismaClientClass();
      }
    }

    return prismaInstance;
  })();

  return initPromise;
}

// Proxied prisma object allowing standard calls such as:
// await prisma.user.findUnique({ ... })
const prisma = new Proxy({}, {
  get(target, prop) {
    if (prop === '$connect' || prop === '$disconnect' || prop === '$transaction' || prop === '$queryRaw' || prop === '$executeRaw') {
      return async (...args) => {
        const client = await getClient();
        return client[prop](...args);
      };
    }

    return new Proxy({}, {
      get(subTarget, method) {
        return async (...args) => {
          const client = await getClient();
          if (!client[prop] || typeof client[prop][method] !== 'function') {
            throw new Error(`Prisma method ${String(prop)}.${String(method)} does not exist`);
          }
          return client[prop][method](...args);
        };
      }
    });
  }
});

module.exports = prisma;
