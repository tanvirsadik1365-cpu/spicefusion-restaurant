import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
const env = { ...process.env };

try {
  const file = readFileSync(envPath, "utf8");

  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    env[key] = value;
  }
} catch {
  // Production hosts normally provide environment variables directly.
}

const required = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESTAURANT_ID",
  "MERCHANT_DASHBOARD_TOKEN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

const placeholderPatterns = [
  /^$/,
  /your_/i,
  /choose-a/i,
  /placeholder/i,
  /example/i,
];

const errors = [];

for (const key of required) {
  const value = env[key]?.trim() ?? "";

  if (placeholderPatterns.some((pattern) => pattern.test(value))) {
    errors.push(`${key} is missing or still uses a placeholder.`);
  }
}

if (env.RESTAURANT_ID?.trim() !== "spicefusion-restaurant") {
  errors.push("RESTAURANT_ID must be spicefusion-restaurant.");
}

try {
  new URL(env.NEXT_PUBLIC_SITE_URL);
} catch {
  errors.push("NEXT_PUBLIC_SITE_URL must be a valid URL.");
}

try {
  new URL(env.NEXT_PUBLIC_SUPABASE_URL);
} catch {
  errors.push("NEXT_PUBLIC_SUPABASE_URL must be a valid URL.");
}

if (errors.length > 0) {
  console.error("Production environment check failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("Production environment check passed.");
