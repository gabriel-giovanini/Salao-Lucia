/* ==========================================================================
   Studio Lucia Ferraz — interações e renderização a partir de js/config.js
   - Animações principais com APIs nativas (Web Animations + IntersectionObserver),
     funcionando mesmo sem CDN e mesmo com "reduzir movimento" ativo no sistema
     (pedido do cliente). GSAP/ScrollTrigger/Lenis adicionam efeitos de scroll extras.
   - Nenhum dado do formulário é armazenado, registrado em log ou enviado a servidores.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.SITE_CONFIG;
  var S = window.SLF;
  if (!C || !S) return;
  document.documentElement.classList.add("js-ready");

  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var gsap = window.gsap;
  var hasST = !!(gsap && window.ScrollTrigger);
  var lenis = null;
  var EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
  var SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  var summary = C.reviews.summary;
  function fmtRating(n) { return Number(n).toFixed(1).replace(".", ","); }
  function fmtDate(iso) { var p = String(iso || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso; }
  function tokens(str) { return String(str).replace(/\{rating\}/g, fmtRating(summary.rating)).replace(/\{count\}/g, String(summary.count)); }
  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function icons() { if (window.lucide) window.lucide.createIcons(); }
  function media(keyOrPath) {
    if (!keyOrPath) return null;
    var art = C.media.art[keyOrPath];
    return encodeURI(art ? art.src : keyOrPath);
  }
  function anim(el, frames, opts) {
    if (!el || !el.animate) return { finished: Promise.resolve() };
    return el.animate(frames, Object.assign({ duration: 900, easing: EASE, fill: "backwards" }, opts));
  }

  /* ---------------- Imagens sem ícone quebrado ---------------- */
  function guardImg(img) {
    if (img.__guarded) return;
    img.__guarded = true;
    var swap = function () {
      var div = document.createElement("div");
      div.className = "img-fallback " + (img.className || "");
      div.setAttribute("aria-hidden", "true");
      img.replaceWith(div);
    };
    img.addEventListener("error", swap, { once: true });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) swap();
  }
  function guardAll(root) { $$("img", root).forEach(guardImg); }

  /* ---------------- Dados globais ---------------- */
  var waDefault = S.waUrl(C.contact.whatsappNumber, C.whatsapp.defaultMessage);
  var waMoments = S.waUrl(C.contact.whatsappNumber, C.whatsapp.momentsMessage);
  var mapsLink = S.mapsUrl(C);
  function productWa(p) { return S.waUrl(C.contact.whatsappNumber, C.whatsapp.productMessage.replace(/\[produto\]/gi, p.name)); }

  function fillGlobals() {
    $$("[data-tel]").forEach(function (a) { a.href = C.contact.phoneHref; });
    $$("[data-phone-display]").forEach(function (el) { el.textContent = C.contact.phoneDisplay; });
    $$("[data-wa-default]").forEach(function (a) { a.href = waDefault; });
    $$("[data-moments-wa]").forEach(function (a) { a.href = waMoments; });
    $$("[data-maps-link], [data-reviews-link]").forEach(function (a) { a.href = mapsLink; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    $$("[data-moments-logo]").forEach(function (img) { if (C.media.momentsLogo) img.src = encodeURI(C.media.momentsLogo); });

    var A = C.address;
    $$("[data-address]").forEach(function (el) {
      el.innerHTML = esc(A.street) + " — " + esc(A.neighborhood) + "<br />" + esc(A.city) + " — " + esc(A.state) + ", " + esc(A.postalCode);
    });
    var hoursHtml = C.hours.confirmed && C.hours.schedule.length
      ? '<ul class="grid gap-1">' + C.hours.schedule.map(function (h) {
          return '<li class="flex justify-between gap-4"><span>' + esc(h.days) + '</span><span class="text-white/60">' + esc(h.time) + "</span></li>";
        }).join("") + "</ul>"
      : "<p>" + esc(C.hours.fallbackText) + "</p>";
    $$("[data-hours-list]").forEach(function (el) { el.innerHTML = hoursHtml; });

    $$("[data-rating-block]").forEach(function (el) { if (!summary.show) el.hidden = true; });
    $$("[data-rating-value]").forEach(function (el) { el.textContent = fmtRating(summary.rating); });
    $$("[data-rating-count]").forEach(function (el) { el.textContent = summary.count; });
    $$("[data-rating-source]").forEach(function (el) { el.textContent = summary.source; });
    $$("[data-rating-date]").forEach(function (el) { el.textContent = fmtDate(summary.verifiedAt); });
    $$("[data-counter]").forEach(function (el) {
      var isRating = el.getAttribute("data-decimals") === "1";
      el.setAttribute("data-to", isRating ? summary.rating : summary.count);
      el.textContent = isRating ? fmtRating(summary.rating) : summary.count;
    });

    var social = $("[data-social]");
    if (social) {
      social.innerHTML = C.links.social.map(function (s) {
        return '<li><a class="btn btn-ghost !min-h-[40px] !px-4 !py-2 text-sm" href="' + esc(s.url) + '" target="_blank" rel="noopener"><i data-lucide="' + esc(s.icon || "link") + '" class="h-4 w-4" aria-hidden="true"></i>' + esc(s.label) + "</a></li>";
      }).join("");
      if (!C.links.social.length) social.hidden = true;
    }
  }

  /* ---------------- Split de títulos ---------------- */
  function splitEl(el) {
    var i = 0;
    var frag = document.createDocumentFragment();
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var w = document.createElement("span");
          w.className = "split-word";
          part.split("").forEach(function (ch) {
            var c = document.createElement("span");
            c.className = "split-char";
            c.style.setProperty("--i", i++);
            c.textContent = ch;
            w.appendChild(c);
          });
          frag.appendChild(w);
        });
      } else if (node.nodeType === 1) {
        node.classList.add("split-em");
        node.style.setProperty("--i", i);
        i += 6;
        frag.appendChild(node);
      }
    });
    el.textContent = "";
    el.appendChild(frag);
    el.setAttribute("aria-label", el.textContent);
    el.classList.add("rv-split");
  }

  /* ---------------- Revelação ao rolar ---------------- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      // anima ao entrar E ao sair da tela; nada fica rodando entre esses momentos
      var el = en.target;
      el.classList.toggle("in", en.isIntersecting);
      if (en.isIntersecting && !el.__seen) {
        el.__seen = true;
        // depois da primeira entrada, remove o atraso para hover/saída responderem na hora
        setTimeout(function () { el.style.setProperty("--d", "0s"); }, 1800);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  function observeReveals(root) {
    $$(".rv, .rv-split", root).forEach(function (el) { if (!el.classList.contains("in")) revealIO.observe(el); });
  }

  /* ---------------- Contadores ---------------- */
  function initCounters() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        var to = parseFloat(el.getAttribute("data-to")) || 0;
        var dec = parseInt(el.getAttribute("data-decimals"), 10) || 0;
        var start = performance.now();
        var dur = 2200;
        (function tick(now) {
          var t = Math.min(1, (now - start) / dur);
          var e = 1 - Math.pow(1 - t, 4);
          el.textContent = (to * e).toFixed(dec).replace(".", ",");
          if (t < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.5 });
    $$("[data-counter]").forEach(function (el) {
      var dec = parseInt(el.getAttribute("data-decimals"), 10) || 0;
      el.textContent = (0).toFixed(dec).replace(".", ",");
      io.observe(el);
    });
  }

  /* ---------------- Toast ---------------- */
  var toastTimer;
  function toast(msg) {
    var t = $("[data-toast]");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-visible"); }, 3200);
  }

  /* ---------------- Período (formulário) ---------------- */
  var selectedPeriod = "";
  function setPeriod(p, source) {
    selectedPeriod = p;
    $$("[data-period-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-period-btn") === p)); });
    if (source) anim(source, [{ transform: "scale(.8)" }, { transform: "scale(1.06)" }], { duration: 700, easing: SPRING, fill: "none" });
  }
  function periodButtons() {
    return C.whatsapp.periods.map(function (p) {
      return '<button type="button" class="opt-circle" data-period-btn="' + esc(p) + '" aria-pressed="false">' + esc(p) + "</button>";
    }).join("");
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-period-btn]");
    if (!b) return;
    var p = b.getAttribute("data-period-btn");
    setPeriod(selectedPeriod === p ? "" : p, b);
  });

  /* ---------------- Hero: vitrine de produtos (coreografia orbital 3D do vídeo) ---------------- */
  var products = (C.products || []).filter(function (p) { return p.published; });

  // Permite transição suave das cores do hero só com CSS
  try {
    ["--p-glow", "--p-bg", "--p-acc"].forEach(function (n) {
      CSS.registerProperty({ name: n, syntax: "<color>", inherits: true, initialValue: "#000000" });
    });
    $("[data-hero]").style.transition = "--p-glow 1.2s " + EASE + ", --p-bg 1.2s " + EASE + ", --p-acc 1.2s " + EASE;
  } catch (e) { /* navegador sem suporte: troca direta */ }

  var heroApi = null;
  function initHero() {
    var hero = $("[data-hero]");
    if (!hero || !products.length) return;
    var idx = 0;
    var busy = false;
    var titleEl = $("[data-hero-title]");
    var kickerEl = $("[data-hero-kicker]");
    var descEl = $("[data-hero-desc]");
    var taglineEl = $("[data-hero-tagline]");
    var priceEl = $("[data-hero-price]");
    var oldPriceEl = $("[data-hero-old-price]");
    var buyEl = $("[data-hero-buy]");
    var wm = $("[data-watermark]");
    var picks = $("[data-hero-picks]");
    var stage = $("[data-stage]");
    var shadowEl = $("[data-stage-shadow]");
    var orbitCur = $("[data-orbit-cur]");
    var orbitPrev = $("[data-orbit-prev]");
    var orbitNext = $("[data-orbit-next]");
    var two = function (n) { return String(n).padStart(2, "0"); };
    $$("[data-hero-total]").forEach(function (el) { el.textContent = two(products.length); });

    picks.innerHTML = products.map(function (p, i) {
      return '<button type="button" class="prod-pick" aria-pressed="' + (i === 0) + '" aria-label="' + esc(p.name) + '" title="' + esc(p.name) + '"><img src="' + media(p.image) + '" alt="" /></button>';
    }).join("");
    guardAll(picks);
    $$(".prod-pick", picks).forEach(function (b, i) { b.addEventListener("click", function () { go(i); }); });

    function applyColors(p) {
      hero.style.setProperty("--p-glow", p.colors[0]);
      hero.style.setProperty("--p-bg", p.colors[1]);
      hero.style.setProperty("--p-acc", p.colors[2]);
    }

    function syncOrbitImages(i) {
      var n = products.length;
      var curP = products[i];
      var prevP = products[(i - 1 + n) % n];
      var nextP = products[(i + 1) % n];
      var curImg = $("img", orbitCur);
      var prevImg = $("img", orbitPrev);
      var nextImg = $("img", orbitNext);
      if (curImg) { curImg.src = media(curP.image); curImg.alt = curP.name; }
      if (prevImg) { prevImg.src = media(prevP.image); prevImg.alt = ""; }
      if (nextImg) { nextImg.src = media(nextP.image); nextImg.alt = ""; }
      if (orbitPrev) orbitPrev.setAttribute("aria-label", "Ver produto anterior: " + prevP.name);
      if (orbitNext) orbitNext.setAttribute("aria-label", "Ver próximo produto: " + nextP.name);
      guardAll(hero);
    }

    function setContent(p, i) {
      var brandTxt = p.brand || "Moments Paris";
      kickerEl.textContent = p.type ? brandTxt + " · " + p.type : brandTxt;
      titleEl.textContent = p.name;
      splitEl(titleEl);
      titleEl.classList.add("in");
      if (descEl) descEl.textContent = p.description || "";
      if (taglineEl) taglineEl.textContent = p.tagline || "Beleza e cuidado em cada detalhe";
      priceEl.textContent = p.price || "Sob consulta";
      if (oldPriceEl) {
        oldPriceEl.textContent = p.oldPrice || "";
        oldPriceEl.hidden = !p.oldPrice;
      }
      buyEl.href = productWa(p);
      $$(".prod-pick", picks).forEach(function (b, j) { b.setAttribute("aria-pressed", String(j === i)); });
      $$("[data-hero-cur]").forEach(function (el) { el.textContent = two(i + 1); });
    }

    function charsIn(delay) {
      $$(".split-char", titleEl).forEach(function (c, k) {
        anim(c, [{ transform: "translateY(100%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 750, delay: (delay || 0) + k * 20 });
      });
    }

    // Posições orbitais responsivas (idênticas ao CSS para interpolar com fluidez no Web Animations API)
    function orbitCoords() {
      var mob = window.innerWidth < 1024;
      return {
        cur:  { t: "translate3d(0vw, 0vh, 0) scale(1) rotate(0deg)", o: 1, f: "blur(0px) brightness(1)" },
        prev: mob
          ? { t: "translate3d(-34vw, -20vh, 0) scale(0.36) rotate(-8deg)", o: 0.4, f: "blur(1.2px) brightness(0.88)" }
          : { t: "translate3d(-22vw, -44vh, 0) scale(0.45) rotate(-8deg)", o: 0.55, f: "blur(1.2px) brightness(0.88)" },
        next: mob
          ? { t: "translate3d(36vw, -16vh, 0) scale(0.34) rotate(6deg)", o: 0.95, f: "blur(0px) brightness(1)" }
          : { t: "translate3d(40vw, 35vh, 0) scale(0.26) rotate(4deg)", o: 0.96, f: "blur(0px) brightness(1)" },
        outTop: { t: "translate3d(-30vw, -75vh, 0) scale(0.22) rotate(-18deg)", o: 0, f: "blur(4px) brightness(0.7)" },
        outBot: { t: "translate3d(55vw, 58vh, 0) scale(0.14) rotate(14deg)", o: 0, f: "blur(3px) brightness(0.8)" },
      };
    }

    // Troca de produto com voo 3D igual ao vídeo (Atual -> Topo Esquerdo | Próximo -> Centro | Novo -> Canto Inferior Direito)
    function go(next, dir) {
      var n = products.length;
      next = ((next % n) + n) % n;
      if (busy || next === idx) return;
      if (!dir) {
        var diff = (next - idx + n) % n;
        dir = diff <= n / 2 ? 1 : -1;
      }
      busy = true;
      var p = products[next];
      var pos = orbitCoords();
      var dur = 920;
      var flyEase = "cubic-bezier(0.22, 1, 0.36, 1)";

      applyColors(p);

      // Se o usuário pulou diretamente para um item que não era o adjacente, pré-atualiza a imagem do slot que vai voar para o centro
      if (dir > 0 && next !== (idx + 1) % n && orbitNext) {
        var ni = $("img", orbitNext);
        if (ni) ni.src = media(p.image);
      } else if (dir < 0 && next !== (idx - 1 + n) % n && orbitPrev) {
        var pi = $("img", orbitPrev);
        if (pi) pi.src = media(p.image);
      }

      if (shadowEl) {
        anim(shadowEl, [
          { transform: "scaleX(1)", opacity: 0.9 },
          { transform: "scaleX(0.45)", opacity: 0.25 },
          { transform: "scaleX(1)", opacity: 0.9 },
        ], { duration: dur, easing: flyEase });
      }

      var a1, a2, a3;
      if (dir > 0) {
        // Avançando (como no vídeo): Centro voa p/ Topo-Esquerdo; Canto-Inferior-Direito voa p/ Centro; Topo-Esquerdo sai por cima e entra novo no Canto
        a1 = anim(orbitCur, [
          { transform: orbitCur.style.transform || pos.cur.t, opacity: pos.cur.o, filter: pos.cur.f },
          { transform: pos.prev.t, opacity: pos.prev.o, filter: pos.prev.f },
        ], { duration: dur, easing: flyEase, fill: "forwards" });

        a2 = anim(orbitNext, [
          { transform: orbitNext.style.transform || pos.next.t, opacity: pos.next.o },
          { transform: pos.cur.t, opacity: pos.cur.o },
        ], { duration: dur, easing: flyEase, fill: "forwards" });

        a3 = anim(orbitPrev, [
          { transform: orbitPrev.style.transform || pos.prev.t, opacity: pos.prev.o },
          { transform: pos.outTop.t, opacity: 0 },
        ], { duration: 380, easing: "ease-in", fill: "forwards" });

        setTimeout(function () {
          var newNextP = products[(next + 1) % n];
          var prevImg = $("img", orbitPrev);
          if (prevImg) prevImg.src = media(newNextP.image);
          a3.cancel();
          a3 = anim(orbitPrev, [
            { transform: pos.outBot.t, opacity: 0, filter: "blur(0px) brightness(1)" },
            { transform: pos.next.t, opacity: pos.next.o, filter: "blur(0px) brightness(1)" },
          ], { duration: 540, easing: EASE, fill: "forwards" });
        }, 380);
      } else {
        // Voltando: Topo-Esquerdo desce p/ Centro; Centro desce p/ Canto-Inferior-Direito; Canto sai e novo entra no Topo-Esquerdo
        a1 = anim(orbitCur, [
          { transform: orbitCur.style.transform || pos.cur.t, opacity: pos.cur.o },
          { transform: pos.next.t, opacity: pos.next.o },
        ], { duration: dur, easing: flyEase, fill: "forwards" });

        a2 = anim(orbitPrev, [
          { transform: orbitPrev.style.transform || pos.prev.t, opacity: pos.prev.o, filter: pos.prev.f },
          { transform: pos.cur.t, opacity: pos.cur.o, filter: pos.cur.f },
        ], { duration: dur, easing: flyEase, fill: "forwards" });

        a3 = anim(orbitNext, [
          { transform: orbitNext.style.transform || pos.next.t, opacity: pos.next.o },
          { transform: pos.outBot.t, opacity: 0 },
        ], { duration: 380, easing: "ease-in", fill: "forwards" });

        setTimeout(function () {
          var newPrevP = products[(next - 1 + n) % n];
          var nextImg = $("img", orbitNext);
          if (nextImg) nextImg.src = media(newPrevP.image);
          a3.cancel();
          a3 = anim(orbitNext, [
            { transform: pos.outTop.t, opacity: 0, filter: pos.prev.f },
            { transform: pos.prev.t, opacity: pos.prev.o, filter: pos.prev.f },
          ], { duration: 540, easing: EASE, fill: "forwards" });
        }, 380);
      }

      orbitCur.style.transform = "";
      orbitPrev.style.transform = "";
      orbitNext.style.transform = "";
      if (shadowEl) shadowEl.style.transform = "";

      Promise.all([a1.finished, a2.finished]).then(function () {
        idx = next;
        syncOrbitImages(idx);
        [a1, a2, a3].forEach(function (a) { if (a && a.cancel) a.cancel(); });
        busy = false;
      });

      var wmOut = anim(wm, [{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: "ease-in", fill: "forwards" });
      wmOut.finished.then(function () {
        wm.textContent = p.watermark || "";
        anim(wm, [{ transform: "scale(1.12)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 850 });
        wmOut.cancel();
      });

      var parts = [kickerEl, titleEl, descEl, priceEl, oldPriceEl, taglineEl].filter(Boolean);
      var outAnims = parts.map(function (el, k) {
        return anim(el, [{ transform: "none", opacity: 1 }, { transform: "translateY(-12px)", opacity: 0 }], { duration: 260, delay: k * 20, easing: "ease-in", fill: "forwards" });
      });
      setTimeout(function () {
        setContent(p, next);
        outAnims.forEach(function (a) { if (a && a.cancel) a.cancel(); });
        charsIn(0);
        [kickerEl, descEl, priceEl, oldPriceEl, taglineEl].filter(Boolean).forEach(function (el, k) {
          anim(el, [{ transform: "translateY(18px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 750, delay: 60 + k * 70 });
        });
      }, 300);
    }

    function nextSlide() { go((idx + 1) % products.length, 1); }
    function prevSlide() { go((idx - 1 + products.length) % products.length, -1); }

    $$("[data-hero-next]").forEach(function (b) { b.addEventListener("click", nextSlide); });
    $$("[data-hero-prev]").forEach(function (b) { b.addEventListener("click", prevSlide); });
    if (orbitNext) orbitNext.addEventListener("click", nextSlide);
    if (orbitPrev) orbitPrev.addEventListener("click", prevSlide);
    hero.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    });

    // Arrastar (drag) em tempo real no PC e no Celular com retorno elástico ou troca de produto
    var drag = null;
    function applyDragVisual(dx, dy) {
      var p = Math.max(-1, Math.min(1, dx / 220));
      var rot = p * 12;
      var sc = 1 - Math.abs(p) * 0.1;
      orbitCur.style.transform = "translate3d(" + (dx * 0.55) + "px, " + (dy * 0.14) + "px, 0) scale(" + sc + ") rotate(" + rot + "deg)";
      if (shadowEl) {
        shadowEl.style.transform = "translateX(" + (dx * 0.32) + "px) scale(" + (1 - Math.abs(p) * 0.25) + ")";
      }
    }
    function finishDrag(dx, moved) {
      hero.classList.remove("is-dragging");
      if (!moved) return;
      if (Math.abs(dx) > 42) {
        dx < 0 ? nextSlide() : prevSlide();
      } else {
        var curT = orbitCur.style.transform;
        orbitCur.style.transform = "";
        if (shadowEl) shadowEl.style.transform = "";
        anim(orbitCur, [{ transform: curT }, { transform: orbitCoords().cur.t }], { duration: 500, easing: SPRING });
      }
    }
    function onDown(e) {
      if (busy) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.target.closest("a, button")) return;
      drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, moved: false };
      hero.classList.add("is-dragging");
    }
    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.sx;
      drag.dy = e.clientY - drag.sy;
      if (!drag.moved && Math.abs(drag.dx) > 6 && Math.abs(drag.dx) > Math.abs(drag.dy)) {
        drag.moved = true;
      }
      if (!drag.moved) return;
      applyDragVisual(drag.dx, drag.dy);
    }
    function onUp(e) {
      if (!drag || (e.pointerId !== undefined && e.pointerId !== drag.id)) return;
      var d = drag;
      drag = null;
      finishDrag(d.dx, d.moved);
    }
    hero.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    // Suporte dedicado a Touch Events para navegadores mobile (iOS Safari / Chrome Android)
    var tDrag = null;
    hero.addEventListener("touchstart", function (e) {
      if (busy || e.touches.length !== 1) return;
      if (e.target.closest("a, button")) return;
      var t = e.touches[0];
      tDrag = { sx: t.clientX, sy: t.clientY, dx: 0, dy: 0, lock: null };
    }, { passive: true });
    hero.addEventListener("touchmove", function (e) {
      if (!tDrag || e.touches.length !== 1) return;
      var t = e.touches[0];
      tDrag.dx = t.clientX - tDrag.sx;
      tDrag.dy = t.clientY - tDrag.sy;
      if (!tDrag.lock) {
        if (Math.abs(tDrag.dx) > 6 && Math.abs(tDrag.dx) > Math.abs(tDrag.dy)) {
          tDrag.lock = "x";
          hero.classList.add("is-dragging");
        } else if (Math.abs(tDrag.dy) > 8) {
          tDrag.lock = "y";
        }
      }
      if (tDrag.lock === "x") {
        if (e.cancelable) e.preventDefault();
        drag = null; // evita duplicação com pointer events
        applyDragVisual(tDrag.dx, tDrag.dy);
      }
    }, { passive: false });
    function onTouchEnd() {
      if (!tDrag) return;
      var td = tDrag;
      tDrag = null;
      if (td.lock === "x") finishDrag(td.dx, true);
    }
    hero.addEventListener("touchend", onTouchEnd, { passive: true });
    hero.addEventListener("touchcancel", onTouchEnd, { passive: true });

    var first = products[0];
    wm.textContent = first.watermark || "";
    applyColors(first);
    syncOrbitImages(0);
    setContent(first, 0);
    titleEl.classList.remove("in");
    guardAll(hero);

    heroApi = {
      intro: function () {
        var pos = orbitCoords();
        titleEl.classList.add("in");
        anim(orbitCur, [{ transform: "translate3d(0vw, 12vh, 0) scale(0.75)", opacity: 0 }, { transform: pos.cur.t, opacity: 1 }], { duration: 1350 });
        anim(orbitPrev, [{ transform: pos.outTop.t, opacity: 0 }, { transform: pos.prev.t, opacity: pos.prev.o }], { duration: 1400, delay: 180 });
        anim(orbitNext, [{ transform: pos.outBot.t, opacity: 0 }, { transform: pos.next.t, opacity: pos.next.o }], { duration: 1400, delay: 260 });
        anim(wm, [{ opacity: 0 }, { opacity: 1 }], { duration: 1500 });
        charsIn(180);
        [kickerEl, descEl, buyEl, priceEl, oldPriceEl, taglineEl].filter(Boolean).concat($$("[data-hero-left] .hero-arrow-btn, [data-hero-left] .counter-num")).forEach(function (el, k) {
          anim(el, [{ transform: "translateY(22px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 950, delay: 220 + k * 65 });
        });
        $$(".prod-pick", picks).forEach(function (el, k) {
          anim(el, [{ transform: "scale(.5)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 850, delay: 450 + k * 65, easing: SPRING });
        });
      },
    };
  }

  /* ---------------- Faixas: só se movem enquanto a página rola ---------------- */
  function initMarquees() {
    var boxes = $$("[data-marquee]").map(function (box) {
      var track = $("[data-marquee-track]", box);
      var kind = box.getAttribute("data-marquee");
      var list = kind === "2" ? C.marquee2 : kind === "giant" ? ["Studio Lucia Ferraz", "Consultora Moments Paris"] : C.marquee;
      var items = list.map(function (m, i) {
        var cls = kind === "giant" ? "" : i % 2 ? "text-outline" : "";
        return '<span class="marquee-item"><span class="' + cls + '">' + esc(tokens(m)) + '</span><span class="marquee-star" aria-hidden="true">✦</span></span>';
      }).join("");
      track.innerHTML = '<div class="flex" data-mq-half>' + items + items + '</div><div class="flex" aria-hidden="true">' + items + items + "</div>";
      return { box: box, track: track, half: $("[data-mq-half]", track), dir: box.hasAttribute("data-reverse") ? -1 : 1, x: 0, w: 0, visible: false };
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { boxes.forEach(function (b) { if (b.box === en.target) b.visible = en.isIntersecting; }); });
    });
    boxes.forEach(function (b) { b.w = b.half.offsetWidth; io.observe(b.box); });
    window.addEventListener("resize", function () { boxes.forEach(function (b) { b.w = b.half.offsetWidth; }); });
    var last = window.scrollY, pending = false;
    window.addEventListener("scroll", function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        var dy = window.scrollY - last;
        last = window.scrollY;
        boxes.forEach(function (b) {
          if (!b.visible || !b.w) return;
          b.x -= dy * 0.6 * b.dir;
          b.x = ((b.x % b.w) - b.w) % b.w;
          b.track.style.transform = "translate3d(" + b.x + "px,0,0)";
        });
      });
    }, { passive: true });
  }

  /* ---------------- Trilhos arrastáveis ---------------- */
  function initTrack(track, prevBtn, nextBtn) {
    var down = false, startX = 0, startLeft = 0;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.target.closest("a, button")) return;
      down = true; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) track.classList.add("is-dragging");
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", function () { down = false; track.classList.remove("is-dragging"); });
    var step = function (d) {
      var card = $(".pop-card:not([hidden])", track);
      track.scrollBy({ left: d * (card ? card.offsetWidth + 24 : 320), behavior: "smooth" });
    };
    if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });
  }

  function initTabs(tabs, track, list) {
    var indicator = $("[data-tab-indicator]", tabs);
    tabs.insertAdjacentHTML("beforeend", list.map(function (c, i) {
      return '<button type="button" role="tab" class="tab-btn" data-tab="' + esc(c.id) + '" aria-selected="' + (i === 0) + '">' + esc(c.label) + "</button>";
    }).join(""));
    var move = function (btn) {
      indicator.style.width = btn.offsetWidth + "px";
      indicator.style.transform = "translateX(" + (btn.offsetLeft - 5) + "px)";
    };
    $$("[data-tab]", tabs).forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$("[data-tab]", tabs).forEach(function (b) { b.setAttribute("aria-selected", String(b === btn)); });
        move(btn);
        var id = btn.getAttribute("data-tab");
        var shown = [];
        $$(".pop-card", track).forEach(function (card) {
          var show = id === "all" || card.getAttribute("data-cat") === id;
          card.hidden = !show;
          if (show) shown.push(card);
        });
        shown.forEach(function (card, k) {
          anim(card, [{ transform: "translateY(60px) scale(.9)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 900, delay: k * 80, fill: "none" });
        });
        track.scrollTo({ left: 0, behavior: "smooth" });
      });
    });
    var first = $("[data-tab]", tabs);
    var place = function () { var sel = $('[data-tab][aria-selected="true"]', tabs) || first; if (sel) move(sel); };
    requestAnimationFrame(place);
    window.addEventListener("resize", place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  }

  /* ---------------- Vitrine de produtos ---------------- */
  function initProducts() {
    var track = $("[data-ptrack]");
    if (!track) return;
    var glows = { moments: "#e0b054", vogens: "#f0a830", fios: "#e8c79a" };
    track.innerHTML = products.map(function (p, k) {
      return '<article class="pop-card rv" data-anim="up" style="--d:' + (k * 0.1) + "s;--glow:" + esc(p.colors[0] || glows[p.category] || "#e0b054") + '" role="listitem" data-cat="' + esc(p.category) + '">' +
        '<div class="pop-img"><img src="' + media(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" /></div>' +
        '<p class="brand-tag">' + esc(p.brand || "Moments Paris") + "</p>" +
        '<h4 class="font-display mt-2 text-2xl font-semibold leading-tight">' + esc(p.name) + "</h4>" +
        '<div class="mt-3 flex items-baseline gap-2.5">' +
          '<p class="font-display text-2xl font-bold text-white">' + esc(p.price || "Sob consulta") + "</p>" +
          (p.oldPrice ? '<p class="font-display text-sm text-white/45 line-through">' + esc(p.oldPrice) + "</p>" : "") +
        "</div>" +
        '<div class="pop-action mt-5"><a class="btn btn-primary !min-h-[44px] !px-4 !py-2 text-sm" href="' + esc(productWa(p)) + '" target="_blank" rel="noopener">Pedir pelo WhatsApp <i data-lucide="arrow-up-right" class="arrow h-4 w-4" aria-hidden="true"></i></a></div>' +
        "</article>";
    }).join("");
    guardAll(track);
    var cats = C.productCategories.filter(function (c) { return products.some(function (p) { return p.category === c.id; }); });
    initTabs($("[data-ptabs]"), track, [{ id: "all", label: "Todos" }].concat(cats));
    initTrack(track, $("[data-ptrack-prev]"), $("[data-ptrack-next]"));
  }

  /* ---------------- Serviços ---------------- */
  var published = C.services.items.filter(function (s) { return s.published === true; });
  function serviceMessage(s) { return (s.whatsappMessage || C.whatsapp.defaultMessage).replace(/\[servi[çc]o\]/gi, s.name); }
  function serviceCard(s, k) {
    var cat = C.services.categories.filter(function (c) { return c.id === s.category; })[0];
    var meta = [];
    if (s.duration) meta.push('<span class="chip !text-[0.62rem]"><i data-lucide="clock" class="h-3 w-3" aria-hidden="true"></i>' + esc(s.duration) + "</span>");
    if (cat) meta.push('<span class="chip !text-[0.62rem]">' + esc(cat.label) + "</span>");
    return '<article class="pop-card rv" data-anim="up" style="--d:' + (k * 0.1) + 's" role="listitem" data-cat="' + esc(s.category) + '">' +
      '<div class="pop-img"><img src="' + media(s.image) + '" alt="" loading="lazy" /></div>' +
      '<div class="flex flex-wrap gap-2">' + meta.join("") + "</div>" +
      '<h3 class="font-display mt-4 text-2xl font-semibold">' + esc(s.name) + "</h3>" +
      '<p class="mt-2 text-sm leading-relaxed text-white/70">' + esc(s.description) + "</p>" +
      (s.price ? '<p class="font-display mt-4 text-2xl font-bold text-white">' + esc(s.price) + "</p>" : '<p class="mt-4 text-xs text-white/50">Valor informado pela equipe.</p>') +
      '<div class="pop-action mt-5 flex flex-wrap gap-2">' +
        '<button type="button" class="btn btn-primary !min-h-[44px] !px-4 !py-2 text-sm" data-open-drawer data-service="' + esc(s.name) + '">Solicitar horário</button>' +
        '<a class="btn btn-ghost !min-h-[44px] !px-4 !py-2 text-sm" href="' + esc(S.waUrl(C.contact.whatsappNumber, serviceMessage(s))) + '" target="_blank" rel="noopener">Tirar dúvida</a>' +
      "</div></article>";
  }
  function infoCard(o, k) {
    return '<article class="pop-card rv" data-anim="up" style="--d:' + (k * 0.12) + "s;--glow:" + o.glow + '" role="listitem">' +
      '<div class="pop-img"><img src="' + media(o.art) + '" alt="" loading="lazy" /></div>' +
      '<p class="eyebrow">' + esc(o.step) + "</p>" +
      '<h3 class="font-display mt-3 text-2xl font-semibold">' + esc(o.title) + "</h3>" +
      '<p class="mt-2 text-sm leading-relaxed text-white/70">' + esc(o.text) + "</p>" +
      '<div class="pop-action mt-5">' + o.action + "</div></article>";
  }
  function initServices() {
    var track = $("[data-track]");
    if (!track) return;
    if (!published.length) {
      track.innerHTML = [
        { step: "Passo 1", title: "Conte o que você procura", text: "Descreva o serviço que deseja e a equipe responde com as opções disponíveis.", art: "petala", glow: "#e0b054",
          action: '<button type="button" class="btn btn-primary !min-h-[44px] !px-4 !py-2 text-sm" data-open-drawer>Solicitar horário</button>' },
        { step: "Passo 2", title: "Consulte valores e duração", text: "Valores e tempo de cada atendimento são informados diretamente pela equipe.", art: "seda", glow: "#e8c79a",
          action: '<a class="btn btn-ghost !min-h-[44px] !px-4 !py-2 text-sm" href="' + esc(waDefault) + '" target="_blank" rel="noopener">Perguntar no WhatsApp</a>' },
        { step: "Passo 3", title: "Combine o melhor horário", text: "Indique dia e período de preferência. A confirmação vem da equipe pelo WhatsApp.", art: "espelho", glow: "#b94be0",
          action: '<button type="button" class="btn btn-ghost !min-h-[44px] !px-4 !py-2 text-sm" data-open-drawer>Escolher período</button>' },
        { step: "No dia", title: "Venha brilhar", text: "Um espaço onde todas as pessoas são bem-vindas, na Vila Aeroporto, em Campinas.", art: "joia", glow: "#ffffff",
          action: '<a class="btn btn-ghost !min-h-[44px] !px-4 !py-2 text-sm" href="' + esc(mapsLink) + '" target="_blank" rel="noopener">Como chegar</a>' },
      ].map(infoCard).join("");
    } else {
      $("[data-services-intro]").textContent = "Escolha um serviço para solicitar horário ou tirar dúvidas pelo WhatsApp.";
      var tabs = $("[data-tabs]");
      var cats = C.services.categories.filter(function (c) { return published.some(function (s) { return s.category === c.id; }); });
      tabs.hidden = !cats.length;
      track.innerHTML = published.map(serviceCard).join("");
      initTabs(tabs, track, [{ id: "all", label: "Todos" }].concat(cats));
    }
    guardAll(track);
    initTrack(track, $("[data-track-prev]"), $("[data-track-next]"));
  }

  /* ---------------- Vídeo ---------------- */
  function initVideo() {
    var v = $("[data-cine-video]");
    if (!v) return;
    var cfg = C.media.video;
    if (!cfg || !cfg.src) { v.remove(); return; }
    v.addEventListener("error", function () { v.remove(); }, { once: true });
    v.addEventListener("loadeddata", function () { v.style.opacity = "1"; });
    v.style.opacity = "0";
    v.style.transition = "opacity 1.2s " + EASE;
    v.src = encodeURI(cfg.src);
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  /* ---------------- Avaliações (somente reais) ---------------- */
  function initReviews() {
    var items = C.reviews.items.filter(function (r) { return r && r.text && r.name; });
    var stage = $("[data-rv-stage]");
    if (!stage || !items.length) return;
    stage.hidden = false;
    $("[data-rv-controls]").hidden = false;
    stage.innerHTML = items.map(function (r) {
      var stars = r.rating ? '<div class="stars text-lg" aria-label="Nota ' + esc(r.rating) + ' de 5">' + new Array(Math.round(r.rating) + 1).join("<span>★</span>") + "</div>" : "";
      var src = r.url ? '<a class="underline-offset-4 hover:underline" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.source || "Fonte") + "</a>" : esc(r.source || "");
      return '<figure class="rv-card glass">' + stars +
        '<blockquote class="font-display mt-4 text-2xl leading-snug">“' + esc(r.text) + '”</blockquote>' +
        '<figcaption class="mt-5 text-sm"><strong>' + esc(r.name) + '</strong><span class="block text-xs text-white/50">' + src + (r.verifiedAt ? " · verificado em " + esc(fmtDate(r.verifiedAt)) : "") + "</span></figcaption></figure>";
    }).join("");
    var cards = $$(".rv-card", stage);
    var cur = 0;
    function layout() {
      var n = cards.length;
      cards.forEach(function (c, i) {
        var off = ((i - cur) % n + n) % n;
        if (off > n / 2) off -= n;
        var abs = Math.abs(off);
        c.style.transform = "translateX(" + off * 62 + "%) translateZ(" + -abs * 180 + "px) rotateY(" + -off * 18 + "deg) scale(" + (1 - abs * 0.12) + ")";
        c.style.filter = abs ? "blur(" + abs * 2 + "px)" : "none";
        c.style.opacity = abs > 2 ? "0" : String(1 - abs * 0.3);
        c.style.zIndex = String(10 - abs);
        c.setAttribute("aria-hidden", String(abs !== 0));
      });
    }
    function go(d) { cur = (cur + d + cards.length) % cards.length; layout(); }
    $("[data-rv-prev]").addEventListener("click", function () { go(-1); });
    $("[data-rv-next]").addEventListener("click", function () { go(1); });
    var sx = null, hover = false;
    stage.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    stage.addEventListener("pointerup", function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 40) go(e.clientX < sx ? 1 : -1); sx = null; });
    stage.addEventListener("pointerenter", function () { hover = true; });
    stage.addEventListener("pointerleave", function () { hover = false; });
    if (cards.length > 1) setInterval(function () { if (!hover && !document.hidden) go(1); }, 5500);
    layout();
  }

  /* ---------------- Formulário de agendamento ---------------- */
  function formHtml(id) {
    var L = C.form.limits;
    var serviceField = published.length
      ? '<select id="' + id + '-service" name="service" required aria-describedby="' + id + '-service-err">' +
          '<option value="">Selecione…</option>' +
          published.map(function (s) { return '<option value="' + esc(s.name) + '">' + esc(s.name) + "</option>"; }).join("") +
          '<option value="__outro">Outro (descrever)</option></select>' +
          '<input id="' + id + '-service-other" name="serviceOther" type="text" maxlength="' + L.service + '" placeholder="Descreva o que você procura" hidden aria-label="Descreva o serviço" />'
      : '<input id="' + id + '-service" name="service" type="text" required maxlength="' + L.service + '" autocomplete="off" placeholder="Escreva o que você procura" aria-describedby="' + id + '-service-err" />';
    var today = new Date();
    var min = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

    return '<form class="grid gap-5" novalidate data-booking-form>' +
      '<div class="field"><label for="' + id + '-name">Nome *</label>' +
        '<input id="' + id + '-name" name="name" type="text" required maxlength="' + L.name + '" autocomplete="given-name" aria-describedby="' + id + '-name-err" />' +
        '<p class="err" id="' + id + '-name-err" data-err="name"></p></div>' +
      '<div class="field"><label for="' + id + '-service">Serviço de interesse *</label>' + serviceField +
        '<p class="err" id="' + id + '-service-err" data-err="service"></p></div>' +
      '<div class="field"><label for="' + id + '-day">Dia preferido <span class="font-normal text-white/45">(opcional)</span></label>' +
        '<input id="' + id + '-day" name="day" type="date" min="' + min + '" /></div>' +
      '<div class="field"><span class="text-[0.82rem] font-bold text-white/70" id="' + id + '-period-label">Período preferido <span class="font-normal text-white/45">(opcional)</span></span>' +
        '<div class="period-group" role="group" aria-labelledby="' + id + '-period-label">' + periodButtons() + "</div></div>" +
      '<div class="field"><label for="' + id + '-notes">Observações <span class="font-normal text-white/45">(opcional)</span></label>' +
        '<textarea id="' + id + '-notes" name="notes" maxlength="' + L.notes + '" placeholder="Algo que a equipe deva saber? Não é necessário informar dados de saúde ou documentos." aria-describedby="' + id + '-notes-count"></textarea>' +
        '<p class="hint" id="' + id + '-notes-count" data-count>0/' + L.notes + "</p>" +
        '<p class="err" data-err="notes"></p></div>' +
      '<p class="field rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/75"><span><i data-lucide="info" class="mr-1 inline h-4 w-4 align-[-3px]" aria-hidden="true"></i>' + esc(C.whatsapp.formNotice) + "</span></p>" +
      '<div class="field flex flex-col gap-3 sm:!flex sm:flex-row">' +
        '<button type="submit" class="btn btn-wa flex-1">Continuar no WhatsApp <i data-lucide="arrow-up-right" class="arrow h-4 w-4" aria-hidden="true"></i></button>' +
        '<button type="button" class="btn btn-ghost" data-copy><i data-lucide="copy" class="h-4 w-4" aria-hidden="true"></i>Copiar mensagem</button>' +
      "</div>" +
      '<p class="text-xs leading-relaxed text-white/60" data-form-status role="status" aria-live="polite"></p>' +
      '<p class="text-xs leading-relaxed text-white/50">Se o WhatsApp não abrir, copie a mensagem ou ligue para <a class="font-bold text-white/80 underline underline-offset-4" href="' + esc(C.contact.phoneHref) + '">' + esc(C.contact.phoneDisplay) + "</a>. " +
        'Veja a <a class="underline underline-offset-4" href="privacidade.html">política de privacidade</a>.</p>' +
      "</form>";
  }

  function readForm(form) {
    var get = function (n) { var el = form.elements[n]; return el ? el.value : ""; };
    var service = get("service");
    if (service === "__outro") service = get("serviceOther");
    var day = get("day");
    if (day) {
      var d = new Date(day + "T12:00:00");
      if (!isNaN(d)) day = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
    }
    return S.normalizeForm({ name: get("name"), service: service, day: day, period: selectedPeriod, notes: get("notes") }, C.form.limits);
  }
  function showErrors(form, errors) {
    $$("[data-err]", form).forEach(function (p) { p.textContent = errors[p.getAttribute("data-err")] || ""; });
    ["name", "service", "notes"].forEach(function (n) {
      var el = form.elements[n];
      if (n === "service" && form.elements.service && form.elements.service.value === "__outro") el = form.elements.serviceOther;
      if (el) el.setAttribute("aria-invalid", errors[n] ? "true" : "false");
    });
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      ok ? resolve() : reject(new Error("copy"));
    });
  }
  function mountForms() {
    $$("[data-form-mount]").forEach(function (mount) {
      var id = "f-" + mount.getAttribute("data-form-mount");
      mount.innerHTML = formHtml(id);
      var form = $("form", mount);
      var status = $("[data-form-status]", form);
      var notes = form.elements.notes;
      var count = $("[data-count]", form);
      notes.addEventListener("input", function () { count.textContent = notes.value.length + "/" + C.form.limits.notes; });
      var sel = form.elements.service;
      if (sel && sel.tagName === "SELECT") {
        sel.addEventListener("change", function () {
          var other = form.elements.serviceOther;
          other.hidden = sel.value !== "__outro";
          if (!other.hidden) other.focus();
        });
      }
      form.addEventListener("input", function (e) { if (e.target.getAttribute("aria-invalid") === "true") e.target.setAttribute("aria-invalid", "false"); });
      // campos entram em cascata (formulário da página)
      if (mount.getAttribute("data-form-mount") === "inline") {
        $$(".field", form).forEach(function (f, k) { f.classList.add("rv"); f.setAttribute("data-anim", "up"); f.style.setProperty("--d", (0.15 + k * 0.07) + "s"); });
      }

      function validated() {
        var data = readForm(form);
        var v = S.validateForm(data, C.form.limits);
        showErrors(form, v.errors);
        if (!v.ok) {
          var firstKey = ["name", "service", "notes"].filter(function (k) { return v.errors[k]; })[0];
          var el = form.elements[firstKey];
          if (firstKey === "service" && sel && sel.value === "__outro") el = form.elements.serviceOther;
          if (el && el.focus) el.focus();
          status.textContent = "Revise os campos destacados.";
          return null;
        }
        return S.buildFormMessage(C, data);
      }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msg = validated();
        if (!msg) return;
        var url = S.waUrl(C.contact.whatsappNumber, msg);
        var w = window.open(url, "_blank");
        if (w) { try { w.opener = null; } catch (err) { /* ignore */ } } else { window.location.href = url; }
        // Não afirmamos envio nem agendamento: o envio é feito pela pessoa no WhatsApp.
        status.textContent = "Abrimos o WhatsApp com a sua mensagem. Confira o texto e toque em enviar no aplicativo. A disponibilidade será confirmada pela equipe.";
      });
      $("[data-copy]", form).addEventListener("click", function () {
        var msg = validated();
        if (!msg) return;
        copyText(msg).then(function () {
          status.textContent = "Mensagem copiada. Cole no WhatsApp para " + C.contact.phoneDisplay + ".";
          toast("Mensagem copiada");
        }, function () {
          status.textContent = "Não foi possível copiar automaticamente. Ligue para " + C.contact.phoneDisplay + ".";
        });
      });
    });
  }
  function prefillService(name) {
    if (!name) return;
    var form = $('[data-form-mount="drawer"] form');
    if (!form) return;
    var el = form.elements.service;
    if (el.tagName === "SELECT") { if ($$("option", el).some(function (o) { return o.value === name; })) el.value = name; }
    else el.value = name;
  }

  /* ---------------- Gaveta ---------------- */
  var lastFocus = null;
  function openDrawer(service) {
    var drawer = $("[data-drawer]");
    lastFocus = document.activeElement;
    prefillService(service);
    $$(".field, .drawer-anim", drawer).forEach(function (f, k) { f.style.transitionDelay = (0.2 + k * 0.06) + "s"; });
    document.body.classList.add("drawer-open");
    drawer.removeAttribute("inert");
    drawer.setAttribute("aria-hidden", "false");
    if (lenis) lenis.stop();
    document.documentElement.style.overflow = "hidden";
    setTimeout(function () { var f = $("input, select", drawer); if (f) f.focus({ preventScroll: true }); }, 450);
  }
  function closeDrawer() {
    var drawer = $("[data-drawer]");
    if (!document.body.classList.contains("drawer-open")) return;
    $$(".field, .drawer-anim", drawer).forEach(function (f) { f.style.transitionDelay = "0s"; });
    document.body.classList.remove("drawer-open");
    drawer.setAttribute("inert", "");
    drawer.setAttribute("aria-hidden", "true");
    if (lenis) lenis.start();
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function initDrawer() {
    document.addEventListener("click", function (e) {
      var o = e.target.closest("[data-open-drawer]");
      if (o) { e.preventDefault(); closeMenu(); openDrawer(o.getAttribute("data-service")); return; }
      if (e.target.closest("[data-close-drawer]")) closeDrawer();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeDrawer(); closeMenu(); }
      if (e.key === "Tab" && document.body.classList.contains("drawer-open")) {
        var f = $$("[data-drawer] button, [data-drawer] a, [data-drawer] input:not([hidden]), [data-drawer] select, [data-drawer] textarea").filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  /* ---------------- Navegação ---------------- */
  var menuBtn, menu;
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
  function initNav() {
    menuBtn = $("[data-menu-toggle]");
    menu = $("#mobile-menu");
    menuBtn.addEventListener("click", function () {
      var open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id.length < 2) { e.preventDefault(); return; }
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: id === "#inicio" ? 0 : -20, duration: 1.6 });
      else target.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", id);
    });

    var pill = $("[data-nav]");
    var ind = $("[data-nav-indicator]");
    var links = $$("a", pill);
    function moveTo(link) {
      if (!link) return;
      ind.style.opacity = "1";
      ind.style.width = link.offsetWidth + "px";
      ind.style.transform = "translateX(" + link.offsetLeft + "px)";
      links.forEach(function (l) { l.classList.toggle("is-active", l === link); });
    }
    var sections = links.map(function (l) { return document.querySelector(l.getAttribute("href")); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) moveTo(links[sections.indexOf(en.target)]); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) io.observe(s); });

    var header = $(".site-header");
    var bar = $("[data-progress]");
    // menu muda para versão escura sobre seções claras
    var light = $$(".moments");
    var lightIO = new IntersectionObserver(function () {
      var hy = 40;
      header.classList.toggle("on-light", light.some(function (s) { var r = s.getBoundingClientRect(); return r.top <= hy && r.bottom >= hy; }));
    }, { threshold: Array.from({ length: 21 }, function (_, i) { return i / 20; }) });
    light.forEach(function (s) { lightIO.observe(s); });
    window.addEventListener("scroll", function () {
      header.classList.toggle("on-light", light.some(function (s) { var r = s.getBoundingClientRect(); return r.top <= 40 && r.bottom >= 40; }));
    }, { passive: true });
    var lastY = 0;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      header.classList.toggle("is-hidden", y > 300 && y > lastY && !menu.classList.contains("is-open"));
      lastY = y;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    }, { passive: true });
  }

  /* ---------------- Micro-interações ---------------- */
  function initMicro() {
    document.addEventListener("pointermove", function (e) {
      var b = e.target.closest && e.target.closest(".btn");
      if (!b) return;
      var r = b.getBoundingClientRect();
      b.style.setProperty("--bx", e.clientX - r.left + "px");
      b.style.setProperty("--by", e.clientY - r.top + "px");
    });
    if (!finePointer) return;

    // magnéticos: só reagem enquanto o mouse está sobre o botão
    document.addEventListener("pointerover", function (e) {
      var b = e.target.closest && e.target.closest("[data-magnetic]");
      if (!b || b.__mag) return;
      b.__mag = true;
      b.addEventListener("pointermove", function (ev) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + (ev.clientX - r.left - r.width / 2) * 0.28 + "px," + (ev.clientY - r.top - r.height / 2) * 0.38 + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });

    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(1000px) rotateX(" + (-py * 9) + "deg) rotateY(" + (px * 11) + "deg)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transition = "transform .9s " + EASE;
        el.style.transform = "";
        setTimeout(function () { el.style.transition = ""; }, 900);
      });
    });

    var dot = $(".cursor-dot"), ring = $(".cursor-ring");
    document.body.classList.add("has-cursor");
    // cursor: atualiza só quando o mouse se move (sem loop contínuo)
    window.addEventListener("pointermove", function (e) {
      var t = "translate(" + e.clientX + "px," + e.clientY + "px)";
      dot.style.transform = t;
      ring.style.transform = t;
      ring.classList.toggle("is-hover", !!(e.target.closest && e.target.closest("a, button, [data-tilt], input, select, textarea")));
    }, { passive: true });
  }

  /* ---------------- Eiffel (desenho de traço) ---------------- */
  function initEiffel() {
    $$("[data-eiffel] path, [data-eiffel] line, [data-eiffel] polyline").forEach(function (p) {
      try { var l = Math.ceil(p.getTotalLength()); p.style.setProperty("--len", l); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; } catch (e) {}
    });
    var svg = $("[data-eiffel]");
    if (!svg) return;
    new IntersectionObserver(function (en, obs) {
      if (!en[0].isIntersecting) return;
      obs.disconnect();
      $$("path, line, polyline", svg).forEach(function (p, k) {
        p.style.transition = "stroke-dashoffset 2.6s " + EASE + " " + k * 0.12 + "s";
        p.style.strokeDashoffset = "0";
      });
    }, { threshold: 0.2 }).observe(svg);
  }

  /* ---------------- Scroll suave + efeitos de scroll (GSAP) ---------------- */
  function initScroll() {
    if (typeof window.Lenis !== "undefined") {
      lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true });
      if (hasST) {
        lenis.on("scroll", window.ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } else {
        (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
      }
    }
    if (hasST) {
      gsap.registerPlugin(window.ScrollTrigger);
      // hero se afasta ao rolar
      gsap.to("[data-hero-orbit]", { yPercent: 18, scale: 0.9, ease: "none", scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-hero-left], [data-hero-right]", { y: -80, opacity: 0.2, ease: "none", scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true } });
      var cine = $("[data-cine]");
      if (cine) gsap.fromTo(cine, { scale: 0.84, borderRadius: "80px" }, { scale: 1, borderRadius: "40px", ease: "none", scrollTrigger: { trigger: cine, start: "top bottom", end: "top 20%", scrub: 1 } });
      $$("[data-parallax-x]").forEach(function (el) {
        var amt = parseFloat(el.getAttribute("data-parallax-x")) || -100;
        gsap.fromTo(el, { x: -amt }, { x: amt, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.fromTo("[data-moments-logo]", { scale: 0.8, rotate: -6 }, { scale: 1, rotate: 0, ease: "none", scrollTrigger: { trigger: "#moments", start: "top bottom", end: "center center", scrub: true } });
      window.addEventListener("load", function () { window.ScrollTrigger.refresh(); });
    }
  }

  /* ---------------- Abertura ---------------- */
  function initPreloader() {
    var pl = $("[data-preloader]");
    var word = $("[data-pl-word]");
    if (word) {
      var txt = word.textContent;
      word.innerHTML = txt.split("").map(function (ch, i) {
        return '<span style="animation-delay:' + (i * 0.035) + 's">' + (ch === " " ? "&nbsp;" : esc(ch)) + "</span>";
      }).join("");
    }
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      if (pl) pl.classList.add("is-done");
      document.body.classList.remove("is-loading");
      anim($(".site-header"), [{ transform: "translateY(-120%)" }, { transform: "none" }], { duration: 1200, delay: 250, fill: "none" });
      if (heroApi) heroApi.intro();
      observeReveals(document);
      setTimeout(function () { if (pl) pl.remove(); }, 1300);
    }
    setTimeout(finish, 1300);
  }

  /* ---------------- Inicialização ---------------- */
  fillGlobals();
  $$("[data-split]").forEach(splitEl);
  guardAll(document);
  initHero();
  initMarquees();
  initProducts();
  initVideo();
  initServices();
  initReviews();
  mountForms();
  initDrawer();
  initNav();
  initCounters();
  initEiffel();
  initScroll();
  initMicro();
  icons();
  initPreloader();
})();
