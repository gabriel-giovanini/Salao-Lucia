// Testes das funções de mensagem do WhatsApp: `npm test`
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const S = require("../js/whatsapp.js");

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../js/config.js"), "utf8"), sandbox);
const C = sandbox.window.SITE_CONFIG;
const L = C.form.limits;

test("link padrão usa o número correto e a mensagem codificada", () => {
  const url = S.waUrl(C.contact.whatsappNumber, C.whatsapp.defaultMessage);
  assert.ok(url.startsWith("https://wa.me/5519971602364?text="));
  assert.equal(decodeURIComponent(url.split("?text=")[1]), C.whatsapp.defaultMessage);
  assert.match(C.whatsapp.defaultMessage, /^Olá, Studio Lucia Ferraz! Vim pelo site/);
});

test("mensagem do formulário completa, com acentos e quebras de linha", () => {
  const data = S.normalizeForm({ name: "  Ana   Lúcia ", service: "Corte & escova", day: "sábado, 22/11/2026", period: "Manhã", notes: "Primeira vez\naqui" }, L);
  const msg = S.buildFormMessage(C, data);
  assert.equal(msg, [
    "Olá, Studio Lucia Ferraz! Gostaria de consultar um agendamento.",
    "Nome: Ana Lúcia",
    "Serviço de interesse: Corte & escova",
    "Dia preferido: sábado, 22/11/2026",
    "Período preferido: Manhã",
    "Observações: Primeira vez\naqui",
  ].join("\n"));
  const url = S.waUrl(C.contact.whatsappNumber, msg);
  assert.ok(url.includes("%0A"), "quebra de linha codificada");
  assert.ok(url.includes("%26"), "& codificado");
  assert.equal(decodeURIComponent(url.split("?text=")[1]), msg);
});

test("campos opcionais vazios não aparecem", () => {
  const msg = S.buildFormMessage(C, S.normalizeForm({ name: "Bia", service: "Unhas" }, L));
  assert.equal(msg.split("\n").length, 3);
  assert.ok(!/Dia preferido|Período|Observações/.test(msg));
});

test("validação de obrigatórios e limites", () => {
  assert.equal(S.validateForm(S.normalizeForm({ name: "", service: "" }, L), L).ok, false);
  const r = S.validateForm(S.normalizeForm({ name: "A", service: "x" }, L), L);
  assert.ok(r.errors.name);
  assert.ok(S.validateForm(S.normalizeForm({ name: "Ana", service: "x" }, L), L).ok);
  const long = S.normalizeForm({ name: "a".repeat(500), service: "b".repeat(500), notes: "c".repeat(5000) }, L);
  assert.equal(long.name.length, L.name);
  assert.equal(long.service.length, L.service);
  assert.equal(long.notes.length, L.notes);
});

test("remove caracteres de controle", () => {
  const d = S.normalizeForm({ name: "Ana\u0000\u0007 Maria", service: "x\ny", notes: "a\r\nb\u0000" }, L);
  assert.equal(d.name, "Ana Maria");
  assert.equal(d.service, "x y");
  assert.equal(d.notes, "a\nb");
});

test("link do Google Maps com nome e endereço codificados", () => {
  const url = S.mapsUrl(C);
  assert.equal(url, "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Studio Lucia Ferraz, Av. Jacaúna, 2634, Vila Aeroporto, Campinas, SP, 13054-107"));
});
