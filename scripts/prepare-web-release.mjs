import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const releaseDir = path.join(root, "web-release");
const zipPath = path.join(root, "web-release.zip");

const includeEntries = [
  "index.html",
  "admin",
  "components",
  "css",
  "data",
  "images",
  "js"
];

const adminReleaseFiles = [
  { source: "structure.json", target: "structure.json", required: true },
  { source: "project_roadmap.json", target: "project_roadmap.json", required: true },
  { source: "documentation/repo-hygiene-audit.json", target: "documentation/repo-hygiene-audit.json", required: false }
];

const browserQcReleaseFiles = [
  {
    source: "scripts/browser-qc-entry-mobile-stabilization-sweep.js",
    target: "scripts/browser-qc-entry-mobile-stabilization-sweep.js",
    required: true
  }
];

const denyNames = new Set([
  ".git",
  ".github",
  "node_modules",
  "scripts",
  "tools",
  "documentation",
  "resources",
  "web-release",
  // Raw audit/citation source material (reference-book PDFs, zipped source
  // corpora) for the calendar/synaxarium work. Never read by the live app
  // at runtime, and much of it is copyrighted reference material that must
  // not be uploaded to a public web root. See scripts/audit-repo-hygiene.mjs
  // for the broader repo-hygiene sweep this belongs alongside.
  "source-witnesses"
]);

const denyFilePatterns = [
  /^package(-lock)?\.json$/,
  /^patch_.*\.(py|js|mjs|sh)$/,
  /^.*\.bak$/,
  /^.*\.tmp$/,
  /^.*\.log$/
];

function fail(message) {
  console.error(`FAIL release:web: ${message}`);
  process.exit(1);
}

function ensureExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`required runtime entry missing: ${relativePath}`);
  }
}

function rmIfExists(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function shouldDeny(relativePath) {
  const parts = relativePath.split(path.sep);
  if (parts.some((part) => denyNames.has(part))) return true;
  const base = path.basename(relativePath);
  return denyFilePatterns.some((pattern) => pattern.test(base));
}

function copyRecursive(source, target, relativePath = "") {
  if (shouldDeny(relativePath)) return;

  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source).sort()) {
      copyRecursive(
        path.join(source, entry),
        path.join(target, entry),
        path.join(relativePath, entry)
      );
    }
    return;
  }

  if (stat.isFile()) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

function walkFiles(dir) {
  const out = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current).sort()) {
      const full = path.join(current, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (stat.isFile()) {
        out.push(path.relative(dir, full).replaceAll(path.sep, "/"));
      }
    }
  }
  walk(dir);
  return out;
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const splitZipNames = [
  "web-release-roman-breviary-data.zip",
  "web-release-remaining-data.zip",
  "web-release-app-shell.zip"
];

for (const entry of includeEntries) ensureExists(entry);

rmIfExists(releaseDir);
rmIfExists(zipPath);
for (const name of splitZipNames) rmIfExists(path.join(root, name));
fs.mkdirSync(releaseDir, { recursive: true });

for (const entry of includeEntries) {
  copyRecursive(path.join(root, entry), path.join(releaseDir, entry), entry);
}

function copyAdminReleaseFile(spec) {
  const sourcePath = path.join(root, spec.source);
  const targetPath = path.join(releaseDir, spec.target);

  if (!fs.existsSync(sourcePath)) {
    if (spec.required) fail(`required admin release support file missing: ${spec.source}`);
    return false;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
  return true;
}

const copiedAdminReleaseFiles = adminReleaseFiles
  .filter(copyAdminReleaseFile)
  .map((spec) => spec.target);

const copiedBrowserQcReleaseFiles = browserQcReleaseFiles
  .filter(copyAdminReleaseFile)
  .map((spec) => spec.target);

const htaccess = `# Universal Office static-app routing.
# Upload this before enabling hosting-level password protection.
# If cPanel Directory Privacy later adds AuthType/AuthUserFile lines,
# do not overwrite them during routine uploads.

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;

fs.writeFileSync(path.join(releaseDir, ".htaccess"), htaccess, "utf-8");

const files = walkFiles(releaseDir);
const manifest = {
  generatedAt: new Date().toISOString(),
  purpose: "Deployable browser-runtime export for theuniversaloffice.com.",
  uploadInstruction: "Upload the contents of web-release/ to the domain web root, not the repository itself.",
  accessControlInstruction: "Use hosting-level password protection for the web root. Do not encode access state in route, file, or directory names.",
  includedRoots: includeEntries,
  adminReleaseSupportFiles: copiedAdminReleaseFiles,
  browserQcReleaseFiles: copiedBrowserQcReleaseFiles,
  excludedRoots: Array.from(denyNames).sort(),
  fileCount: files.length,
  files: files.map((file) => ({
    path: file,
    sha256: sha256(path.join(releaseDir, file))
  }))
};

fs.writeFileSync(
  path.join(releaseDir, "DEPLOYMENT_MANIFEST.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf-8"
);

// Delivery-channel cap, discovered 2026-09-27 (see AUDIT_GOVERNANCE_LEDGER.md that date): whatever
// channel carries this zip to Josh for upload rejects anything over ~30MB. A single web-release.zip
// crossed that threshold once the Roman Breviary corpus grew large enough, and had to be split by
// hand into three independent zips that don't need to be reassembled -- each just unzips into the
// same destination folder. Automated here so that never has to be done by hand again: always write
// the single web-release.zip first (kept as the one-file case / for local inspection), then, only if
// it's actually over the cap, ALSO write three split zips next to it. If even the split parts don't
// fit under the cap, fail loudly rather than silently ship something the delivery channel will
// reject -- per this project's standing practice of failing loudly instead of guessing.
const SPLIT_SIZE_CAP_BYTES = 30 * 1024 * 1024;

execFileSync("python3", ["-c", `
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path("web-release")
zip_path = Path("web-release.zip")
with ZipFile(zip_path, "w", ZIP_DEFLATED) as z:
    for p in sorted(root.rglob("*")):
        if p.is_file():
            z.write(p, p.relative_to(root))
print(f"wrote {zip_path} with contents of {root}/")
`], { stdio: "inherit" });

const combinedZipSize = fs.statSync(zipPath).size;
console.log(`PASS release:web: files=${files.length} output=web-release/ zip=web-release.zip (${(combinedZipSize / (1024 * 1024)).toFixed(1)}MB)`);

if (combinedZipSize > SPLIT_SIZE_CAP_BYTES) {
  console.log(`web-release.zip exceeds the ${(SPLIT_SIZE_CAP_BYTES / (1024 * 1024)).toFixed(0)}MB delivery-channel cap -- auto-splitting into 3 independent zips.`);

  const splitSpecs = [
    { name: "web-release-roman-breviary-data.zip", include: ["data/roman-breviary-1960-1962"], exclude: [] },
    { name: "web-release-remaining-data.zip", include: ["data"], exclude: ["data/roman-breviary-1960-1962"] },
    { name: "web-release-app-shell.zip", include: [""], exclude: ["data"] }
  ];

  execFileSync("python3", ["-c", `
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path("web-release")
specs = json.loads(${JSON.stringify(JSON.stringify(splitSpecs))})
cap_bytes = ${SPLIT_SIZE_CAP_BYTES}

def under(rel, prefixes):
    return any(p == "" or rel == p or rel.startswith(p + "/") for p in prefixes)

for spec in specs:
    zip_path = Path(spec["name"])
    with ZipFile(zip_path, "w", ZIP_DEFLATED) as z:
        for p in sorted(root.rglob("*")):
            if not p.is_file():
                continue
            rel = p.relative_to(root).as_posix()
            if not under(rel, spec["include"]):
                continue
            if spec["exclude"] and under(rel, spec["exclude"]):
                continue
            z.write(p, rel)
    size_mb = zip_path.stat().st_size / (1024 * 1024)
    print(f"wrote {zip_path} ({size_mb:.1f}MB)")
    if zip_path.stat().st_size > cap_bytes:
        print(f"FAIL release:web: {zip_path} is still over the delivery-channel cap after splitting -- the split boundaries need revisiting, not a bigger cap.")
        raise SystemExit(1)
`], { stdio: "inherit" });

  console.log("PASS release:web: 3-way split complete -- deliver all three zips together, they unzip into the same destination and don't overlap.");
}
