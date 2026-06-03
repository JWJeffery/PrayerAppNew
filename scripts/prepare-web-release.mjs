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

const denyNames = new Set([
  ".git",
  ".github",
  "node_modules",
  "scripts",
  "tools",
  "documentation",
  "resources",
  "web-release"
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

for (const entry of includeEntries) ensureExists(entry);

rmIfExists(releaseDir);
rmIfExists(zipPath);
fs.mkdirSync(releaseDir, { recursive: true });

for (const entry of includeEntries) {
  copyRecursive(path.join(root, entry), path.join(releaseDir, entry), entry);
}

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

console.log(`PASS release:web: files=${files.length} output=web-release/ zip=web-release.zip`);
