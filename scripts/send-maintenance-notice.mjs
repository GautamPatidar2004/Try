#!/usr/bin/env node
/* =============================================================================
 * Send an IN-APP maintenance-window notification to ALL users (one row each in
 * the `notifications` table). Fully scriptable — no admin UI needed.
 *
 * Auth: pass the Supabase SECRET (service-role) key at runtime; it bypasses RLS.
 *   DO NOT hardcode it and DO NOT put it back in .env (VITE_ vars are public).
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=sb_secret_… node scripts/send-maintenance-notice.mjs            # DRY RUN (default)
 *   SUPABASE_SERVICE_KEY=sb_secret_… node scripts/send-maintenance-notice.mjs --send     # actually insert
 *   SUPABASE_SERVICE_KEY=sb_secret_… node scripts/send-maintenance-notice.mjs --undo     # delete the notice
 *
 * Customize the text via env (optional):
 *   TITLE="…"  MESSAGE="…"  TYPE="platform_announcement"
 * ========================================================================== */

const URL = process.env.SUPABASE_URL || "https://dkahqqmcmwfaxjxmfxne.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_KEY;
const TYPE = process.env.TYPE || "platform_announcement";
const TITLE = process.env.TITLE || "Scheduled maintenance — Sun Jun 28, 2:00 PM";
const MESSAGE =
  process.env.MESSAGE ||
  "We're performing scheduled maintenance on Sunday, June 28 at 2:00 PM. " +
    "You may notice a brief interruption while we upgrade our hosting. No action is needed and your data is safe.";

const SEND = process.argv.includes("--send");
const UNDO = process.argv.includes("--undo");

if (!KEY) {
  console.error("ERROR: set SUPABASE_SERVICE_KEY (the sb_secret_… key) in the environment.");
  process.exit(1);
}

const h = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function getAllProfileIds() {
  const ids = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(`${URL}/rest/v1/profiles?select=id`, {
      headers: { ...h, Range: `${from}-${from + PAGE - 1}`, Prefer: "count=exact" },
    });
    if (!res.ok) throw new Error(`fetch profiles failed: ${res.status} ${await res.text()}`);
    const rows = await res.json();
    ids.push(...rows.map((r) => r.id));
    if (rows.length < PAGE) break;
  }
  return ids;
}

async function chunkedInsert(rows) {
  const SIZE = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += SIZE) {
    const batch = rows.slice(i, i + SIZE);
    const res = await fetch(`${URL}/rest/v1/notifications`, {
      method: "POST",
      headers: { ...h, Prefer: "return=minimal" },
      body: JSON.stringify(batch),
    });
    if (!res.ok) throw new Error(`insert failed (batch ${i}): ${res.status} ${await res.text()}`);
    inserted += batch.length;
    console.log(`  inserted ${inserted}/${rows.length}`);
  }
  return inserted;
}

async function undo() {
  // Deletes notices with this exact title. Service key bypasses RLS.
  const res = await fetch(
    `${URL}/rest/v1/notifications?title=eq.${encodeURIComponent(TITLE)}`,
    { method: "DELETE", headers: { ...h, Prefer: "return=minimal" } },
  );
  if (!res.ok) throw new Error(`undo failed: ${res.status} ${await res.text()}`);
  console.log(`Deleted all notifications with title: "${TITLE}"`);
}

(async () => {
  if (UNDO) return undo();

  const ids = await getAllProfileIds();
  console.log(`Recipients (profiles): ${ids.length}`);
  console.log(`Title:   ${TITLE}`);
  console.log(`Message: ${MESSAGE}`);
  console.log(`Type:    ${TYPE}`);

  if (!SEND) {
    console.log("\nDRY RUN — nothing sent. Re-run with --send to insert these notifications.");
    return;
  }

  const rows = ids.map((id) => ({ user_id: id, title: TITLE, message: MESSAGE, type: TYPE }));
  const n = await chunkedInsert(rows);
  console.log(`\nDone — ${n} in-app notifications created. (Undo with --undo.)`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
