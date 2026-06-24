import { defineConfig } from "@prisma/config";

export default defineConfig({
  migrations: {
    seed: "node seed.cjs",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
