// Packs ONLY the parish-intentions backend (api/ and parish/) into parish-backend.zip, so it can be
// uploaded to the web root without touching the rest of the live site. It builds the normal web
// release first (which applies the deny-list and the "no secrets in the release" assertion) and
// zips just those two folders out of it -- dotfiles like api/.htaccess included.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

execFileSync("node", ["scripts/prepare-web-release.mjs"], { stdio: "inherit" });

for (const required of ["web-release/api/.htaccess", "web-release/api/index.php", "web-release/parish/approve.html"]) {
  if (!fs.existsSync(required)) {
    console.error(`FAIL release:parish-backend: missing ${required}`);
    process.exit(1);
  }
}

execFileSync("python3", ["-c", `
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path("web-release")
out = Path("parish-backend.zip")
count = 0
with ZipFile(out, "w", ZIP_DEFLATED) as z:
    for top in ("api", "parish"):
        for p in sorted((root / top).rglob("*")):
            if p.is_file():
                z.write(p, p.relative_to(root))
                count += 1
print(f"wrote {out} with {count} files ({out.stat().st_size / 1024:.0f} KB)")
`], { stdio: "inherit" });
console.log("PASS release:parish-backend: upload parish-backend.zip into the theuniversaloffice.com folder and extract it there.");
