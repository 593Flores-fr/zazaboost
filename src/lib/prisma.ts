import path from "path";
import { pathToFileURL } from "url";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  const raw = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const filePath = raw.replace(/^file:/, "");
  const absPath = path.resolve(process.cwd(), filePath);
  const url = pathToFileURL(absPath).href;
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
