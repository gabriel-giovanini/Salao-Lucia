// Verificações do projeto, sem dependências: `npm run check`
// - sintaxe dos arquivos JS
// - integridade de js/config.js (dados obrigatórios, mídias e produtos existentes)
// - links/arquivos locais referenciados nas páginas e âncoras internas
// - textos proibidos (falsas confirmações) e JSON-LD sem notas/avaliações
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const warnings = [];
const ok = (m) => console.log("  OK  " + m);
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const assetExists = (p) => existsSync(join(ROOT, p));

// 1. Sintaxe JS
console.log("\n1) Sintaxe JavaScript");
for (const f of ["js/config.js", "js/whatsapp.js", "js/main.js", "js/hero.js", "scripts/serve.mjs", "scripts/build.mjs"]) {
  const r = spawnSync(process.execPath, ["--check", join(ROOT, f)], { encoding: "utf8" });
  r.status === 0 ? ok(f) : err(`Erro de sintaxe em ${f}:\n${r.stderr}`);
}

// 2. Config
console.log("\n2) Configuração (js/config.js)");
const sandbox = { window: {} };
vm.runInNewContext(read("js/config.js"), sandbox);
const C = sandbox.window.SITE_CONFIG;
if (!C) err("SITE_CONFIG não definido");
else {
  if (!/^55\d{10,11}$/.test(C.contact.whatsappNumber)) err("whatsappNumber inválido");
  else ok(`WhatsApp ${C.contact.whatsappNumber}`);
  if (C.contact.phoneHref !== "tel:+" + C.contact.whatsappNumber) warn("phoneHref difere do número do WhatsApp (verifique se é intencional)");
  else ok(`Telefone ${C.contact.phoneHref}`);
  if (!C.hours.confirmed) ok(`Horários não confirmados -> "${C.hours.fallbackText}"`);

  const arts = C.media.art;
  for (const [k, v] of Object.entries(arts)) assetExists(v.src) ? ok(`arte "${k}"`) : err(`Mídia ausente: ${v.src}`);
  if (C.media.logo && !assetExists(C.media.logo)) err(`Logo ausente: ${C.media.logo}`);
  if (C.media.momentsLogo && !assetExists(C.media.momentsLogo)) err(`Logo Moments ausente: ${C.media.momentsLogo}`);
  if (!assetExists(C.media.ogImage.src)) err(`Imagem OG ausente: ${C.media.ogImage.src}`);
  if (C.media.video.src && !assetExists(C.media.video.src)) warn(`Vídeo ainda não enviado (${C.media.video.src}) - fundo animado em uso`);
  if (C.media.video.poster && !assetExists(C.media.video.poster)) err(`Poster do vídeo ausente: ${C.media.video.poster}`);
  for (const s of C.media.salao) if (!assetExists(s.src)) err(`Foto do salão ausente: ${s.src}`);

  const prods = (C.products || []).filter((p) => p.published);
  for (const p of prods) {
    if (!p.name || !p.image) err(`Produto incompleto: ${p.id}`);
    else if (!assetExists(p.image)) err(`Produto "${p.name}": imagem não encontrada (${p.image})`);
    if (!C.productCategories.some((c) => c.id === p.category)) err(`Produto "${p.name}" com categoria inexistente`);
    if (!Array.isArray(p.colors) || p.colors.length < 3) err(`Produto "${p.name}": defina 3 cores`);
  }
  prods.length ? ok(`${prods.length} produto(s) publicado(s)`) : warn("Nenhum produto publicado (topo ficará vazio)");

  const pub = C.services.items.filter((s) => s.published);
  for (const s of pub) {
    if (!s.name || /EXEMPLO/i.test(s.name)) err(`Serviço publicado com nome inválido: ${s.name}`);
    if (!C.services.categories.some((c) => c.id === s.category)) err(`Serviço "${s.name}" com categoria inexistente`);
    if (s.image && !arts[s.image] && !assetExists(s.image)) err(`Serviço "${s.name}": imagem não encontrada`);
  }
  pub.length ? ok(`${pub.length} serviço(s) publicado(s)`) : warn("Nenhum serviço publicado (site exibe chamada geral pelo WhatsApp)");
  for (const r of C.reviews.items) {
    if (!r.name || !r.text || !r.source || !r.verifiedAt) err(`Avaliação incompleta: ${JSON.stringify(r).slice(0, 80)}`);
  }
  ok(`${C.reviews.items.length} avaliação(ões) real(is); resumo ${C.reviews.summary.rating}/${C.reviews.summary.count}`);
  if (C.links.momentsParis.show) warn("Link office.momentsparis ativado - confirme a finalidade antes de publicar");
}

// 3. Páginas: arquivos locais e âncoras
console.log("\n3) Páginas, arquivos e âncoras");
const pages = readdirSync(ROOT).filter((f) => f.endsWith(".html"));
for (const page of pages) {
  const html = read(page);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const refs = [...html.matchAll(/\s(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  let count = 0;
  for (const ref of refs) {
    if (/^(https?:|tel:|mailto:|data:)/.test(ref)) continue;
    if (ref.startsWith("#")) {
      if (ref.length > 1 && !ids.has(ref.slice(1))) err(`${page}: âncora ${ref} sem destino`);
      continue;
    }
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (clean === "./" || clean === "/") continue;
    const p = clean.startsWith("/") ? join(ROOT, clean) : join(ROOT, dirname(page), clean);
    if (!existsSync(p)) err(`${page}: arquivo não encontrado -> ${ref}`);
    count++;
  }
  ok(`${page}: ${count} referência(s) local(is)`);

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      if (JSON.stringify(data).match(/aggregateRating|"review"/)) err(`${page}: JSON-LD contém nota/avaliação`);
      else ok(`${page}: JSON-LD ${data["@type"]} válido`);
    } catch (e) { err(`${page}: JSON-LD inválido (${e.message})`); }
  }
}

// 4. Textos proibidos
console.log("\n4) Textos proibidos");
const banned = [/agendamento confirmado/i, /mensagem enviada/i, /pedido enviado/i, /sacola/i, /checkout/i];
for (const f of [...pages, "js/main.js", "js/config.js"]) {
  const t = read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  for (const b of banned) if (b.test(t)) err(`${f}: contém texto proibido ${b}`);
}
ok("Sem falsas confirmações de envio/agendamento");

// 5. Testes unitários
console.log("\n5) Testes");
const t = spawnSync(process.execPath, ["--test", join(ROOT, "tests", "whatsapp.test.cjs")], { encoding: "utf8" });
t.status === 0 ? ok("node --test aprovado") : err("Testes falharam:\n" + t.stdout + t.stderr);

if (warnings.length) console.log("\nAvisos:\n" + warnings.map((w) => "  !  " + w).join("\n"));
if (errors.length) {
  console.error("\nErros:\n" + errors.map((e) => "  X  " + e).join("\n"));
  process.exit(1);
}
console.log("\nTudo certo.\n");
