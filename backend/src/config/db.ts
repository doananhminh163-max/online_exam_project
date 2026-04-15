import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import 'dotenv/config';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Initialize the Prisma Better-SQLite3 adapter
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || "./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({
  url: dbPath
});

// Pass the adapter to PrismaClient
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;