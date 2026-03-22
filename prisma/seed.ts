import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env so DATABASE_URL is available when running via ts-node directly
config({ path: resolve(__dirname, '../.env'), quiet: true });

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const pool = new pg.Pool({ connectionString });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaPg(pool as any);
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

async function main() {
  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';

  const existing = await prisma.adminUser.findUnique({ where: { username } });
  if (!existing) {
    const hash = await bcrypt.hash(password, 12);
    await prisma.adminUser.create({ data: { username, passwordHash: hash } });
    console.log(`✅ Admin user created: ${username}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${username}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
