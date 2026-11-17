/* ==========================================================================
   Funções puras de WhatsApp / formulário / links.
   Sem armazenamento, sem envio a servidores, sem logs de dados pessoais.
   Usado no navegador (window.SLF) e nos testes (node: require).
   ========================================================================== */
(function (root) {
  "use strict";

  // Remove caracteres de controle (mantém \n apenas quando permitido), espaços extras e limita tamanho.
  function clean(value, max, allowNewlines) {
    var s = String(value == null ? "" : value).normalize("NFC");
    s = allowNewlines
      ? s.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "").replace(/\n{3,}/g, "\n\n")
      : s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ");
    s = s.trim();
    if (max && s.length > max) s = s.slice(0, max).trim();
    return s;
  }

  function digitsOnly(n) {
    return String(n || "").replace(/\D/g, "");
  }

  function waUrl(number, message) {
    var base = "https://wa.me/" + digitsOnly(number);
    return message ? base + "?text=" + encodeURIComponent(message) : base;
  }

  function mapsUrl(cfg) {
    return cfg.links.mapsBase + encodeURIComponent(cfg.address.mapsQuery);
  }

  function normalizeForm(raw, limits) {
    var l = limits || {};
    return {
      name: clean(raw.name, l.name || 80, false),
      service: clean(raw.service, l.service || 120, false),
      day: clean(raw.day, l.day || 40, false),
      period: clean(raw.period, 40, false),
      notes: clean(raw.notes, l.notes || 500, true),
    };
  }

  // Retorna { ok, errors: { campo: mensagem } }
  function validateForm(data, limits) {
    var l = limits || {};
    var errors = {};
    if (!data.name) errors.name = "Informe seu nome.";
    else if (data.name.length < 2) errors.name = "O nome precisa ter pelo menos 2 caracteres.";
    else if (data.name.length > (l.name || 80)) errors.name = "Nome muito longo.";
    if (!data.service) errors.service = "Conte qual serviço você procura.";
    else if (data.service.length > (l.service || 120)) errors.service = "Texto muito longo.";
    if (data.notes && data.notes.length > (l.notes || 500)) errors.notes = "Observações muito longas.";
    return { ok: Object.keys(errors).length === 0, errors: errors };
  }

  function buildFormMessage(cfg, data) {
    var lines = [cfg.whatsapp.formHeader];
    lines.push("Nome: " + data.name);
    lines.push("Serviço de interesse: " + data.service);
    if (data.day) lines.push("Dia preferido: " + data.day);
    if (data.period) lines.push("Período preferido: " + data.period);
    if (data.notes) lines.push("Observações: " + data.notes);
    return lines.join("\n");
  }

  var api = {
    clean: clean,
    digitsOnly: digitsOnly,
    waUrl: waUrl,
    mapsUrl: mapsUrl,
    normalizeForm: normalizeForm,
    validateForm: validateForm,
    buildFormMessage: buildFormMessage,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SLF = api;
})(typeof window !== "undefined" ? window : globalThis);
