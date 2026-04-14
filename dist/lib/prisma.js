"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const globalForPrisma = globalThis;
const prismaPool = globalForPrisma.prismaPool ??
    new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        max: 3,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 5_000,
    });
const adapter = new adapter_pg_1.PrismaPg(prismaPool);
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        adapter,
        errorFormat: "pretty",
    });
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = exports.prisma;
}
if (!globalForPrisma.prismaPool) {
    globalForPrisma.prismaPool = prismaPool;
}
//# sourceMappingURL=prisma.js.map