import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";

async function verifyDatabase(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg(databaseUrl),
  });

  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log("Database connected ✅");
    console.log(result);
  } finally {
    await prisma.$disconnect();
  }
}

async function start(): Promise<void> {
  try {
    await verifyDatabase();
  } catch (e) {
    console.error("Connection failed ❌", e);
    process.exit(1);
  }

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(clerkMiddleware());

  app.get("/", (req, res) => {
    res.json({ message: "API is working 🚀" });
  });

  app.use("/api/users", userRoutes);
  app.use("/api/admin", adminRoutes);

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

void start();
