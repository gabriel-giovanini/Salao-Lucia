// Servidor estático local, sem dependências: `npm run dev` → http://localhost:5173
// Simula cleanUrls da Vercel (/privacidade → privacidade.html) e a página 404.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.env.PORT) || 5173;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".mp4": "video/mp4",
  ".webm": "video/webm", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".ico": "image/x-icon",
};

async function tryFile(p) {
  try { const s = await stat(p); return s.isFile() ? p : null; } catch { return null; }
}

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const safe = normalize(join(ROOT, path));
  if (!safe.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  const file = (await tryFile(path.endsWith("/") ? join(safe, "index.html") : safe)) || (await tryFile(safe + ".html"));
  if (!file) {
    const nf = await readFile(join(ROOT, "404.html"));
    res.writeHead(404, { "Content-Type": TYPES[".html"] }).end(nf);
    return;
  }
  res.writeHead(200, { "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
  res.end(await readFile(file));
}).listen(PORT, () => console.log(`Studio Lucia Ferraz → http://localhost:${PORT}`));
