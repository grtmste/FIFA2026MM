import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

export function adminCookieValue(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return createHash("sha256").update(password).digest("hex");
}

export function isAdminAuthenticated(): boolean {
  const cookie = cookies().get(COOKIE_NAME);
  return cookie?.value === adminCookieValue();
}

export { COOKIE_NAME };
