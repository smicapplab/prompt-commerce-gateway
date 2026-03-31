import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set');
    return;
  }
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  const retailers = await prisma.retailer.findMany({
    where: { verified: true, active: true },
    include: { platformKey: true },
  });

  console.log('Active Retailers from Prisma:');
  console.log(JSON.stringify(retailers, null, 2));

  await prisma.$disconnect();
  await pool.end();
}

main();
