import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // SST / OpenNext generated output + the SST config's intentional triple-slash ref.
    ".sst/**",
    ".open-next/**",
    "sst-env.d.ts",
    "sst.config.ts",
  ]),
]);

export default eslintConfig;
