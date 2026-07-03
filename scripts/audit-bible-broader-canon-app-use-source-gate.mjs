#!/usr/bin/env node
import fs from "node:fs";

const gatePath = "data/bible/registry/broader-canon-app-use-source-gate-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const failures = [];
const gate = readJson(gatePath);
const governance = readJson(governancePath);
const status = readJson(statusPath);
const lane = status.lanes?.broader_canon;

if (gate.schema !== "broader-canon-app-use-source-gate-v1") failures.push({ type: "gate-schema-mismatch", actual: gate.schema });
if (gate.status !== "closed_app_safe_unsourced_candidates_quarantined") failures.push({ type: "gate-status-mismatch", actual: gate.status });
if (gate.scope?.candidateCount !== 38) failures.push({ type: "candidate-count-mismatch", actual: gate.scope?.candidateCount });
if (gate.scope?.textBearingCandidateCount !== 35) failures.push({ type: "text-bearing-count-mismatch", actual: gate.scope?.textBearingCandidateCount });
if (gate.scope?.zeroRowArtifactCount !== 3) failures.push({ type: "zero-row-count-mismatch", actual: gate.scope?.zeroRowArtifactCount });
if (gate.scope?.concreteSourcePointerCount !== 0) failures.push({ type: "source-pointer-count-mismatch", actual: gate.scope?.concreteSourcePointerCount });

const dispositions = Array.isArray(gate.dispositions) ? gate.dispositions : [];
if (dispositions.length !== 38) failures.push({ type: "disposition-count-mismatch", actual: dispositions.length });

const renderEligible = dispositions.filter((item) => item.appRenderEligible !== false);
if (renderEligible.length !== 0) failures.push({ type: "render-eligible-candidate-found", paths: renderEligible.map((item) => item.path) });

const trustEligible = dispositions.filter((item) => item.textTrustEligible !== false);
if (trustEligible.length !== 0) failures.push({ type: "text-trust-eligible-candidate-found", paths: trustEligible.map((item) => item.path) });

if (governance.status !== "app_use_source_gate_closed_unsourced_candidates_quarantined") failures.push({ type: "governance-status-mismatch", actual: governance.status });
if (governance.appUseSourceGate?.recordPath !== gatePath) failures.push({ type: "governance-gate-record-mismatch", actual: governance.appUseSourceGate?.recordPath || null });

if (lane?.status !== "not_trusted_textually_broader_canon_candidates_quarantined_app_safe") failures.push({ type: "lane-status-mismatch", actual: lane?.status || null });
if (lane?.appUseTrustReady !== true) failures.push({ type: "lane-app-use-trust-ready-mismatch", actual: lane?.appUseTrustReady });
if (lane?.textTrustReady !== false) failures.push({ type: "lane-text-trust-ready-mismatch", actual: lane?.textTrustReady });

for (const claim of gate.certifiedClaims || []) {
  if (!Array.isArray(lane?.allowedClaims) || !lane.allowedClaims.includes(claim)) failures.push({ type: "missing-lane-allowed-claim", claim });
}

for (const claim of gate.blockedClaims || []) {
  if (!Array.isArray(lane?.blockedClaims) || !lane.blockedClaims.includes(claim)) failures.push({ type: "missing-lane-blocked-claim", claim });
}

console.log(JSON.stringify({
  audit: "broader-canon-app-use-source-gate",
  status: failures.length ? "failed" : "passed",
  laneStatus: lane?.status || null,
  appUseTrustReady: lane?.appUseTrustReady || false,
  textTrustReady: lane?.textTrustReady || null,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair broader-canon app-use source gate.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: Broader-canon candidate corpus is app-safe by source gate; candidate text remains quarantined pending source collation.");
}

process.exit(failures.length ? 1 : 0);
