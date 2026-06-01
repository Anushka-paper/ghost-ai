import "dotenv/config";
import { defineConfig } from "@trigger.dev/sdk";
import { syncEnvVars } from "@trigger.dev/build/extensions/core";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

const envVars = [
  "DATABASE_URL",
  "TRIGGER_PROJECT_REF",
  "TRIGGER_SECRET_KEY",
  "CLERK_SECRET_KEY",
  "LIVEBLOCKS_SECRET_KEY",
  "BLOB_READ_WRITE_TOKEN",
  "GOOGLE_AI_API_KEY",
];

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF!,
  runtime: "node",
  dirs: ["trigger"],
  maxDuration: 3600,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
    },
  },
  build: {
    extensions: [
      prismaExtension({
        schema: "prisma/schema.prisma",
      }),
      syncEnvVars(async () =>
        envVars
          .filter((name) => process.env[name] !== undefined)
          .map((name) => ({ name, value: process.env[name]! }))
      ),
    ],
  },
});