// Gera a pasta de publicação `dist/` (usada pela Vercel): `npm run build`
// Copia apenas os arquivos do site — documentação, scripts e testes ficam de fora.
import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT = join(ROOT, "dist");
const INCLUDE = ["index.html", "privacidade.html", "404.html", "favicon.svg", "robots.txt", "sitemap.xml", "css", "js", "Assets"];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const item of INCLUDE) {
  const src = join(ROOT, item);
  if (!existsSync(src)) continue;
  cpSync(src, join(OUT, item), { recursive: true });
  console.log("  + " + item);
}
console.log("Build pronto em dist/");
