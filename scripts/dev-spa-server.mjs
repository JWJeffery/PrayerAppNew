import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const port = Number(process.env.PORT || 3000);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"]
]);

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  res.end(body);
}

function safeFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const relative = normalized.replace(/^[/\\]+/, "");
  return path.join(root, relative);
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = contentTypes.get(ext) || "application/octet-stream";
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, "Not found");
      return;
    }
    send(res, 200, data, type);
  });
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || "/", "http://localhost");
  const pathname = requestUrl.pathname;

  let filePath = pathname === "/" ? path.join(root, "index.html") : safeFilePath(pathname);

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      serveFile(res, filePath);
      return;
    }

    // If the request looks like a real file, return 404 so missing assets/data are visible.
    if (path.extname(pathname)) {
      send(res, 404, "Not found");
      return;
    }

    // Otherwise it is an app route such as /tools/bible.
    serveFile(res, path.join(root, "index.html"));
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Universal Office SPA dev server running on http://0.0.0.0:${port}`);
  console.log("No-cache headers enabled. App routes fall back to index.html.");
});
