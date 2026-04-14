import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

type GlobalPrisma = {
	prisma?: PrismaClient;
	prismaPool?: Pool;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

const prismaPool =
	globalForPrisma.prismaPool ??
	new Pool({
		connectionString: process.env.DATABASE_URL,
		max: 3,
		idleTimeoutMillis: 10_000,
		connectionTimeoutMillis: 5_000,
	});

const adapter = new PrismaPg(prismaPool);

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		errorFormat: 'pretty',
	});

if (!globalForPrisma.prisma) {
	globalForPrisma.prisma = prisma;
}

if (!globalForPrisma.prismaPool) {
	globalForPrisma.prismaPool = prismaPool;
}
