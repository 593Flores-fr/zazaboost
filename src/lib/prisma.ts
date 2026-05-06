import path from "path";
import { pathToFileURL } from "url";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

  // Turso / LibSQL distant
  if (url.startsWith("libsql://") || url.startsWith("wss://") || url.startsWith("ws://")) {
    const adapter = new PrismaLibSql({ url });
    return new PrismaClient({ adapter });
  }

  // SQLite local — conversion en file URL (nécessaire sur Windows)
  const filePath = url.replace(/^file:/, "");
  const absPath = path.resolve(process.cwd(), filePath);
  const fileUrl = pathToFileURL(absPath).href;
  const adapter = new PrismaLibSql({ url: fileUrl });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
