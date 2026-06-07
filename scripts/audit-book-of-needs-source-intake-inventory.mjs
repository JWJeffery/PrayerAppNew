#!/usr/bin/env node
import fs from "node:fs";

const INVENTORY_PATH = "documentation/book-of-needs-source-intake-inventory.json";

const allowedInventoryTraditions = new Set(["OO", "COE"]);
const forbiddenAssignmentBuckets = new Set(["UNIVERSAL", "ECU", "COMMON", "COMMON_PRAYER", "ALL"]);
const validBookOfNeedsTraditions = new Set(["ANG", "LC", "EO", "OO", "COE"]);
const allowedClassifications = new Set([
  "received-traditional",
  "translated",
  "adapted",
  "public-domain",
  "needs-review"
]);
const allowedIntegrationDispositions = new Set([
  "source-lead-only"
]);
const rejectedSyntheticIds = new Set([
  "oo-before-liturgy",
  "oo-for-the-sick",
  "oo-for-peace",
  "oo-thanksgiving-after-communion",
  "coe-before-qurbana",
  "coe-for-the-sick",
  "coe-for-peace",
  "coe-thanksgiving-after-communion"
]);
const forbiddenTextKeys = new Set([
  "prayerText",
  "liturgicalText",
  "fullText",
  "body",
  "content",
  "html",
  "markdown",
  "translatedText",
  "englishText",
  "syriacText",
  "copticText",
  "armenianText",
  "geezText",
  "amharicText"
]);
const forbiddenGovernanceKeys = new Set([
  "rightsPosture",
  "publicDomainPermissionStatus",
  "permissionRecordId",
  "licensingStatus",
  "redistributionStatus"
]);
const importBlockingPatterns = [
  /needs[- ]permission[- ]review/i,
  /do not import/i,
  /not import permission/i,
  /not redistribution permission/i,
  /redistribution permission/i,
  /source lead does not authorize import/i,
  /current terms block/i,
  /permission anxiety/i
];

const requiredCandidateFields = [
  "id",
  "tradition",
  "sourceFamily",
  "sourceTitle",
  "sourceType",
  "sourceLocation",
  "sourceLocationUrl",
  "sourceLanguage",
  "sourceUseCase",
  "classification",
  "translationPosture",
  "sourcePosture",
  "corpusUsePosture",
  "publicRenderingPosture",
  "confidence",
  "integrationDisposition",
  "neededBeforeCorpusEntry",
  "notes"
];

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

function walk(value, visitor, path = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visitor, [...path, String(index)]));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      visitor(key, child, [...path, key]);
      walk(child, visitor, [...path, key]);
    }
  }
}

const inventory = readJson(INVENTORY_PATH);

if (inventory) {
  if (inventory.inventoryVersion !== "book_of_needs_source_intake_inventory_v1") {
    fail("inventoryVersion must be book_of_needs_source_intake_inventory_v1.");
  }

  if (!String(inventory.scope || "").includes("supports later internal corpus construction")) {
    fail("scope must explicitly say the inventory supports later internal corpus construction.");
  }

  const posture = inventory.governancePosture || {};
  if (posture.universalIsAccessContextOnly !== true) {
    fail("governancePosture.universalIsAccessContextOnly must be true.");
  }
  if (posture.noPrayerTextImported !== true) {
    fail("governancePosture.noPrayerTextImported must be true for the source-lead inventory itself.");
  }
  if (posture.sourceInventoryDoesNotBlockInternalCorpusConstruction !== true) {
    fail("Inventory must not block internal corpus construction.");
  }
  if (posture.publicRenderingIsSeparateFromInternalCorpusConstruction !== true) {
    fail("Public rendering must be separate from internal corpus construction.");
  }
  if (posture.noHeavyPerPrayerRightsSchema !== true) {
    fail("Inventory must preserve the no-heavy-per-prayer-rights-schema decision.");
  }
  if (posture.prayersAreForDevotionalUse !== true) {
    fail("Inventory must preserve the prayer/devotional-use posture.");
  }
  if ("sourceLeadDoesNotAuthorizeImport" in posture) {
    fail("Remove sourceLeadDoesNotAuthorizeImport; it is import-blocking governance language.");
  }

  const declaredTraditions = new Set(posture.validBookOfNeedsTraditionCodes || []);
  for (const code of declaredTraditions) {
    if (!validBookOfNeedsTraditions.has(code)) {
      fail(`Invalid declared Book of Needs tradition code: ${code}`);
    }
  }
  for (const bucket of posture.forbiddenAssignmentBuckets || []) {
    if (!forbiddenAssignmentBuckets.has(bucket)) {
      fail(`Unexpected forbidden assignment bucket declaration: ${bucket}`);
    }
  }

  const candidates = inventory.candidateSourceLeads;
  if (!Array.isArray(candidates)) {
    fail("candidateSourceLeads must be an array.");
  } else {
    if (candidates.length < 8) {
      fail("candidateSourceLeads should include a useful first intake set, not a token placeholder.");
    }

    const ids = new Set();
    const counts = { OO: 0, COE: 0 };

    for (const candidate of candidates) {
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
        fail("Each candidate source lead must be an object.");
        continue;
      }

      for (const field of requiredCandidateFields) {
        if (!(field in candidate)) {
          fail(`Candidate ${candidate.id || "(missing id)"} is missing required field ${field}.`);
        }
      }

      for (const forbiddenField of forbiddenGovernanceKeys) {
        if (forbiddenField in candidate) {
          fail(`Candidate ${candidate.id || "(missing id)"} has removed governance field ${forbiddenField}.`);
        }
      }

      if (typeof candidate.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate.id)) {
        fail(`Candidate id must be lowercase kebab-case: ${candidate.id}`);
      }

      if (ids.has(candidate.id)) {
        fail(`Duplicate candidate id: ${candidate.id}`);
      }
      ids.add(candidate.id);

      if (rejectedSyntheticIds.has(candidate.id)) {
        fail(`Rejected synthetic prayer id appears in source inventory: ${candidate.id}`);
      }

      if (!allowedInventoryTraditions.has(candidate.tradition)) {
        fail(`Candidate ${candidate.id} must be OO or COE, found ${candidate.tradition}.`);
      } else {
        counts[candidate.tradition] += 1;
        const expectedPrefix = `${candidate.tradition.toLowerCase()}-`;
        if (!candidate.id.startsWith(expectedPrefix)) {
          fail(`Candidate ${candidate.id} must start with ${expectedPrefix}.`);
        }
      }

      if (forbiddenAssignmentBuckets.has(candidate.tradition)) {
        fail(`Forbidden tradition assignment bucket appears: ${candidate.tradition}`);
      }

      if (!allowedClassifications.has(candidate.classification)) {
        fail(`Candidate ${candidate.id} has invalid classification: ${candidate.classification}`);
      }

      if (!allowedIntegrationDispositions.has(candidate.integrationDisposition)) {
        fail(`Candidate ${candidate.id} has invalid integrationDisposition: ${candidate.integrationDisposition}`);
      }

      if (candidate.integrationDisposition !== "source-lead-only") {
        fail(`Candidate ${candidate.id} must remain source-lead-only in this inventory.`);
      }

      if (candidate.classification === "original") {
        fail(`Original material may not be represented as an OO/COE tradition-specific source lead: ${candidate.id}`);
      }

      if (typeof candidate.sourceLocationUrl !== "string" || !/^https?:\/\//.test(candidate.sourceLocationUrl)) {
        fail(`Candidate ${candidate.id} must include an http(s) sourceLocationUrl.`);
      }

      if (!Array.isArray(candidate.sourceLanguage) || candidate.sourceLanguage.length === 0) {
        fail(`Candidate ${candidate.id} must list sourceLanguage.`);
      }

      if (!Array.isArray(candidate.sourceUseCase) || candidate.sourceUseCase.length === 0) {
        fail(`Candidate ${candidate.id} must list sourceUseCase.`);
      }

      if (!Array.isArray(candidate.neededBeforeCorpusEntry) || candidate.neededBeforeCorpusEntry.length === 0) {
        fail(`Candidate ${candidate.id} must list neededBeforeCorpusEntry.`);
      }

      if (/blocked|do-not-import|not-import/i.test(String(candidate.corpusUsePosture || ""))) {
        fail(`Candidate ${candidate.id} has import-blocking corpusUsePosture: ${candidate.corpusUsePosture}`);
      }
    }

    if (counts.OO < 4) {
      fail(`Expected at least 4 OO candidate source leads, found ${counts.OO}.`);
    }
    if (counts.COE < 4) {
      fail(`Expected at least 4 COE candidate source leads, found ${counts.COE}.`);
    }
  }

  const activeCounts = inventory.activeTaxonomyCountsAtIntake || {};
  if (activeCounts.OO !== 1) {
    fail("activeTaxonomyCountsAtIntake.OO must preserve the known thin gap count of 1.");
  }
  if (activeCounts.COE !== 0) {
    fail("activeTaxonomyCountsAtIntake.COE must preserve the known empty gap count of 0.");
  }

  walk(inventory, (key, value, path) => {
    if (forbiddenTextKeys.has(key)) {
      fail(`Forbidden prayer-text field appears at ${path.join(".")}.`);
    }

    if (forbiddenGovernanceKeys.has(key)) {
      fail(`Removed rights/permission schema field appears at ${path.join(".")}.`);
    }

    if (typeof value === "string") {
      if (forbiddenAssignmentBuckets.has(value)) {
        fail(`Forbidden assignment bucket value appears at ${path.join(".")}: ${value}`);
      }

      for (const pattern of importBlockingPatterns) {
        if (pattern.test(value)) {
          fail(`Import-blocking or permission-anxiety phrase appears at ${path.join(".")}: ${value}`);
        }
      }

      for (const rejectedId of rejectedSyntheticIds) {
        if (value === rejectedId) {
          fail(`Rejected synthetic prayer id appears at ${path.join(".")}: ${value}`);
        }
      }

      if (value.length > 900) {
        fail(`Suspiciously long text value at ${path.join(".")} suggests imported prose rather than metadata.`);
      }
    }
  });
}

if (failures.length) {
  console.error("FAIL book-of-needs source intake inventory audit");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

const candidates = inventory.candidateSourceLeads;
const ooCount = candidates.filter((candidate) => candidate.tradition === "OO").length;
const coeCount = candidates.filter((candidate) => candidate.tradition === "COE").length;

console.log(`PASS book-of-needs source intake inventory audit: candidates=${candidates.length} OO=${ooCount} COE=${coeCount} checks=14`);
