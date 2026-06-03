import fs from "node:fs";

const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf-8"));
  } catch (error) {
    fail(`${path} is missing or invalid JSON: ${error.message}`);
    return null;
  }
}

if (!fs.existsSync("web-release")) {
  fail("web-release/ does not exist. Run npm run release:web first.");
}

const structure = readJson("web-release/structure.json");
const roadmap = readJson("web-release/project_roadmap.json");

if (fs.existsSync("documentation/repo-hygiene-audit.json")) {
  readJson("web-release/documentation/repo-hygiene-audit.json");
}

const manifest = readJson("web-release/DEPLOYMENT_MANIFEST.json");
const adminHtml = fs.readFileSync("admin/admin.html", "utf-8");

if (!adminHtml.includes("../structure.json")) {
  fail("admin/admin.html no longer references ../structure.json; audit needs updating.");
}

if (!adminHtml.includes("../project_roadmap.json")) {
  fail("admin/admin.html no longer references ../project_roadmap.json; audit needs updating.");
}

if (!structure?.project_manifest && !structure?.roadmap_summary && !structure?.admin) {
  fail("web-release/structure.json does not look like the admin dashboard structure source.");
}

if (!roadmap?.release_identity && !roadmap?.phase_plan && !roadmap?.major_tradition_families) {
  fail("web-release/project_roadmap.json does not look like the admin dashboard roadmap source.");
}

if (!manifest?.adminReleaseSupportFiles?.includes("structure.json")) {
  fail("DEPLOYMENT_MANIFEST.json does not record structure.json as an admin release support file.");
}

if (!manifest?.adminReleaseSupportFiles?.includes("project_roadmap.json")) {
  fail("DEPLOYMENT_MANIFEST.json does not record project_roadmap.json as an admin release support file.");
}

if (failures.length) {
  console.error("FAIL admin release support audit");
  for (const item of failures) console.error(" - " + item);
  process.exit(1);
}

console.log("PASS admin release support audit: dashboard JSON files included in web-release");
