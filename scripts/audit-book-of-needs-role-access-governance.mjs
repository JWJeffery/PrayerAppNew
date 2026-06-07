#!/usr/bin/env node
import fs from "node:fs";

const GOVERNANCE_PATH = "documentation/book-of-needs-role-access-governance.json";

const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (error) {
    fail(`${path} is not readable JSON: ${error.message}`);
    return null;
  }
}

const governance = readJson(GOVERNANCE_PATH);

if (governance) {
  if (governance.governanceVersion !== "book_of_needs_role_access_governance_v1") {
    fail("governanceVersion must be book_of_needs_role_access_governance_v1.");
  }

  if (!String(governance.coreDecision || "").includes("role-aware, not merely role-restrictive")) {
    fail("coreDecision must preserve the role-aware-not-merely-restrictive decision.");
  }

  if (governance.firstPublicIntakeSplash?.roleQuestionAllowed !== false) {
    fail("Role questions must not be allowed on the first public intake splash.");
  }

  const forbiddenLabels = governance.firstPublicIntakeSplash?.forbiddenOptionLabels || [];
  if (!forbiddenLabels.includes("Just show ordinary devotional prayers")) {
    fail("The rejected 'Just show ordinary devotional prayers' option must remain forbidden.");
  }

  const allowedWhen = governance.roleDiscernment?.allowedWhen || [];
  const notAllowedWhen = governance.roleDiscernment?.notAllowedWhen || [];
  if (!allowedWhen.some((item) => item.includes("after tradition/family selection"))) {
    fail("Role discernment must be allowed after tradition/family selection, not before it.");
  }
  if (!notAllowedWhen.includes("initial public intake splash")) {
    fail("Initial public intake splash must remain a forbidden role-discernment context.");
  }

  const easternRoles = new Set(governance.roleDiscernment?.easternChristianRoles || []);
  for (const role of ["layperson", "reader", "subdeacon", "deacon", "priest", "bishop", "monastic", "research-reference"]) {
    if (!easternRoles.has(role)) {
      fail(`Missing Eastern role: ${role}`);
    }
  }

  const accessTiers = new Set(governance.accessTiers || []);
  for (const tier of ["lay-devotional", "lay-with-rubric", "reader", "subdeacon", "deacon", "priest", "bishop", "monastic", "clergy-reference", "research-hidden"]) {
    if (!accessTiers.has(tier)) {
      fail(`Missing access tier: ${tier}`);
    }
  }

  const displayCategories = new Set(governance.displayCategories || []);
  for (const category of ["devotional-need", "preparation-for-service", "vesting", "silent-prayer", "secret-prayer", "blessing", "sacramental-rite", "absolution", "exorcistic", "ordination-related", "funeral-memorial", "reference"]) {
    if (!displayCategories.has(category)) {
      fail(`Missing display category: ${category}`);
    }
  }

  const principlesText = (governance.roleAccessPrinciples || []).join("\n");
  if (!principlesText.includes("Subdeacon access must not unlock deaconal")) {
    fail("Subdeacon order-specific access guardrail is missing.");
  }
  if (!principlesText.includes("Deacon access must not unlock priestly")) {
    fail("Deacon order-specific access guardrail is missing.");
  }
  if (!principlesText.includes("Episcopal material must not be presented as priestly")) {
    fail("Episcopal order-specific access guardrail is missing.");
  }

  if (governance.defaultBookOfNeeds?.accessTier !== "lay-devotional") {
    fail("Default Book of Needs access tier must be lay-devotional.");
  }
  if (governance.defaultBookOfNeeds?.visibleByDefault !== true) {
    fail("Default Book of Needs must remain visible by default.");
  }

  const ingestionText = (governance.futureIngestionRequirements || []).join("\n");
  if (!ingestionText.includes("Before importing from the Big Book of Needs")) {
    fail("Big Book of Needs pre-ingestion classification requirement is missing.");
  }
  if (!ingestionText.includes("Do not dump priestly")) {
    fail("Default-dropdown clergy-proper import guardrail is missing.");
  }
  if (!ingestionText.includes("Silent or secret prayers")) {
    fail("Silent/secret prayer role-appropriate ingestion requirement is missing.");
  }

  const serialized = JSON.stringify(governance);
  if (/permission anxiety|needs[- ]permission[- ]review|do not import/i.test(serialized)) {
    fail("Role access governance must not reintroduce permission-anxiety/import-blocking language.");
  }
}

if (failures.length) {
  console.error("FAIL Book of Needs role access governance audit");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS Book of Needs role access governance audit: checks=16");
