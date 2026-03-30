import { ENV } from "../config/env.js";

export function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

export function getAdminEmails() {
  return (ENV.ADMIN_EMAIL || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

export function isAdminEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;
  return getAdminEmails().includes(normalizedEmail);
}
