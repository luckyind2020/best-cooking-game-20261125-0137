// Ember Ladle — serve: a tiny static file server for local play-testing.
// Serves game/ at http://localhost:8080 so the game can be played in a
// desktop browser exactly as the static host will serve it. Development only.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const gameDir = join(repoRoot, "game");
const port = Number(process.env.PORT || 8080);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const server = createServer((req, res) => {
  const path = normalize(join(gameDir, decodeURIComponent(req.url || "/").split("?")[0]));
  if (!path.startsWith(gameDir)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
  const file = existsSync(path) && statSync(path).isDirectory() ? join(path, "index.html") : path;
  if (!existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log("Ember Ladle at http://localhost:" + port + "/");
});
