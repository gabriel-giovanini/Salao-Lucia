// Regenera css/tailwind.css (Tailwind 3.4.16) a partir das classes usadas no projeto: `npm run tailwind`
// Como funciona: sobe o servidor local, abre uma página em branco no Microsoft Edge (headless) com o
// compilador oficial do Tailwind (CDN), aplica todas as classes encontradas no HTML/JS e salva o CSS gerado.
// Por que: o CDN compilando no navegador a cada mudança do DOM travava o site; o CSS estático não trava.
// Requisitos: Node 20+ e Microsoft Edge instalado (padrão no Windows).
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const FILES = ["index.html", "privacidade.html", "404.html", "js/main.js", "js/hero.js", "js/config.js"];
const EDGE = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
if (!EDGE) { console.error("Microsoft Edge não encontrado."); process.exit(1); }

// 1) classes candidatas (mesma ideia do extrator do Tailwind: todo token plausível)
const tokens = new Set();
for (const f of FILES) {
  for (const t of readFileSync(join(ROOT, f), "utf8").split(/[\s"'`<>{}]+/)) {
    if (t && t.length < 90 && /^[!a-z0-9:\-\[\]\(\)\.,%\/#_&>+*=~@]+$/i.test(t)) tokens.add(t);
  }
}

// 2) página mínima com o compilador do Tailwind
const page = `<!doctype html><html><head><script src="https://cdn.tailwindcss.com/3.4.16"></script></head><body></body></html>`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9344;
const prof = mkdtempSync(join(tmpdir(), "slf-tw-"));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
let target;
for (let i = 0; i < 50 && !target; i++) {
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch {}
  if (!target) await sleep(200);
}
if (!target) { edge.kill(); console.error("Não foi possível abrir o Edge headless."); process.exit(1); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (ev) => { const m = JSON.parse(ev.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
await send("Page.enable");
await send("Page.navigate", { url: "data:text/html;charset=utf-8," + encodeURIComponent(page) });
await sleep(3000);
const expr = `(async () => {
  const d = document.createElement("div");
  d.setAttribute("class", ${JSON.stringify([...tokens].join(" "))});
  document.body.appendChild(d);
  await new Promise((r) => setTimeout(r, 4000));
  return [...document.querySelectorAll("style")].map((s) => s.textContent).filter((t) => t.includes("--tw-")).join("\\n");
})()`;
const res = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
ws.close(); edge.kill();
const css = res.result?.result?.value;
if (!css || css.length < 2000) { console.error("CSS vazio — verifique a conexão (o compilador vem do CDN)."); process.exit(1); }
writeFileSync(join(ROOT, "css/tailwind.css"), "/* Tailwind CSS 3.4.16 — gerado por scripts/gen-tailwind.mjs (npm run tailwind). Não editar à mão. */\n" + css);
console.log(`css/tailwind.css atualizado: ${Math.round(css.length / 1024)} KB, ${tokens.size} tokens analisados.`);
