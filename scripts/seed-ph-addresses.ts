import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });


async function fetchJson(url: string) {
  const req = await fetch(url);
  if (!req.ok) throw new Error(`Failed to fetch ${url}: ${req.statusText}`);
  return req.json();
}

async function main() {
  console.log('Seeding PSGC Philippine Geographic Data from psgc.gitlab.io...');

  try {
    console.log('Fetching provinces...');
    let provinces = await fetchJson('https://psgc.gitlab.io/api/provinces/');
    // Handle Metro Manila (NCR) because it is technically a region, not a province
    // Let's add NCR as a pseudo-province to ensure its cities have a parent.
    provinces.push({ code: '130000000', name: 'Metro Manila / NCR' });

    console.log('Fetching cities and municipalities...');
    const citiesData = await fetchJson('https://psgc.gitlab.io/api/cities/');
    const municipalitiesData = await fetchJson('https://psgc.gitlab.io/api/municipalities/');
    const cities = [...citiesData, ...municipalitiesData];

    console.log('Fetching barangays...');
    const barangays = await fetchJson('https://psgc.gitlab.io/api/barangays/');

    console.log(`Loaded ${provinces.length} provinces, ${cities.length} cities/munis, ${barangays.length} barangays.`);

    // 1. Seed Provinces
    console.log('Inserting provinces...');
    await prisma.$transaction(
      provinces.map((p: any) => prisma.phProvince.upsert({
        where: { code: p.code },
        update: { name: p.name },
        create: { code: p.code, name: p.name },
      }))
    );

    // 2. Seed Cities
    console.log('Inserting cities...');
    const cityOps = [];
    for (const c of cities) {
      // Both cities and municipalities might have a provinceCode.
      // If none, it might be independent like in NCR, where we use regionCode.
      let pCode = c.provinceCode || (c.regionCode === '130000000' ? '130000000' : null);
      if (!pCode) continue; // Skip if we can't link it

      cityOps.push(
        prisma.phCity.upsert({
          where: { code: c.code },
          update: { name: c.name, provinceCode: pCode },
          create: { code: c.code, name: c.name, provinceCode: pCode },
        })
      );
    }
    
    // Chunking the cities insertion
    const CHUNK_SIZE = 500;
    for (let i = 0; i < cityOps.length; i += CHUNK_SIZE) {
      const chunk = cityOps.slice(i, i + CHUNK_SIZE);
      await prisma.$transaction(chunk);
    }

    // 3. Seed Barangays
    console.log('Inserting barangays...');
    const validCityCodes = new Set((await prisma.phCity.findMany({ select: { code: true } })).map(c => c.code));
    
    const bgyOps = [];
    for (const b of barangays) {
      // It will have either cityCode or municipalityCode
      const cCode = b.cityCode || b.municipalityCode;
      if (!cCode || !validCityCodes.has(cCode)) continue;
      bgyOps.push(
        prisma.phBarangay.upsert({
          where: { code: b.code },
          update: { name: b.name, cityCode: cCode },
          create: { code: b.code, name: b.name, cityCode: cCode },
        })
      );
    }

    for (let i = 0; i < bgyOps.length; i += CHUNK_SIZE) {
      const chunk = bgyOps.slice(i, i + CHUNK_SIZE);
      await prisma.$transaction(chunk);
      if (i % 5000 === 0) console.log(`Inserted ${i} barangays...`);
    }

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
