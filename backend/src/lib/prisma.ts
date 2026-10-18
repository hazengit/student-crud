
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

const required = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

const adapter = new PrismaMssql({
  server: process.env.DB_HOST!,
  port: 1433,
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
});

export const prisma = new PrismaClient({ adapter });
