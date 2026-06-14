import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

// Default password used if ADMIN_PASSWORD is not set as an environment
// variable. Set ADMIN_PASSWORD in Vercel/`.env.local` to override.
const DEFAULT_ADMIN_PASSWORD = "Pürksi2026!";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export function adminCookieValue(): string {
  return createHash("sha256").update(getAdminPassword()).digest("hex");
}

export function isAdminAuthenticated(): boolean {
  const cookie = cookies().get(COOKIE_NAME);
  return cookie?.value === adminCookieValue();
}

export { COOKIE_NAME };
