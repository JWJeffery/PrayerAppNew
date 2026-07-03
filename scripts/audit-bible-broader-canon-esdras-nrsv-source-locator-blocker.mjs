#!/usr/bin/env node
import fs from "fs";

const recordPath = "data/bible/registry/broader-canon-esdras-nrsv-source-locator-blocker-2026-07-03.json";
const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
const failures = [];

if (record.status !== "esdras_nrsv_repair_blocked_pending_source_locator") failures.push("unexpected status");
if (record.summary?.activeRowsChecked !== 1319) failures.push("expected 1319 active rows checked");
if (record.summary?.existingNrsVRows !== 109) failures.push("expected 109 existing NRSV rows");
if (record.summary?.remainingKnownActiveOtNrsVGapRows !== 1210) failures.push("expected 1210 remaining NRSV gap rows");
if (record.summary?.remainingKnownActiveOtNrsVGapBooks?.["1ESDRAS"] !== 410) failures.push("expected 410 1 Esdras NRSV gaps");
if (record.summary?.remainingKnownActiveOtNrsVGapBooks?.["2ESDRAS"] !== 800) failures.push("expected 800 2 Esdras NRSV gaps");
if (record.summary?.localNrsVOrBibleGatewaySourceSnapshotsFound !== 0) failures.push("expected zero local NRSV/BibleGateway source snapshots");
if (record.summary?.localWebbeSourceSnapshotsFound !== 0) failures.push("expected zero local WEBBE source snapshots");
if (record.summary?.activeBibleTextMutation !== "none") failures.push("active Bible text mutation must be none");
if (record.summary?.globalTrustPromotion !== "not_performed") failures.push("global trust promotion must not be performed");
if ((record.failures || []).length) failures.push("record contains failures");

for (const claim of [
  "one_esdras_two_esdras_nrsv_repaired",
  "broader_canon_active_ot_nrsv_complete",
  "broader_canon_textually_trusted",
  "webbe_text_can_be_written_as_nrsv",
  "esdras_gaps_can_be_filled_from_drb_or_kjv",
  "broader_canon_global_trust_promoted"
]) {
  if (!(record.blockedClaims || []).includes(claim)) failures.push("missing blocked claim: " + claim);
}

console.log(JSON.stringify({
  audit: "broader_canon_esdras_nrsv_source_locator_blocker",
  status: failures.length ? "FAIL" : "PASS",
  recordPath,
  summary: record.summary,
  failures
}, null, 2));

process.exit(failures.length ? 1 : 0);
