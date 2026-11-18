/* ==========================================================================
   Studio Lucia Ferraz — TELA INICIAL (hero)
   - Dados: um único array PRODUCTS montado a partir de js/config.js (products[]).
   - Fotos: recorte automático da transparência (canvas) + normalização 85% × 88% da caixa.
   - Transições com GSAP (mola), tilt 3D, parallax, swipe, teclado, voo até o WhatsApp.
   - Regra: animação CSS no wrapper, GSAP no filho (nunca os dois no mesmo elemento).
   ========================================================================== */
(function () {
  "use strict";

  var C = window.SITE_CONFIG;
  var S = window.SLF;
  var hero = document.querySelector("[data-hero]");
  if (!C || !S || !hero) return;

  var gsap = window.gsap;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  // "Reduzir movimento" (Windows com efeitos de animação desligados) NÃO desliga o topo:
  // trocas de produto e textos continuam; só levitação infinita (CSS) e tilt são desligados.
  var animate = !!gsap;
  var lite = reduced;

  /* ======================================================================
     DADOS — { id, marca, nome, kicker, title[], desc, tagline[], img, scale,
               colors[c1,c2,c3], optLabel, options[{label,img,price,oldPrice}] }
     ====================================================================== */
  var PRODUCTS = (C.products || []).filter(function (p) { return p.published; }).map(function (p) {
    return {
      id: p.id,
      marca: p.brand || "",
      nome: p.name,
      category: p.category,
      kicker: p.kicker || [p.brand, p.name].filter(Boolean).join(" · "),
      title: p.title && p.title.length ? p.title : [p.name],
      desc: p.description || "",
      tagline: p.taglineLines && p.taglineLines.length ? p.taglineLines : [p.tagline || ""],
      img: p.image,
      thumb: p.thumb || p.image, // versão leve (300 px) para seletores e miniatura
      pretrimmed: !!p.pretrimmed,
      scale: typeof p.scale === "number" ? p.scale : 1,
      colors: p.colors && p.colors.length >= 3 ? p.colors : ["#e9c27a", "#7a5420", "#120b04"],
      watermark: p.watermark || "LUCIA",
      optLabel: p.optLabel || "Escolha o produto:",
      options: p.options && p.options.length ? p.options : [{ label: p.option || p.volume || "", img: p.image, price: p.price, oldPrice: p.oldPrice }],
    };
  });
  if (!PRODUCTS.length) return;

  /* ---------------- utilidades ---------------- */
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function num(str) {
    if (str == null || str === "") return null;
    var n = parseFloat(String(str).replace(/[^\d,]/g, "").replace(",", "."));
    return isNaN(n) ? null : n;
  }
  function brl(n) { return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  function two(n) { return String(n).padStart(2, "0"); }
  function opt(p) { return p.options[0]; }
  function waUrl(p) {
    var o = opt(p);
    var name = p.nome + (o.label ? " (" + o.label + ")" : "");
    return S.waUrl(C.contact.whatsappNumber, C.whatsapp.productMessage.replace(/\[produto\]/gi, name));
  }

  /* ---------------- imagens: placeholder, recorte e pré-carga ---------------- */
  function placeholder(p) {
    var c = p.colors;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
      '<defs><radialGradient id="g" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="' + c[0] + '"/><stop offset=".6" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></radialGradient></defs>' +
      '<circle cx="200" cy="200" r="170" fill="url(#g)"/><circle cx="200" cy="200" r="170" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>' +
      '<text x="200" y="208" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="800" font-size="30" fill="#fff">' + esc(p.nome) + "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  var SRC = PRODUCTS.map(function (p) { return encodeURI(p.img); });
  var THUMB = PRODUCTS.map(function (p) { return encodeURI(p.thumb); });
  // pré-carrega e decodifica todas as fotos no início (a troca não "pisca")
  PRODUCTS.forEach(function (p, i) {
    var im = new Image();
    im.src = SRC[i];
    if (im.decode) im.decode().catch(function () {});
    if (p.thumb !== p.img) { var t = new Image(); t.src = THUMB[i]; }
  });
  var trimCache = new Map(); // recorte feito uma única vez por imagem
  // Desenha num canvas, acha o retângulo dos pixels com alpha > 10, recorta e devolve dataURL sem margem.
  function trimmed(i) {
    var p = PRODUCTS[i];
    if (trimCache.has(p.img)) return trimCache.get(p.img);
    var job = new Promise(function (resolve) {
      if (p.pretrimmed) { resolve(encodeURI(p.img)); return; } // arquivo já recortado e otimizado
      var im = new Image();
      im.decoding = "async";
      im.onload = function () {
        try {
          var w = im.naturalWidth, h = im.naturalHeight;
          var cv = document.createElement("canvas");
          cv.width = w; cv.height = h;
          var ctx = cv.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(im, 0, 0);
          var d = ctx.getImageData(0, 0, w, h).data;
          var minX = w, minY = h, maxX = -1, maxY = -1;
          for (var y = 0; y < h; y++) {
            var row = y * w * 4;
            for (var x = 0; x < w; x++) {
              if (d[row + x * 4 + 3] > 10) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                maxY = y;
              }
            }
          }
          if (maxX < 0) return resolve(encodeURI(p.img));
          var cw = maxX - minX + 1, ch = maxY - minY + 1;
          var out = document.createElement("canvas");
          out.width = cw; out.height = ch;
          out.getContext("2d").drawImage(im, minX, minY, cw, ch, 0, 0, cw, ch);
          resolve(out.toDataURL("image/png"));
        } catch (e) {
          resolve(encodeURI(p.img)); // canvas bloqueado (CORS/file://): usa a imagem original
        }
      };
      im.onerror = function () { resolve(placeholder(p)); };
      im.src = encodeURI(p.img);
    });
    trimCache.set(p.img, job);
    return job;
  }
  function imgTag(i, alt, small) {
    return '<img src="' + (small ? THUMB[i] : SRC[i]) + '" data-pid="' + i + '"' + (small ? ' data-thumb=""' : "") + ' alt="' + esc(alt || "") + '" draggable="false" decoding="async" />';
  }
  // imagem quebrada → placeholder bonito
  hero.addEventListener("error", function (e) {
    var t = e.target;
    if (t.tagName === "IMG" && t.hasAttribute("data-pid") && !t.__ph) {
      t.__ph = true;
      t.src = placeholder(PRODUCTS[+t.getAttribute("data-pid")]);
    }
  }, true);
  // pré-carrega e recorta todas; troca as <img> já exibidas quando o recorte fica pronto
  PRODUCTS.forEach(function (p, i) {
    trimmed(i).then(function (url) {
      SRC[i] = url;
      if (p.pretrimmed) return;
      if (p.thumb === p.img) THUMB[i] = url;
      $$('img[data-pid="' + i + '"]', hero).forEach(function (im) { if (!im.hasAttribute("data-thumb") || p.thumb === p.img) im.src = url; });
    });
  });

  /* ---------------- elementos ---------------- */
  var holder = $("[data-holder]");
  var shadow = $("[data-shadow]");
  var shadowPar = $("[data-shadow-par]");
  var tilt = $("[data-tilt3d]");
  var stage = $("[data-stage]");
  var wm = $("[data-wm]");
  var wmPar = $("[data-wm-par]");
  var kicker = $("[data-kicker]");
  var title = $("[data-title]");
  var desc = $("[data-desc]");
  var cur = $("[data-cur]");
  var price = $("[data-price]");
  var old = $("[data-old]");
  var optlabel = $("[data-optlabel]");
  var picks = $("[data-picks]");
  var dots = $("[data-dots]");
  var tagline = $("[data-tagline]");
  var nextBtn = $("[data-next-thumb]");
  var nextIn = $("[data-next-in]");
  var nextImg = $("[data-next-img]");
  var nextName = $("[data-next-name]");
  var buy = $("[data-buy]");
  $$("[data-total]", hero).forEach(function (el) { el.textContent = two(PRODUCTS.length); });

  var idx = 0;
  var busy = false;
  var busyTimer = 0;
  var priceNow = { v: num(opt(PRODUCTS[0]).price) || 0, o: num(opt(PRODUCTS[0]).oldPrice) || 0 };

  /* ---------------- renderização ---------------- */
  function makeItem(i) {
    var el = document.createElement("div");
    el.className = "hx-item";
    el.innerHTML = imgTag(i, PRODUCTS[i].nome);
    var img = el.firstChild;
    if (PRODUCTS[i].scale !== 1) img.style.transform = "scale(" + PRODUCTS[i].scale + ")";
    return el;
  }
  function titleHTML(lines) {
    return lines.map(function (l) { return '<span class="clip"><span class="inner">' + esc(l) + "</span></span>"; }).join("");
  }
  function setPrice(p) {
    var o = opt(p);
    var v = num(o.price), ov = num(o.oldPrice);
    price.textContent = v == null ? "Sob consulta" : brl(v);
    old.textContent = ov == null ? "" : brl(ov);
    old.parentElement.hidden = ov == null;
    priceNow.v = v || 0; priceNow.o = ov || 0;
  }
  function countPrice(p) {
    var o = opt(p);
    var v = num(o.price), ov = num(o.oldPrice);
    if (v == null || !animate) { setPrice(p); return; }
    old.parentElement.hidden = ov == null;
    var obj = { v: priceNow.v || v, o: priceNow.o || ov || 0 };
    gsap.to(obj, {
      v: v, o: ov || 0, duration: 0.7, ease: "power3.out",
      onUpdate: function () { price.textContent = brl(obj.v); if (ov != null) old.textContent = brl(obj.o); },
      onComplete: function () { setPrice(p); },
    });
  }
  function renderPicks() {
    picks.innerHTML = PRODUCTS.map(function (p, i) {
      return '<button type="button" class="hx-pick" data-pick="' + i + '" aria-pressed="' + (i === idx) + '" aria-label="' + esc(p.nome) + '">' +
        '<span class="hx-pick-box">' + imgTag(i, "", true) + "</span></button>";
    }).join("");
    dots.innerHTML = PRODUCTS.map(function (p, i) {
      return '<button type="button" class="hx-dot" data-dot="' + i + '" aria-label="' + esc(p.nome) + '"' + (i === idx ? ' aria-current="true"' : "") + "></button>";
    }).join("");
  }
  // cada linha do título fica numa linha só; se não couber na coluna, reduz a fonte só o necessário
  function fitTitle() {
    title.style.fontSize = "";
    var max = title.parentElement.clientWidth;
    var widest = 0;
    $$(".inner", title).forEach(function (el) { widest = Math.max(widest, el.scrollWidth); });
    if (max > 0 && widest > max) {
      title.style.fontSize = (parseFloat(getComputedStyle(title).fontSize) * (max / widest) * 0.97) + "px";
    }
  }
  window.addEventListener("resize", fitTitle);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitle);

  function setTexts(i, keepPrice) {
    var p = PRODUCTS[i];
    kicker.textContent = p.kicker;
    title.innerHTML = titleHTML(p.title);
    title.setAttribute("aria-label", p.nome);
    fitTitle();
    desc.textContent = p.desc;
    cur.textContent = two(i + 1);
    optlabel.textContent = p.optLabel;
    tagline.innerHTML = p.tagline.map(esc).join("<br />");
    wm.textContent = p.watermark;
    if (!keepPrice) setPrice(p);
    buy.href = waUrl(p);
    var n = (i + 1) % PRODUCTS.length;
    nextImg.setAttribute("data-pid", n);
    nextImg.setAttribute("data-thumb", "");
    nextImg.src = THUMB[n];
    nextName.textContent = PRODUCTS[n].nome;
    $$(".hx-pick", picks).forEach(function (b, j) { b.setAttribute("aria-pressed", String(j === i)); });
    $$(".hx-dot", dots).forEach(function (b, j) { if (j === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
  }
  var bgEl = $(".hx-bg", hero);
  function setColors(p, smooth) {
    var root = bgEl; // só o fundo (no :root recalculava o estilo da página inteira a cada quadro)
    var vars = { "--c1": p.colors[0], "--c2": p.colors[1], "--c3": p.colors[2] };
    if (smooth && gsap) gsap.to(root, Object.assign({ duration: 1.2, ease: "power2.inOut" }, vars));
    else Object.keys(vars).forEach(function (k) { root.style.setProperty(k, vars[k]); });
  }
  function maskInners(withPrice) {
    var list = [cur].concat($$(".inner", title), [desc, optlabel]);
    if (withPrice) list.push(price, old);
    return list;
  }
  function popPicks() {
    if (!animate) return;
    gsap.fromTo($$(".hx-pick", picks), { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.07, overwrite: true });
  }

  /* ---------------- troca de produto (mola) ---------------- */
  function goTo(i, dir, via) {
    var n = PRODUCTS.length;
    i = ((i % n) + n) % n;
    if (busy || i === idx) return;
    if (dir == null) dir = i > idx ? 1 : -1;
    var p = PRODUCTS[i];
    idx = i;
    document.dispatchEvent(new CustomEvent("slf:product", { detail: { index: i, category: p.category } }));
    setColors(p, true);

    if (!animate) {
      holder.innerHTML = "";
      holder.appendChild(makeItem(i));
      setTexts(i);
      return;
    }
    busy = true;
    clearTimeout(busyTimer);
    busyTimer = setTimeout(function () { busy = false; }, 1500); // segurança: nunca fica preso
    var dist = Math.min(window.innerWidth * 0.6, 760);
    var oldItem = $(".hx-item", holder);
    var newItem = makeItem(i);
    holder.appendChild(newItem);
    gsap.set(newItem, { x: dir * dist, rotation: dir * 60, scale: 0.5, opacity: 0 });

    var countMode = via === "pick";
    var tl = gsap.timeline();
    if (oldItem) tl.to(oldItem, { x: -dir * dist, rotation: -dir * 50, scale: 0.55, opacity: 0, duration: 0.6, ease: "power3.in", onComplete: function () { oldItem.remove(); } }, 0);
    tl.to(newItem, { x: 0, rotation: 0, scale: 1, opacity: 1, duration: 1.5, ease: "elastic.out(1, 0.62)" }, 0.32);
    tl.to(shadow, { scaleX: 0.35, opacity: 0.2, duration: 0.5, ease: "power2.in" }, 0)
      .to(shadow, { scaleX: 1, opacity: 1, duration: 1.4, ease: "elastic.out(1, .55)" }, 0.5);

    // saída dos textos
    tl.to(maskInners(!countMode), { yPercent: -110, duration: 0.32, ease: "power2.in", stagger: 0.04 }, 0);
    tl.to([kicker, tagline], { opacity: 0, x: -dir * 24, duration: 0.3, ease: "power2.in" }, 0);
    tl.to(wm, { opacity: 0, scale: 0.92, duration: 0.3, ease: "power2.in" }, 0);
    tl.to(nextIn, { scale: 0, rotation: 90, duration: 0.35, ease: "power2.in" }, 0);

    // troca e entrada
    tl.add(function () {
      setTexts(i, countMode);
      gsap.fromTo(maskInners(!countMode), { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "power4.out", stagger: 0.07 });
      gsap.fromTo([kicker, tagline], { opacity: 0, x: dir * 24 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out", stagger: 0.05 });
      gsap.fromTo(wm, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1, ease: "power3.out" });
      gsap.fromTo(nextIn, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.9, ease: "elastic.out(1, .6)" });
      if (countMode) countPrice(p); else popPicks();
    }, 0.36);
    // libera nova navegação antes da mola terminar
    tl.call(function () { busy = false; }, null, 0.85);
  }
  function next() { goTo(idx + 1, 1); }
  function prev() { goTo(idx - 1, -1); }

  /* ---------------- formas de navegar ---------------- */
  $$("[data-hero-next]", hero).forEach(function (b) { b.addEventListener("click", next); });
  $$("[data-hero-prev]", hero).forEach(function (b) { b.addEventListener("click", prev); });
  nextBtn.addEventListener("click", next);

  picks.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pick]");
    if (!b) return;
    var i = +b.getAttribute("data-pick");
    if (animate) gsap.fromTo(b, { scale: 0.82 }, { scale: 1, duration: 0.9, ease: "elastic.out(1.2, .4)", overwrite: true });
    goTo(i, null, "pick");
  });
  dots.addEventListener("click", function (e) {
    var b = e.target.closest("[data-dot]");
    if (b) goTo(+b.getAttribute("data-dot"));
  });

  // teclado ← → (só com o topo visível e sem gaveta/modal aberto)
  var heroInView = true;
  new IntersectionObserver(function (en) { heroInView = en[0].isIntersecting; }, { threshold: 0.35 }).observe(hero);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (!heroInView || document.body.classList.contains("drawer-open")) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    e.preventDefault();
    if (e.key === "ArrowRight") next(); else prev();
  });

  // arrastar / swipe (mouse e dedo)
  var downX = null;
  stage.addEventListener("pointerdown", function (e) { downX = e.clientX; });
  window.addEventListener("pointerup", function (e) {
    if (downX === null) return;
    var dx = e.clientX - downX;
    downX = null;
    if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); }
  });
  window.addEventListener("pointercancel", function () { downX = null; });

  // tilt 3D + parallax (só mouse)
  if (animate && fine && !lite) {
    var rx = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3" });
    var ry = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3" });
    var wx = gsap.quickTo(wmPar, "x", { duration: 1.4, ease: "power3" });
    var wy = gsap.quickTo(wmPar, "y", { duration: 1.4, ease: "power3" });
    var sx = gsap.quickTo(shadowPar, "x", { duration: 1.4, ease: "power3" });
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      ry(nx * 26); rx(-ny * 18);
      wx(-nx * 40); wy(-ny * 24);
      sx(-nx * 30);
    });
    hero.addEventListener("pointerleave", function () { rx(0); ry(0); wx(0); wy(0); sx(0); });
  }

  /* ---------------- botão principal: produto voa até o WhatsApp ---------------- */
  function openWA(url) {
    var w = window.open(url, "_blank");
    if (w) { try { w.opener = null; } catch (err) { /* ignore */ } } else { window.location.href = url; }
  }
  buy.addEventListener("click", function (e) {
    e.preventDefault();
    var url = buy.href;
    var img = $(".hx-item img", holder);
    var fab = document.querySelector(".fab-wa");
    if (!animate || !img || !fab) { openWA(url); return; }
    var r = img.getBoundingClientRect();
    var t = fab.getBoundingClientRect();
    var clone = img.cloneNode(true);
    clone.removeAttribute("data-pid");
    Object.assign(clone.style, {
      position: "fixed", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px",
      margin: 0, zIndex: 300, pointerEvents: "none", objectFit: "contain", transform: "none",
    });
    document.body.appendChild(clone);
    var dx = t.left + t.width / 2 - (r.left + r.width / 2);
    var dy = t.top + t.height / 2 - (r.top + r.height / 2);
    gsap.timeline({
      onComplete: function () {
        clone.remove();
        var icon = fab.firstElementChild || fab;
        gsap.fromTo(icon, { scale: 1.6 }, { scale: 1, duration: 0.9, ease: "elastic.out(1.2, .4)", clearProps: "transform" });
        openWA(url);
      },
    })
      .to(clone, { x: dx, duration: 0.9, ease: "power1.inOut" }, 0)
      .to(clone, { y: dy, duration: 0.9, ease: "back.in(1.4)" }, 0)
      .to(clone, { scale: 0.06, rotation: 300, duration: 0.9, ease: "power2.in" }, 0);
  });

  /* ---------------- estado inicial ---------------- */
  renderPicks();
  holder.appendChild(makeItem(0));
  setTexts(0);
  setColors(PRODUCTS[0], false);
  // esconde o que a abertura vai revelar (evita "piscar" antes da intro)
  if (animate) {
    gsap.set($(".hx-item", holder), { opacity: 0 });
    gsap.set([wm, shadow, kicker, buy, tagline, dots, nextIn].concat($$(".hx-arrow", hero), [$(".hx-count")], $$(".hx-mini", hero)), { opacity: 0 });
    gsap.set(maskInners(true), { yPercent: 110 });
    gsap.set($$(".hx-pick", picks), { scale: 0 });
  }

  /* ---------------- abertura (chamada pelo main.js ao fim do preloader) ---------------- */
  var introDone = false;
  function intro() {
    if (introDone) return;
    introDone = true;
    if (!animate) return;
    var item = $(".hx-item", holder);
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hx-intro-h", { y: -30, opacity: 0, duration: 0.8, stagger: 0.08, clearProps: "transform,opacity" }, 0)
      .fromTo(item, { y: 160, scale: 0.4, rotation: -40, opacity: 0 }, { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 1.6, ease: "elastic.out(1, .6)" }, 0.15)
      .fromTo(shadow, { scaleX: 0.2, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 1.2, ease: "elastic.out(1, .55)" }, 0.45)
      .fromTo(wm, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.4 }, 0.4)
      .fromTo($$(".inner", title), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.08 }, 0.55)
      .fromTo([kicker].concat($$(".hx-arrow", hero), [$(".hx-count")]), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, clearProps: "transform" }, 0.65)
      .fromTo([cur, desc], { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "power4.out", stagger: 0.06 }, 0.75)
      .fromTo(buy, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, clearProps: "transform" }, 0.85)
      .fromTo([price, old], { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.08 }, 0.8)
      .fromTo(optlabel, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "power4.out" }, 0.9)
      .fromTo($$(".hx-pick", picks), { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.07 }, 0.95)
      .fromTo(nextIn, { x: 160, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, ease: "elastic.out(1, .7)" }, 1.1)
      .fromTo([tagline, dots].concat($$(".hx-mini", hero)), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, 1.2);
  }

  // rede de segurança: se o preloader/main.js falhar, a abertura roda sozinha
  setTimeout(intro, 3500);

  window.SLFHero = {
    intro: intro,
    goTo: goTo,
    category: function () { return PRODUCTS[idx].category; },
    goToCategory: function (cat) {
      if (PRODUCTS[idx].category === cat) return;
      for (var j = 0; j < PRODUCTS.length; j++) if (PRODUCTS[j].category === cat) { goTo(j); return; }
    },
  };
})();
