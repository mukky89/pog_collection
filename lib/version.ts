import pkg from "@/package.json";

/** Verzia aplikácie z package.json. */
export const APP_VERSION = pkg.version;

/**
 * Krátky commit SHA z prostredia (Railway nastavuje RAILWAY_GIT_COMMIT_SHA).
 * Fallback "dev" pri lokálnom behu.
 */
export const BUILD_SHA = (
  process.env.RAILWAY_GIT_COMMIT_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GIT_COMMIT_SHA ||
  "dev"
).slice(0, 7);

/** Zobraziteľný štítok verzie, napr. "v1.2.0 · a1b2c3d". */
export const VERSION_LABEL = `v${APP_VERSION} · ${BUILD_SHA}`;
