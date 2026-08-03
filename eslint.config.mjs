import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "node_modules/**", "prisma/migrations/**"],
  },
  {
    rules: {
      // Server actions/services intentionally use loose Json payload typing
      // (notification_jobs.payload, Stripe/Razorpay webhook bodies).
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
