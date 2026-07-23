/**
 * Admin designation (T-192, ADR-021). Admins are configured out-of-band via the ADMIN_EMAILS env var
 * (comma-separated), like JWT_SECRET / BREVO_API_KEY — no schema, no admin panel. Admin gates
 * creating 'official' presets and moderating Community (unpublish/delete any preset). Single home for
 * both the /me flag and the presets handlers.
 */

/** Parse "a@x.com, B@Y.com" → ['a@x.com','b@y.com'] (trimmed, lowercased, empties dropped). */
export function parseAdminEmails(raw) {
  return String(raw || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Case-insensitive membership test. */
export function isAdminEmail(email, adminEmails) {
  if (!email) return false;
  return (adminEmails || []).includes(String(email).trim().toLowerCase());
}
