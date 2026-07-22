/*!
 * AI Seller — motore chatbot venditore · © 2026 Blackstar Digital Studio (blackstardigitalstudio.com)
 * ALL RIGHTS RESERVED — Proprietary. No copy/reuse/redistribution without written permission.
 * origin-sig: BDS·AISELLER·b4a1c7-st4r·2026 · copie non autorizzate sono tracciabili · Made in Italy 🇮🇹
 * Motore intelligente a regole (neuromarketing) + hook opzionale Claude API.
 */
(function () {
  "use strict";
  try { window.__AISELLER_ENGINE_SIG__ = "BDS-AISELLER-b4a1c7st4r-2026-blackstardigitalstudio"; } catch (e) {}
  const D = window.KF_DATA, CFG = window.KF_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => n.toFixed(2).replace(".", ",") + " €";
  // anchoring: mostra prezzo precedente sbarrato + risparmio sulle offerte
  function priceHTML(p) {
    if (p.compareAt && p.compareAt > p.price) {
      const save = t("save", LANG).replace("{v}", money(p.compareAt - p.price));
      return `<span class="price-was">${money(p.compareAt)}</span><span class="card-price-now">${money(p.price)}</span><span class="price-save">${save}</span>`;
    }
    return `<span class="card-price-now">${money(p.price)}</span>`;
  }
  const t = (key, lang) => (D.ui[key] && D.ui[key][lang]) || (D.ui[key] && D.ui[key].es) || key;
  // rating stabile per prodotto (deterministico dall'id) — prova sociale
  function prodRating(p) {
    const stars = Math.round((4.2 + ((p.id * 7) % 9) / 10) * 10) / 10; // 4.2..5.0
    const count = 24 + (p.id * 53) % 420;
    const sold = 3 + (p.id * 17) % 28;
    return { stars, count, sold };
  }
  function starsHTML(stars) {
    const full = Math.round(stars);
    let s = "";
    for (let i = 0; i < 5; i++) s += `<span class="${i < full ? "on" : ""}">★</span>`;
    return `<span class="stars">${s}</span>`;
  }

  let LANG = "es";
  const state = {
    cart: [],                 // {id, qty}
    lista: [],                // mini-lista cross-sell (modalità lead con D.crossSell): {name, category}
    suggestCount: 0,          // quante proposte di abbinamento già fatte (per non insistere)
    noMorePush: false,        // l'utente ha detto "no grazie" → niente più proposte automatiche
    profile: {},              // experience, motive, category, budget
    step: 0,                  // profiling step
    flow: "idle",            // idle | profiling | recommend | free
    chatOpen: false,
    minimized: false,
    badge: 0,
    engaged: false,          // l'utente ha interagito almeno una volta in chat
    discount: 0              // sconto pack applicato al carrello
  };

  /* =========================================================
     1. LINGUA
     ========================================================= */
  function detectLang() {
    // legge la lingua del browser/OS (lista ordinata di preferenze) e sceglie il locale disponibile
    const supported = ["es", "en", "it"];
    const prefs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || "en"];
    for (const l of prefs) {
      const code = String(l || "").slice(0, 2).toLowerCase();
      if (supported.includes(code)) return code;
    }
    return "en"; // lingua non ancora tradotta → default internazionale (pronto per i locale-pack/traduzione runtime)
  }

  // Rileva la lingua dal testo digitato dall'utente e aggiorna LANG se abbastanza sicuro.
  // Usato all'inizio di handleUser() per rispondere nella lingua che il cliente sta scrivendo.
  function sniffLang(text) {
    const w = text.toLowerCase();
    const scores = { it: 0, es: 0, en: 0 };
    // parole funzione / stopword ad alta frequenza per ciascuna lingua
    const signs = {
      it: /\b(ciao|salve|buongiorno|buonasera|grazie|prego|vorrei|voglio|ho bisogno|quanto|dove|quando|che|cosa|come|perché|sì|però|anche|non|con|per|del|della|degli|delle|hai|avete|siete|sono|posso|puoi|mi|ti|ci|vi|lo|la|le|li)\b/g,
      es: /\b(hola|buenos|buenas|gracias|por favor|quiero|quisiera|necesito|cuánto|dónde|cuándo|qué|cómo|por qué|sí|también|pero|con|para|del|de la|tienes|tenéis|sois|soy|puedo|puedes|me|te|nos|os|lo|la|las|los)\b/g,
      en: /\b(hi|hello|hey|good|morning|evening|thanks|thank you|please|want|need|how much|where|when|what|how|why|yes|also|but|with|for|the|have|are|you|can|i|my|we|it|is|do|not)\b/g
    };
    for (const [lang, re] of Object.entries(signs)) {
      const m = w.match(re);
      scores[lang] = m ? m.length : 0;
    }
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    // cambia lingua solo se almeno 2 segnali chiari (evita falsi positivi su frasi corte)
    if (best[1] >= 2 && best[0] !== LANG) setLang(best[0]);
  }

  let built = false;
  function setLang(lang) {
    LANG = lang;
    document.documentElement.lang = lang;
    $$(".lang-switch button, .age-lang button").forEach(b =>
      b.classList.toggle("active", b.dataset.lang === lang));
    paintStaticText();
    renderNav();
    renderCatTiles();
    renderReviews();
    if (!built) {
      // prima volta: costruisci griglie (con immagini)
      renderRows();
      renderShop();
      built = true;
    } else {
      // cambio lingua: aggiorna solo i TESTI, niente ricostruzione (no flash delle foto)
      renderFilters();
      relabelCards();
    }
    renderCart();
    // se la chat è aperta, ri-renderizza le quick-reply attive nella nuova lingua
    if (state.chatOpen) {
      if (state.flow === "profiling") { const q = D.profiling[state.step]; if (q) renderProfilingQuick(q); }
      else if (state.flow === "free") offerFreeQuick();
    }
  }
  function paintStaticText() {
    $("#ageTitle").textContent = t("ageGateTitle", LANG);
    $("#ageMsg").textContent = t("ageGateMsg", LANG);
    $("#ageYes").textContent = t("ageYes", LANG);
    $("#ageNo").textContent = t("ageNo", LANG);
    $("#ageDenied").textContent = t("ageDenied", LANG);
    $("#shopLead").textContent = t("shopLead", LANG);
    const trust = (D.ui.trust && (D.ui.trust[LANG] || D.ui.trust.es)) || [];
    $("#heroTrust").innerHTML = trust.map(x => `<span>${x}</span>`).join("");
    // --- nuovo layout stile sito reale ---
    const S = D.site, sv = k => (S[k] && (S[k][LANG] || S[k].es)) || S[k];
    const set = (id, v) => { const el = $(id); if (el != null && v != null) el.textContent = v; };
    set("#tbShip", sv("topShipping")); set("#tbHours", sv("topHours")); set("#tbPhone", S.topPhone);
    set("#tbLogin", sv("login")); set("#tbRegister", sv("register"));
    set("#brandScript", { es: "Tienda Online", en: "Online Store", it: "Negozio Online" }[LANG]);
    set("#heroEyebrow", sv("bannerKicker")); set("#heroScript", sv("bannerScript"));
    set("#heroSub", sv("bannerSub"));
    const hc = $("#heroCta"); if (hc) hc.textContent = sv("bannerCta");
    const hc2 = $("#heroCta2"); if (hc2) hc2.textContent = sv("bannerCta2");
    set("#catShopTitle", sv("catShop"));
    set("#secDestacados", sv("secDestacados")); set("#secNovedades", sv("secNovedades")); set("#secOfertas", sv("secOfertas"));
    set("#shopTitle", sv("allShop"));
    set("#footTienda", sv("footTienda")); set("#footLinks", sv("footLinks")); set("#footPay", sv("footPay"));
    set("#footAddr", S.footAddr); set("#footEmail", S.footEmail); set("#footHours", sv("footHours"));
    const fl = $("#footLinksList"); if (fl) { const list = (S.footLinksList[LANG] || S.footLinksList.es); fl.innerHTML = list.map(x => `<li>${x}</li>`).join(""); }
    const si = $("#searchInput"); if (si) si.placeholder = sv("searchPh");
    // --- marketing: fiducia, rating, recensioni ---
    const M = D.marketing;
    const trustEl = $("#trustStrip");
    if (trustEl) trustEl.innerHTML = (M.trust[LANG] || M.trust.es).map(x => `<span>${x}</span>`).join("");
    const hr = $("#heroRating");
    if (hr) hr.innerHTML = `${starsHTML(parseFloat(M.globalRating.value))}<b>${M.globalRating.value}</b><span class="hr-count">· ${M.globalRating.count} ${({ es: "reseñas", en: "reviews", it: "recensioni" })[LANG]}</span>`;
    set("#reviewsTitle", M.reviewsTitle[LANG] || M.reviewsTitle.es);
    set("#reviewsSub", M.reviewsSub[LANG] || M.reviewsSub.es);
    const NL = M.newsletter;
    set("#nlTitle", NL.title[LANG] || NL.title.es);
    set("#nlSub", NL.sub[LANG] || NL.sub.es);
    const nle = $("#nlEmail"); if (nle) nle.placeholder = NL.placeholder[LANG] || NL.placeholder.es;
    set("#nlCta", NL.cta[LANG] || NL.cta.es);
    set("#mbCta", t("checkout", LANG));
    $("#cartLabel").textContent = t("cart", LANG);
    $("#cartTitle").textContent = t("cart", LANG);
    $("#totalLabel").textContent = t("total", LANG);
    $("#checkoutBtn").textContent = t("checkout", LANG);
    $("#chatTitle").textContent = t("chatTitle", LANG);
    $("#chatOnline").textContent = t("online", LANG);
    $("#chatInput").placeholder = t("chatPlaceholder", LANG);
    $("#exitTitle").textContent = D.reengage.exitIntent.title[LANG];
    $("#exitBody").textContent = D.reengage.exitIntent.body[LANG];
    $("#exitCta").textContent = D.reengage.exitIntent.cta[LANG];
    $("#exitExpires").textContent = D.reengage.exitIntent.expires[LANG];
    const pt = $("#promoText"); if (pt) pt.textContent = t("promoText", LANG);
    const po = $("#promoOffer"); if (po) po.textContent = t("promoOffer", LANG);
    const pe = $("#promoEndsLabel"); if (pe) pe.textContent = t("promoEnds", LANG);
  }

  /* =========================================================
     2. AGE GATE 18+
     ========================================================= */
  function initAgeGate() {
    $$(".age-lang button").forEach(b => b.onclick = () => setLang(b.dataset.lang));
    $("#ageYes").onclick = () => {
      try { localStorage.setItem("kf_age", "1"); } catch (e) {}
      enterSite();
    };
    $("#ageNo").onclick = () => {
      $(".age-actions").style.display = "none";
      $("#ageDenied").hidden = false;
    };
    let ok = false;
    try { ok = localStorage.getItem("kf_age") === "1"; } catch (e) {}
    if (ok) enterSite();
  }
  function enterSite() {
    $("#ageGate").style.display = "none";
    $("#site").hidden = false;
    $("#chatLauncher").hidden = false;
    checkLazy(); // carica le foto già visibili ora che il sito è mostrato
    // re-engagement / social-proof / promo / compagno: SOLO la demo Kayaman (copy proprio).
    // Per i tenant (config caricata) restano spenti finché non avremo copy per-tenant.
    if (!KF_DATA._brand) {
      startReengage();
      startSocialProof();
      startPromoCountdown();
      setTimeout(() => { if (!state.chatOpen) companionSay(comp("welcome"), 7000); }, 2500);
    }
  }
  // barra promo: countdown di urgenza (si ferma a 00:00)
  let promoInt = null;
  function startPromoCountdown() {
    let secs = 15 * 60;
    const cd = $("#promoCd");
    if (!cd) return;
    const tick = () => {
      const m = String(Math.floor(secs / 60)).padStart(2, "0");
      const s = String(secs % 60).padStart(2, "0");
      cd.textContent = `${m}:${s}`;
      if (secs <= 0) { clearInterval(promoInt); return; }
      secs--;
    };
    tick();
    promoInt = setInterval(tick, 1000);
  }

  /* =========================================================
     3. NAV + SHOP
     ========================================================= */
  let activeCat = "all";
  let searchQuery = "";
  function doSearch(q) { searchQuery = (q || "").toLowerCase(); activeCat = "all"; renderShop(); scrollToShop(); }
  function categories() {
    return [...new Set(D.products.map(p => p.category))];
  }
  function catLabel(cat) { const m = D.catLabels && D.catLabels[cat]; return m ? (m[LANG] || m.es) : cat; }
  function closeNavbar() { const nb = document.querySelector(".navbar"); if (nb) nb.classList.remove("open"); }
  function renderNav() {
    const nav = $("#nav");
    nav.innerHTML = "";
    categories().forEach(cat => {
      const b = document.createElement("button");
      b.textContent = catLabel(cat);
      b.dataset.cat = cat;
      b.onclick = () => { searchQuery = ""; activeCat = cat; syncFilters(); renderShop(); closeNavbar(); scrollToShop(); };
      nav.appendChild(b);
    });
  }
  function renderCatTiles() {
    const wrap = $("#catTiles");
    if (!wrap) return;
    wrap.innerHTML = "";
    categories().forEach(cat => {
      const count = D.products.filter(p => p.category === cat).length;
      const el = document.createElement("div");
      el.className = "cat-tile";
      el.innerHTML = `<div class="ct-emoji">${emoji[cat] || "🌿"}</div><div class="ct-name">${catLabel(cat)}</div><div class="ct-count">${count}</div>`;
      el.onclick = () => { searchQuery = ""; activeCat = cat; syncFilters(); renderShop(); scrollToShop(); };
      wrap.appendChild(el);
    });
  }
  // righe prodotti stile sito reale (Destacados / Novedades / Ofertas)
  function renderRows() {
    const rows = {
      rowDestacados: D.products.filter(p => p.badge === "Bestseller"),
      rowNovedades: D.products.filter(p => p.badge === "Nuevo"),
      rowOfertas: D.products.filter(p => p.badge === "Oferta")
    };
    Object.entries(rows).forEach(([id, list]) => {
      const el = $("#" + id);
      if (!el) return;
      const pool = list.length ? list : D.products.slice(0, 4);
      el.innerHTML = pool.map(cardHTML).join("");
      wireAddButtons(el);
      lazyImages(el);
    });
  }
  function renderReviews() {
    const g = $("#reviewsGrid");
    if (!g) return;
    const M = D.marketing;
    g.innerHTML = M.testimonials.map(r => `<div class="review-card">
      ${starsHTML(r.stars)}
      <div class="rv-text">“${r[LANG] || r.es}”</div>
      <div class="rv-foot"><div class="rv-av">${r.name[0]}</div>
        <div><div class="rv-name">${r.name}</div><div class="rv-ver">✓ ${M.verified[LANG] || M.verified.es}</div></div>
      </div></div>`).join("");
  }
  // cambio lingua fluido: aggiorna solo i testi dei pulsanti nelle card già costruite
  function relabelCards() {
    $$("#grid [data-add],#rowDestacados [data-add],#rowNovedades [data-add],#rowOfertas [data-add]").forEach(b => {
      if (b.textContent.indexOf("✓") === -1) b.textContent = t("addToCart", LANG);
    });
  }
  function wireAddButtons(scope) {
    $$("[data-add]", scope).forEach(b => b.onclick = () => {
      addToCart(+b.dataset.add);
      b.textContent = t("added", LANG);
      setTimeout(() => b.textContent = t("addToCart", LANG), 1200);
    });
  }
  function renderFilters() {
    const f = $("#filters");
    f.innerHTML = "";
    const cats = ["all", ...categories()];
    cats.forEach(cat => {
      const b = document.createElement("button");
      b.textContent = cat === "all" ? t("all", LANG) : catLabel(cat);
      b.dataset.cat = cat;
      b.classList.toggle("active", cat === activeCat && !searchQuery);
      b.onclick = () => { searchQuery = ""; activeCat = cat; syncFilters(); renderShop(); };
      f.appendChild(b);
    });
  }
  function syncFilters() {
    $$("#filters button").forEach(b => b.classList.toggle("active", b.dataset.cat === activeCat && !searchQuery));
    $$("#nav button").forEach(b => b.classList.toggle("active", b.dataset.cat === activeCat && !searchQuery));
  }
  const emoji = { Cartine: "🧻", Grinder: "⚙️", Accendini: "🔥", Vaporizzatori: "💨", CBD: "🌿", Edibles: "🍭", Accessori: "🎁", Bong: "🫧" };
  // lazy-load foto prodotto: carica solo quelle vicine alla viewport (su scroll/resize)
  function checkLazy() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    $$(".card-img[data-bg]").forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.bottom > -300 && r.top < vh + 300) {
        e.style.backgroundImage = `url('${e.dataset.bg}')`;
        e.removeAttribute("data-bg");
      }
    });
  }
  function lazyImages() { checkLazy(); }
  let lazyThrottle = null;
  function onScrollLazy() {
    if (lazyThrottle) return;
    lazyThrottle = setTimeout(() => { lazyThrottle = null; checkLazy(); }, 120);
  }
  function cardHTML(p) {
    const img = safeImg(p.imageUrl) ? `data-bg="${safeImg(p.imageUrl)}"` : "";
    const ph = p.imageUrl ? "" : (emoji[p.category] || "🌿");
    const badge = p.badge ? `<span class="card-badge badge-${esc(String(p.badge).replace(/[^a-zA-Z0-9]/g, ""))}">${esc(p.badge)}</span>` : "";
    const low = p.stock <= 6 ? `<span class="card-stock">${t("onlyLeft", LANG).replace("{n}", p.stock)}</span>` : "";
    const rt = prodRating(p);
    const rating = `<div class="card-rating">${starsHTML(rt.stars)}<b>${rt.stars.toFixed(1)}</b><span class="rev">(${rt.count})</span></div>`;
    const urgency = (p.badge === "Bestseller" || p.badge === "Oferta")
      ? `<div class="card-urgency">🔥 ${rt.sold} ${D.marketing.soldToday[LANG] || D.marketing.soldToday.es}</div>` : "";
    return `<div class="card">
      <div class="card-img" ${img}>${ph}${badge}${low}</div>
      <div class="card-body">
        <span class="card-cat">${esc(catLabel(p.category))}</span>
        <div class="card-name">${esc(p.name)}</div>
        ${rating}
        <div class="card-desc">${esc(p.description)}</div>
        ${urgency}
        <div class="card-foot">
          <span class="card-price">${priceHTML(p)}</span>
          <button class="btn btn-primary" data-add="${p.id}">${t("addToCart", LANG)}</button>
        </div>
      </div>
    </div>`;
  }
  function renderShop() {
    renderFilters();
    const grid = $("#grid");
    let list = activeCat === "all" ? D.products.slice() : D.products.filter(p => p.category === activeCat);
    if (searchQuery) list = D.products.filter(p => (p.name + " " + catLabel(p.category) + " " + p.description).toLowerCase().includes(searchQuery));
    grid.innerHTML = list.length ? list.map(cardHTML).join("")
      : `<p style="color:var(--muted);grid-column:1/-1">${({ es: "Sin resultados. Pregúntale a Kaya 👇", en: "No results. Ask Kaya 👇", it: "Nessun risultato. Chiedi a Kaya 👇" })[LANG]}</p>`;
    wireAddButtons(grid);
    lazyImages(grid);
  }
  function scrollToShop() { const m = $("#shopMain") || $(".shop"); if (m) m.scrollIntoView({ behavior: "smooth" }); }

  /* =========================================================
     4. CARRELLO
     ========================================================= */
  function addToCart(id, qty = 1, opts = {}) {
    const row = state.cart.find(r => r.id === id);
    if (row) row.qty += qty; else state.cart.push({ id, qty });
    renderCart();
    if (!opts.silent) { toast(t("added", LANG)); pingSound(); cartBump(); if (state.chatOpen) { sellerReact(); showThumb(); } onAdded(prod(id)); }
  }
  function cartBump() {
    const c = $("#cartCount");
    c.style.transition = "transform 220ms cubic-bezier(.34,1.56,.64,1)";
    c.style.transform = "scale(1.4)";
    setTimeout(() => c.style.transform = "scale(1)", 220);
  }
  function cartCount() { return state.cart.reduce((s, r) => s + r.qty, 0); }
  function cartSubtotal() { return state.cart.reduce((s, r) => s + r.qty * prod(r.id).price, 0); }
  function cartTotal() { return Math.max(0, cartSubtotal() - state.discount); }
  function prod(id) { return D.products.find(p => p.id === id); }
  function renderCart() {
    $("#cartCount").textContent = cartCount();
    if (!state.cart.length) state.discount = 0;
    const body = $("#cartItems");
    if (!state.cart.length) {
      body.innerHTML = `<div class="cart-empty">${t("emptyCart", LANG)}</div>`;
    } else {
      const discRow = state.discount > 0
        ? `<div class="cart-row cart-disc"><div class="cr-info"><div class="cr-name">🎁 ${({ es: "Descuento pack", en: "Pack discount", it: "Sconto pack" })[LANG]}</div></div><div class="cr-disc">−${money(state.discount)}</div></div>`
        : "";
      body.innerHTML = shipBarHTML() + state.cart.map(r => {
        const p = prod(r.id);
        const bg = p.imageUrl ? `style="background-image:url('${p.imageUrl}')"` : "";
        const ph = p.imageUrl ? "" : (emoji[p.category] || "🌿");
        return `<div class="cart-row">
          <div class="cr-img" ${bg}>${ph}</div>
          <div class="cr-info">
            <div class="cr-name">${p.name}</div>
            <div>${money(p.price)}</div>
            <div class="cr-qty">
              <button data-dec="${p.id}">−</button><span>${r.qty}</span><button data-inc="${p.id}">+</button>
            </div>
          </div>
        </div>`;
      }).join("") + discRow;
      $$("#cartItems [data-inc]").forEach(b => b.onclick = () => { addToCart(+b.dataset.inc, 1, { silent: true }); });
      $$("#cartItems [data-dec]").forEach(b => b.onclick = () => decCart(+b.dataset.dec));
    }
    $("#cartTotal").textContent = money(cartTotal());
    updateMobileBar();
  }
  function updateMobileBar() {
    const bar = $("#mobileBar");
    if (!bar) return;
    const has = state.cart.length > 0;
    bar.hidden = !has;
    document.body.classList.toggle("has-bar", has);
    if (has) {
      $("#mbCount").textContent = cartCount();
      $("#mbTotal").textContent = money(cartTotal());
    }
  }
  function shipBarHTML() {
    const th = D.freeShipThreshold, tot = cartTotal();
    if (tot >= th) {
      return `<div class="ship-bar done">${t("shipDone", LANG)}<div class="sb-track"><div class="sb-fill" style="width:100%"></div></div></div>`;
    }
    const pct = Math.min(100, Math.round(tot / th * 100));
    const msg = t("shipRemaining", LANG).replace("{v}", money(th - tot));
    return `<div class="ship-bar">${msg}<div class="sb-track"><div class="sb-fill" style="width:${pct}%"></div></div></div>`;
  }
  function decCart(id) {
    const row = state.cart.find(r => r.id === id);
    if (!row) return;
    row.qty--;
    if (row.qty <= 0) state.cart = state.cart.filter(r => r.id !== id);
    renderCart();
  }
  function openCart() {
    $("#cartDrawer").hidden = false; $("#overlay").hidden = false; renderCart();
    if (state.cart.length && !state.chatOpen) companionSay(comp("cart"));
  }
  function closeCart() { $("#cartDrawer").hidden = true; $("#overlay").hidden = true; }

  /* =========================================================
     5. CHAT — UI
     ========================================================= */
  function openChat() {
    $("#chatPanel").hidden = false;
    $("#chatLauncher").hidden = true;
    state.chatOpen = true; state.minimized = false;
    clearTimeout(minTimer); // annulla il nudge da minimizzato
    clearBadge();
    hideSmokingElf();
    hidePointer();
    startSellerLife();
    if (!$("#chatBody").dataset.started) {
      $("#chatBody").dataset.started = "1";
      startConversation();
    }
    $("#chatInput").focus();
  }
  function minimizeChat() {
    $("#chatPanel").hidden = true;
    $("#chatLauncher").hidden = false;
    state.chatOpen = false; state.minimized = true;
    stopSellerLife();
    showSmokingElf();          // resta nell'angolo a fumare
    scheduleMinimizedNudge();
  }
  /* ====== STRATO UMANO: calore, empatia e variazione — così il venditore non suona come un'IA ====== */
  function pickOne(a) { return a[Math.floor(Math.random() * a.length)]; }
  const HUMAN = {
    ack: {
      it: ["Ottima scelta 😊", "Perfetto, ci siamo capiti 👍", "Mmm, mi piace 😏", "Ottimo 🙌", "Ah, bella questa!", "Capito al volo 😉", "Ci sto già pensando…"],
      es: ["Buena elección 😊", "Perfecto, te entiendo 👍", "Mmm, me gusta 😏", "¡Genial! 🙌", "¡Ah, qué buena!", "Lo pillo 😉", "Ya lo estoy pensando…"],
      en: ["Great choice 😊", "Perfect, gotcha 👍", "Mmm, I like it 😏", "Awesome 🙌", "Ah, nice one!", "Got it 😉", "Already on it…"]
    }
  };
  // reazioni su misura: empatia legata a COSA ha scelto l'utente (più umane di un generico "ok")
  const REACT = {
    it: {
      budget: { low: "Tranquillo, anche senza spendere tanto si trova roba che vale 👌", mid: "Scelta sensata: qualità giusta al prezzo giusto 👍", high: "Mi piaci, qui puntiamo al top 😏", any: "Allora apriamo bene gli occhi, ti mostro il meglio 👀" },
      motive: { gift: "Che pensiero carino 🎁 Ti aiuto a fare proprio bella figura.", self: "E fai bene a coccolarti un po' 😊", unsure: "Nessun problema, ci arriviamo insieme 🙂" },
      experience: { beginner: "Tranquillo, ti prendo per mano io — nessuna domanda è stupida 🤝", intermediate: "Ottimo, allora ci capiamo al volo 👍", expert: "Ah, uno che se ne intende! Mi piace 🙌", cbd: "Bella curiosità, è un mondo che merita 🌿" }
    },
    es: {
      budget: { low: "Tranquilo, sin gastar mucho también hay cosas que valen 👌", mid: "Buena: calidad justa al precio justo 👍", high: "Me gustas, aquí vamos a por lo top 😏", any: "Pues abrimos bien los ojos, te enseño lo mejor 👀" },
      motive: { gift: "Qué bonito detalle 🎁 Te ayudo a quedar de lujo.", self: "Y haces bien en darte un capricho 😊", unsure: "Sin problema, llegamos juntos 🙂" },
      experience: { beginner: "Tranquilo, te llevo de la mano — no hay pregunta tonta 🤝", intermediate: "Genial, así nos entendemos al vuelo 👍", expert: "¡Ah, alguien que sabe! Me gusta 🙌", cbd: "Buena curiosidad, es un mundo que merece 🌿" }
    },
    en: {
      budget: { low: "No worries — you can get real quality without spending much 👌", mid: "Smart: right quality for the right price 👍", high: "I like you — let's go for the top 😏", any: "Eyes wide open then, I'll show you the best 👀" },
      motive: { gift: "What a lovely thought 🎁 I'll help you nail it.", self: "And good on you for treating yourself 😊", unsure: "No problem, we'll get there together 🙂" },
      experience: { beginner: "Relax, I've got you — no silly questions 🤝", intermediate: "Great, we'll click right away 👍", expert: "Ah, someone who knows! I like it 🙌", cbd: "Nice curiosity, it's a world worth exploring 🌿" }
    }
  };
  // breve reazione "ti ho ascoltato" prima di proseguire — su misura se possibile, altrimenti calda e variata (non sempre, per sembrare naturale)
  async function humanAck(intent, val) {
    const R = REACT[LANG] || REACT.it;
    const line = R[intent] && R[intent][val];
    if (line) { await botMsg(line, 380); return; }
    const pool = (KF_DATA.acks && (KF_DATA.acks[LANG] || KF_DATA.acks.it)) || HUMAN.ack[LANG] || HUMAN.ack.it;   // tono di settore se il tenant lo fornisce
    if (Math.random() < 0.6) await botMsg(pickOne(pool), 320);
  }

  // ====== NOME DEL CLIENTE: chiederlo e usarlo crea vicinanza ("Allora Marco, …") ======
  function nm() { return (state.profile && state.profile.name) || ""; }
  function lc(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function parseName(s) {
    s = (s || "").trim().replace(/[.!?¿¡]+$/g, "");
    s = s.replace(/^(mi chiamo|sono|il mio nome (?:è|e)|me llamo|soy|mi nombre es|my name is|i'?m|i am|call me)\s+/i, "");
    const w = (s.split(/[\s,;]+/)[0] || "");
    if (!w || w.length < 2 || w.length > 20 || /[0-9@/\\]/.test(w)) return "";
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }
  function nameQ() { return KF_DATA.nameQ || { it: "Prima di partire… come ti chiami? 😊", es: "Antes de empezar… ¿cómo te llamas? 😊", en: "Before we start… what's your name? 😊" }; }
  function nameSkip() { return { it: "Preferisco non dirlo", es: "Prefiero no decirlo", en: "Rather not say" }; }
  async function askNameStep() {
    state.flow = "askName";
    await botMsg(nameQ()[LANG], 500);
    quickReplies([{ label: nameSkip()[LANG], onClick: () => { userMsg(nameSkip()[LANG]); clearQuick(); proceedAfterName(true); } }]);
  }
  // parole di 1 sola parola che NON sono nomi (intenti) → non vanno prese come nome
  const NOTNAME = ["aiuto", "help", "ayuda", "info", "grazie", "gracias", "thanks", "thank", "prezzo", "precio", "price", "costo", "cost", "ok", "okay", "boh", "mah", "problema", "problem", "auto", "macchina", "moto", "coche", "car", "no", "yes", "si", "sí", "hola", "ciao", "salve", "subito", "urgente", "preventivo"];
  // distingue un NOME da un MESSAGGIO: se è un nome lo cattura e prosegue (ritorna true); se è un messaggio ritorna false (bypass)
  async function captureName(text) {
    const t = (text || "").trim(), low = t.toLowerCase();
    const explicit = /^(mi\s+chiamo|il\s+mio\s+nome|me\s+llamo|mi\s+nombre|my\s+name\s+is|call\s+me|sono\s+[a-zàèéìòù'-]+$|soy\s+[a-záéíóú'-]+$|i'?m\s+[a-z'-]+$)/i.test(t);
    const oneWord = t.split(/\s+/).filter(Boolean).length === 1;
    const candidate = parseName(t);
    const looksLikeName = candidate && !/[?¿0-9]/.test(t)
      && (typeof isProblem !== "function" || !isProblem(low))
      && (typeof matchService !== "function" || !matchService(low))
      && (explicit || (oneWord && NOTNAME.indexOf(low) < 0));
    if (looksLikeName) {
      state.profile.name = candidate;
      memSetName(candidate);   // ricorda il nome per le prossime visite
      clearQuick();
      await proceedAfterName(false);
      return true;     // era il nome → gestito
    }
    return false;      // è un messaggio (problema/domanda) → l'utente bypassa il nome
  }
  async function proceedAfterName(skipped) {
    const n = nm();
    if (n) {
      await botMsg(pickOne({
        it: [`Piacere, ${n}! 😊`, `Che piacere, ${n} 🙌`, `Ciao ${n}! 😊`],
        es: [`¡Encantado, ${n}! 😊`, `¡Qué bien, ${n}! 🙌`, `¡Hola ${n}! 😊`],
        en: [`Nice to meet you, ${n}! 😊`, `Lovely, ${n} 🙌`, `Hi ${n}! 😊`]
      }[LANG]), 360);
    } else if (skipped) {
      await botMsg({ it: "Tranquillo, nessun problema 🙂", es: "Tranquilo, sin problema 🙂", en: "No worries at all 🙂" }[LANG], 300);
    }
    askProfilingStep();
  }

  /* =========================================================
     MEMORIA CLIENTE (localStorage, first-party, NIENTE invii esterni)
     Ricorda nome, lingua, prodotti scelti/ordinati e visite, così alla
     visita dopo saluta per nome e personalizza i consigli (neuromarketing).
     Disattivabile col flag config remember:false. Resettabile da "Non sono io".
     ========================================================= */
  var MEM = (function () {
    function key() {
      var b = KF_DATA._brand || KF_DATA.tenant || location.hostname || "aiseller";
      return "aiseller_mem_" + String(b).toLowerCase().replace(/[^a-z0-9]+/g, "_");
    }
    function load() { try { return JSON.parse(localStorage.getItem(key()) || "null") || {}; } catch (e) { return {}; } }
    function save(m) { try { localStorage.setItem(key(), JSON.stringify(m)); } catch (e) {} }
    return { get: load, save: save, clear: function () { try { localStorage.removeItem(key()); } catch (e) {} } };
  })();
  function memOn() { return KF_DATA.remember !== false; }
  function memSetName(n) { if (!memOn() || !n) return; var m = MEM.get(); m.name = n; m.lang = LANG; MEM.save(m); }
  function memTouchVisit() {
    if (!memOn()) return;
    var m = MEM.get(), now = Date.now();
    m.visits = (m.visits || 0) + 1; if (!m.firstSeen) m.firstSeen = now; m.lastSeen = now; m.lang = LANG;
    MEM.save(m);
  }
  // registra l'interesse (aggiunta alla lista) e, se ordered, l'ordine vero e proprio: segnale più forte
  function memRecordItem(p, ordered) {
    if (!memOn() || !p || !p.name) return;
    var m = MEM.get(); m.items = m.items || {};
    var it = m.items[p.name] || { name: p.name, cat: p.category || "", added: 0, ordered: 0 };
    it.added++; if (ordered) it.ordered++; it.last = Date.now();
    m.items[p.name] = it; MEM.save(m);
  }
  // prodotto preferito = più ordinato/aggiunto (l'ordine pesa doppio)
  function memTopProduct() {
    var m = MEM.get(), items = m.items || {}, best = null, score = -1;
    Object.keys(items).forEach(function (k) {
      var it = items[k], s = (it.ordered || 0) * 2 + (it.added || 0);
      if (s > score) { score = s; best = it; }
    });
    return best;   // {name, cat, added, ordered} oppure null
  }
  // saluto al cliente che TORNA: per nome + aggancio allo storico (rifare o novità) + "non sono io" (privacy/reset)
  async function welcomeBack(mem) {
    var n = nm();
    await botMsg(pickOne({
      it: ["Bentornato, " + n + "! 😊", "Ciao " + n + ", di nuovo qui 🙌", "Che bello rivederti, " + n + "! 😊"],
      es: ["¡Bienvenido de nuevo, " + n + "! 😊", "¡Hola " + n + ", por aquí otra vez! 🙌", "¡Qué bien verte, " + n + "! 😊"],
      en: ["Welcome back, " + n + "! 😊", "Hi " + n + ", good to see you again 🙌", "Great to see you again, " + n + "! 😊"]
    }[LANG]), 420);
    var fav = memTopProduct();
    var favProd = fav ? (D.products || []).find(function (x) { return x.name === fav.name; }) : null;
    var notMe = { it: "Non sono " + n, es: "No soy " + n, en: "Not " + n }[LANG];
    if (favProd) {
      await botMsg({
        it: "L'ultima volta avevi scelto " + favProd.name + ". Vuoi rifare, o ti propongo qualcosa di nuovo?",
        es: "La última vez elegiste " + favProd.name + ". ¿Repetimos o te propongo algo nuevo?",
        en: "Last time you chose " + favProd.name + ". Repeat, or want something new?"
      }[LANG], 650);
      var repeat = { it: "Rifaccio: " + favProd.name, es: "Repito: " + favProd.name, en: "Repeat: " + favProd.name }[LANG];
      var fresh = { it: "Qualcosa di nuovo", es: "Algo nuevo", en: "Something new" }[LANG];
      quickReplies([
        { label: repeat, onClick: async () => { clearQuick(); userMsg(repeat); state.profile.category = favProd.category; if (hasCrossSell()) await addToLista(favProd); else recommend(); } },
        { label: fresh, onClick: async () => { clearQuick(); userMsg(fresh); askProfilingStep(); } },
        { label: notMe, onClick: () => { clearQuick(); userMsg(notMe); forgetMe(); } }
      ]);
    } else {
      var go = { it: "Iniziamo", es: "Empezamos", en: "Let's start" }[LANG];
      await botMsg({ it: "Ripartiamo? Dimmi pure cosa cerchi 😊", es: "¿Seguimos? Dime qué buscas 😊", en: "Shall we continue? Tell me what you're after 😊" }[LANG], 500);
      quickReplies([
        { label: go, onClick: async () => { clearQuick(); userMsg(go); askProfilingStep(); } },
        { label: notMe, onClick: () => { clearQuick(); userMsg(notMe); forgetMe(); } }
      ]);
    }
  }
  // "Non sono io" → cancella la memoria locale e riparte pulito (diritto all'oblio, tutto lato cliente)
  function forgetMe() {
    MEM.clear();
    state.profile = {}; state.lista = []; updateCartBar();
    (async function () {
      await botMsg({ it: "Fatto, ho azzerato tutto 🧽 Ricominciamo!", es: "Listo, lo he borrado todo 🧽 ¡Empezamos de nuevo!", en: "Done, I've cleared everything 🧽 Let's start fresh!" }[LANG], 400);
      if (KF_DATA.askName !== false) askNameStep(); else askProfilingStep();
    })();
  }

  function botMsg(text, delay = 600) {
    return new Promise(res => {
      const typing = addTyping();
      setTimeout(() => {
        typing.remove();
        const el = document.createElement("div");
        el.className = "msg bot";
        el.textContent = text;
        $("#chatBody").appendChild(el);
        scrollChat();
        sellerTalk();   // Kaya si muove quando parla
        res();
      }, delay);
    });
  }
  function userMsg(text) {
    const panel = $("#chatPanel");
    if (panel && panel.classList.contains("pointing")) hidePointer();   // azione utente → fine puntamento, riprende lo scroll normale
    const el = document.createElement("div");
    el.className = "msg user";
    el.textContent = text;
    $("#chatBody").appendChild(el);
    scrollChat();
  }
  function addTyping() {
    const el = document.createElement("div");
    el.className = "msg bot typing";
    el.innerHTML = "<i></i><i></i><i></i>";
    $("#chatBody").appendChild(el);
    scrollChat();
    return el;
  }
  // SICUREZZA (anti-XSS): escape dei testi da config (nomi/badge prodotto, ecc.) + validazione URL immagine
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function safeImg(u) { u = String(u == null ? "" : u); return (/^https?:\/\//i.test(u) || /^data:image\//i.test(u)) && !/["'<>\s]/.test(u) ? u : ""; }
  function productCard(p, isPick) {
    const lead = isLead();
    const el = document.createElement("div");
    el.className = "msg-product" + (isPick ? " kaya-pick" : "");
    if (isPick) el.setAttribute("data-pick", (D.seller && D.seller.pick && (D.seller.pick[LANG] || D.seller.pick.es)) || "👉");
    const safeBg = safeImg(p.imageUrl);
    const bg = safeBg ? `style="background-image:url('${safeBg}')"` : "";
    const ph = p.imageUrl ? "" : (emoji[p.category] || KF_DATA.itemEmoji || (lead ? "🔧" : "🌿"));
    const rt = prodRating(p);
    const priceOrBadge = lead ? `<div class="mp-badge">${esc(p.badge || "")}</div>` : `<div class="mp-price">${money(p.price)}</div>`;
    const linkLabel = p.linkLabel && (p.linkLabel[LANG] || p.linkLabel.it);
    const btnLabel = !lead ? t("addToCart", LANG)
      : linkLabel ? linkLabel
      : p.link ? (LANG === "es" ? "Saber más →" : LANG === "en" ? "Learn more →" : "Scopri di più →")
      : hasCrossSell() ? ((D.ctaAdd && (D.ctaAdd[LANG] || D.ctaAdd.it)) || (LANG === "es" ? "➕ Añadir" : LANG === "en" ? "➕ Add" : "➕ Aggiungi"))
      : ((KF_DATA.lead && KF_DATA.lead.cta && (KF_DATA.lead.cta[LANG] || KF_DATA.lead.cta.it)) || "Prenota");
    el.innerHTML = `<div class="mp-img" ${bg}>${ph}</div>
      <div class="mp-info"><div class="mp-name">${esc(p.name)}</div>
      <div class="mp-rating">${starsHTML(rt.stars)}<span class="rev">${rt.stars.toFixed(1)} (${rt.count})</span></div>
      ${priceOrBadge}</div>
      <button class="mp-add">${esc(btnLabel)}</button>`;
    el.querySelector(".mp-add").onclick = (e) => {
      e.stopPropagation();
      if (lead) {
        if (p.link) { openLink(p.link, p.name); return; }
        if (hasCrossSell()) { addToLista(p); return; }
        openBooking(p.name); return;
      }
      addToCart(p.id);
      const btn = el.querySelector(".mp-add");
      btn.textContent = t("added", LANG);
      setTimeout(() => btn.textContent = t("addToCart", LANG), 1200);
    };
    // premere la card (anche il prezzo) → la porta in vista e termina il puntamento
    el.addEventListener("click", () => {
      const panel = $("#chatPanel");
      if (panel && panel.classList.contains("pointing")) hidePointer();
      el.scrollIntoView({ block: "center" });   // istantaneo: smooth/rAF non girano in tab background
    });
    $("#chatBody").appendChild(el);
    scrollChat();
    return el;
  }
  // posa "che punta" sopra il box durante un consiglio
  let pointerTimer = null;
  let pointStart = 0;   // istante in cui parte il puntamento (per proteggere la nuvoletta dallo scroll)
  function showPointer(target, advice) {
    pointStart = performance.now();
    const panel = $("#chatPanel");
    if (!panel || !state.chatOpen) return;
    const pt = $(".chat-pointer"), cb = $("#chatBody");
    // scegli il prodotto da puntare PRIMA di mostrare la figura
    $$(".kaya-target").forEach(e => e.classList.remove("kaya-target"));
    const picks = $$(".kaya-pick");
    const pick = target || picks[picks.length - 1];
    panel.classList.add("pointing");                 // nasconde il reclinato
    if (cb) cb.classList.add("rig-pointing");        // spazio scroll per allineare la card al dito
    if (pick) pick.classList.add("kaya-target");
    if (pt) {                                        // SI METTE IN PIEDI e punta (desktop + mobile)
      pt.classList.remove("thumbs", "cheer");
      // a regola d'arte: i PIEDI poggiano appena SOPRA il footer (tasti + input) — calcolato dalle coordinate REALI (robusto su mobile/dvh)
      const panelRect = panel.getBoundingClientRect();
      const qEl = $("#chatQuick"), inEl = $(".chat-input"), cartEl = $("#chatCart");
      let footerTop = panelRect.bottom;   // i piedi poggiano sopra l'elemento più ALTO del footer (carrello/tasti/input)
      [cartEl, (qEl && qEl.offsetHeight > 0) ? qEl : null, inEl].forEach(function (el) {
        if (el && !el.hidden && el.offsetHeight > 0) { const t = el.getBoundingClientRect().top; if (t < footerTop) footerTop = t; }
      });
      pt.style.bottom = Math.max(2, Math.round(panelRect.bottom - footerTop + 4)) + "px";
      pt.hidden = false; void pt.offsetWidth; pt.classList.add("show");
      setTimeout(() => pt.classList.add("jab"), 600);  // dopo l'entrata, inizia a battere il dito
    }
    if (pick) {
      alignPointerToCard(pick);                        // SUBITO (sincrono): niente "salto" del padding
      setTimeout(() => alignPointerToCard(pick), 560); // raffina dopo l'entrata della figura
    }
    if (advice) setTimeout(() => showAdviceBubble(advice), 620);   // la NUVOLETTA parla appena è in piedi
    clearTimeout(pointerTimer);
    pointerTimer = setTimeout(hidePointer, 10000);   // resta in piedi a indicare ~10s
  }
  // NUVOLETTA del personaggio: appare sopra la sua testa e "parla" mentre indica
  function showAdviceBubble(text) {
    const bub = $(".pointer-bubble"), pt = $(".chat-pointer"), panel = $("#chatPanel");
    if (!bub || !pt || pt.hidden) return;
    bub.textContent = text;
    bub.hidden = false; void bub.offsetWidth;
    const pr = pt.getBoundingClientRect(), pan = panel.getBoundingClientRect();
    // ancorata appena sopra la testa del personaggio, estesa verso destra (no clip a sinistra)
    const left = Math.max(8, Math.round(pr.left - pan.left + pr.width * 0.34));
    const bottom = Math.round(pan.bottom - pr.top + 8);
    bub.style.left = left + "px";
    bub.style.bottom = bottom + "px";
    bub.style.right = "auto";
    bub.classList.add("show");
  }
  function hideAdviceBubble() {
    const bub = $(".pointer-bubble");
    if (bub) { bub.classList.remove("show"); setTimeout(() => { bub.hidden = true; }, 280); }
  }
  // scrolla la chat finché il centro della card è all'altezza del dito della figura in piedi
  function alignPointerToCard(card) {
    const pt = $(".chat-pointer"), body = $("#chatBody");
    if (!pt || !body || !card || pt.hidden) return;
    const FINGER = (KF_DATA.character && KF_DATA.character.finger) || 0.27;   // frazione del dito (configurabile per mascotte custom)
    const pr = pt.getBoundingClientRect();
    const fingerY = pr.top + pr.height * FINGER;
    const cr = card.getBoundingClientRect();
    const cardCenter = cr.top + cr.height / 2;
    body.scrollBy({ top: cardCenter - fingerY });     // istantaneo: lo "smooth" veniva interrotto → non allineava
  }
  function hidePointer() {
    const panel = $("#chatPanel");
    if (panel) panel.classList.remove("pointing");
    const cb = $("#chatBody"); if (cb) cb.classList.remove("rig-pointing");
    hideAdviceBubble();
    const pt = $(".chat-pointer");
    if (pt) { pt.classList.remove("show", "jab", "thumbs", "cheer"); pt.style.bottom = ""; setTimeout(() => { pt.hidden = true; }, 420); }
    $$(".kaya-target").forEach(e => e.classList.remove("kaya-target"));
  }
  // reazione POLLICE-SU all'aggiunta al carrello (non durante il puntamento)
  function showThumb() {
    const pt = $(".chat-pointer"), panel = $("#chatPanel");
    if (!pt || !state.chatOpen) return;
    if (panel && panel.classList.contains("pointing")) return;   // non disturbare il braccio che punta
    clearTimeout(pointerTimer);
    pt.classList.remove("jab");
    pt.classList.add("thumbs");
    pt.hidden = false; void pt.offsetWidth;
    pt.classList.add("show", "cheer");
    setTimeout(() => pt.classList.remove("cheer"), 600);
    pointerTimer = setTimeout(() => {
      pt.classList.remove("show");
      setTimeout(() => { pt.hidden = true; pt.classList.remove("thumbs"); }, 420);
    }, 1700);
  }
  // reazione fisica del venditore (saltello)
  function sellerReact() {
    const s = $(".chat-seller");
    if (!s) return;
    s.classList.remove("react"); void s.offsetWidth; s.classList.add("react");
    setTimeout(() => s.classList.remove("react"), 600);
  }
  // "annuisce"/si muove quando Kaya parla
  function sellerTalk() {
    const s = $(".chat-seller");
    if (!s || !state.chatOpen) return;
    s.classList.remove("talk"); void s.offsetWidth; s.classList.add("talk");
    setTimeout(() => s.classList.remove("talk"), 620);
  }
  // mosse spontanee mentre la chat è aperta (così non è mai fermo)
  let sellerLifeInt = null;
  function startSellerLife() {
    clearInterval(sellerLifeInt);
    sellerLifeInt = setInterval(() => {
      if (!state.chatOpen) return;
      sellerTalk(); // cenno dolce, niente salti bruschi
    }, 7000);
  }
  function stopSellerLife() { clearInterval(sellerLifeInt); }
  let pokeIdx = 0;
  function pokeSeller() {
    sellerReact(); pingSound();
    if (state.chatOpen) { const a = D.seller.poke[LANG]; botMsg(a[pokeIdx++ % a.length], 400); }
  }
  // CROSS-SELL concatenato: "ya que llevas X, llévate Y que te hará falta"
  let chainIdx = 0;
  function crossSell(p) {
    if (!p) return;
    const upCat = D.upsell[p.category];
    if (!upCat) return;
    const comp = D.products.find(x => x.category === upCat && x.id !== p.id && !state.cart.find(c => c.id === x.id));
    if (!comp) return;
    const arr = D.seller.chain[LANG];
    const line = arr[chainIdx++ % arr.length].replace("{x}", p.name).replace("{y}", comp.name);
    if (state.chatOpen) {
      botMsg(line, 700).then(() => { productCard(comp, true); showPointer(); });
    } else {
      companionSay(line.replace(" 👇", ""), 6500);
    }
  }
  function quickReplies(options) {
    const q = $("#chatQuick");
    q.innerHTML = "";
    options.forEach(opt => {
      const b = document.createElement("button");
      b.textContent = opt.label;
      b.onclick = () => { clearQuick(); opt.onClick(); };
      q.appendChild(b);
    });
    // le quick-reply restringono la chat: ri-scrolla così l'ultimo messaggio resta visibile
    requestAnimationFrame(() => requestAnimationFrame(scrollChat));
  }
  function clearQuick() { $("#chatQuick").innerHTML = ""; }
  function scrollChat() {
    const b = $("#chatBody"); if (!b) return;
    if (!b._scrollBound) {
      b._scrollBound = true;
      // l'utente scrolla a mano (rotellina o dito) mentre Kaya punta → il puntamento finisce (eventi SOLO utente)
      // lo scroll utente chiude il puntamento, MA solo dopo ~2s (così la nuvoletta si fa leggere)
      const userScroll = () => { if ($("#chatPanel").classList.contains("pointing") && performance.now() - pointStart > 2000) hidePointer(); };
      b.addEventListener("wheel", userScroll, { passive: true });
      b.addEventListener("touchmove", userScroll, { passive: true });
    }
    if ($("#chatPanel").classList.contains("pointing")) return;  // durante il puntamento decide alignPointerToCard
    b.scrollTop = b.scrollHeight;   // SEMPRE in fondo: istantaneo e affidabile (niente messaggi nascosti)
  }

  /* =========================================================
     6. CHAT — MOTORE BUDTENDER (profilazione + neuromarketing)
     ========================================================= */
  async function startConversation() {
    state.engaged = true;
    var mem = memOn() ? MEM.get() : {};
    memTouchVisit();
    if (memOn() && mem.name && !nm()) {           // cliente che TORNA: lo riconosce e salta il "benvenuto" generico
      state.profile.name = mem.name;
      await welcomeBack(mem);
      return;
    }
    await botMsg(D.greetings[LANG], 500);
    if (KF_DATA.askName !== false && !nm()) { askNameStep(); return; }   // chiede il nome (vicinanza), poi profila
    askProfilingStep();
  }

  function setProfProgress(step, total) {
    const p = $("#chatProg");
    if (step >= total) { p.hidden = true; return; }
    p.hidden = false;
    $("#chatProgLabel").textContent = t("profStep", LANG).replace("{a}", step + 1).replace("{b}", total);
    $("#chatProgFill").style.width = Math.round(step / total * 100) + "%";
  }
  // re-render quick replies + progress della domanda corrente (usato anche al cambio lingua)
  function renderProfilingQuick(q) {
    setProfProgress(state.step, D.profiling.length);
    quickReplies(q.options.map(o => ({
      label: o[LANG],
      onClick: async () => {
        if (optionLink(o)) return;   // opzione con link → apre la pagina e ferma il flusso
        userMsg(o[LANG]);
        state.profile[q.intent] = o.val;
        state.step++;
        await humanAck(q.intent, o.val);   // reazione umana: "ti ho ascoltato" prima della prossima domanda
        askProfilingStep();
      }
    })));
  }
  function askProfilingStep() {
    state.flow = "profiling";
    const q = D.profiling[state.step];
    if (!q) { recommend(); return; }
    botMsg(q.q[LANG], 500).then(() => renderProfilingQuick(q));
  }

  // Dopo la profilazione: filtra prodotti e vende con tattica
  async function recommend() {
    state.flow = "recommend";
    clearQuick();
    $("#chatProg").hidden = true;
    // ramo CROSS-SELL (bottega/food): mostra i prodotti del reparto con "Aggiungi", poi abbina (neuromarketing)
    if (hasCrossSell()) return browseCategory(state.profile.category);
    // ramo CBD: vendita problema→soluzione CONFORME per curiosi/categoria CBD
    if (D.cbd && (state.profile.category === "CBD" || state.profile.experience === "cbd")) return recommendCBD();
    const cat = state.profile.category;
    const budget = state.profile.budget;
    let pool = D.products.slice();
    if (cat && cat !== "any") pool = pool.filter(p => p.category === cat);
    if (budget === "low") pool = pool.filter(p => p.price < 15);
    else if (budget === "mid") pool = pool.filter(p => p.price >= 15 && p.price <= 50);
    else if (budget === "high") pool = pool.filter(p => p.price > 50);
    let budgetMissed = false;
    if (!pool.length) {
      budgetMissed = !!budget && budget !== "any";
      pool = cat && cat !== "any" ? D.products.filter(p => p.category === cat) : D.products.slice();
    }
    // ordina: badge prima, poi prezzo crescente
    pool.sort((a, b) => ((b.badge ? 1 : 0) - (a.badge ? 1 : 0)) || (a.price - b.price));
    const picks = pool.slice(0, 2);

    // 1) un solo messaggio di apertura + i prodotti (il 1° è "la scelta di Kaya")
    const lead = budgetMissed
      ? pickOne({
          es: ["En ese presupuesto justo no tengo nada clavado, pero mira: esto es lo más cerca y merece 👇", "Uf, justo en ese precio no llego, pero te saco lo más parecido y bueno 👇"],
          en: ["Nothing in that exact budget, but honestly this is the closest — and it's worth it 👇", "Hmm, can't hit that exact price, but here's the nearest solid pick 👇"],
          it: ["In quel budget preciso non ho nulla, ma guarda: questo è il più vicino e merita davvero 👇", "Uff, a quel prezzo esatto non ci arrivo, ma ti tiro fuori il più simile e valido 👇"]
        }[LANG])
      : pickOne({
          es: ["¡Genial! Con lo que me cuentas, esto va contigo 👇", "Vale, creo que ya tengo justo lo tuyo 👇", "Mira, por lo que me dices, estos dos te pegan un montón 👇"],
          en: ["Awesome! Based on what you told me, this is so you 👇", "Okay, I think I've got just the thing for you 👇", "Look, from what you said, these two really fit you 👇"],
          it: ["Perfetto! Da quello che mi dici, questo fa proprio per te 👇", "Ok, credo di avere giusto quello che ci vuole per te 👇", "Guarda, da come mi parli, questi due ti calzano a pennello 👇"]
        }[LANG]);
    // UN solo messaggio + i prodotti (il 1° è la scelta di Kaya) — col nome del cliente se lo conosciamo
    const vName = nm();
    await botMsg(vName && Math.random() < 0.7 ? vName + ", " + lc(lead) : lead, 700);
    let heroCard = null;
    picks.forEach((p, i) => { const c = productCard(p, i === 0); if (i === 0) heroCard = c; });

    const hero = picks[0];
    // il pack come UNICA aggiunta (la mossa di vendita), dopo una pausa
    const bundle = picks.slice();
    const up = picks[0] && D.upsell[picks[0].category];
    const upProd = up && D.products.find(p => p.category === up && !bundle.includes(p));
    if (upProd) bundle.push(upProd);
    state.flow = "free";
    if (!isLead() && bundle.length >= 2) await offerBundle(bundle);   // niente pacchetto in modalità Lead (servizi)
    offerFreeQuick();   // le quick-reply fanno da chiusura, niente messaggio extra

    // "dopo un paio di secondi": il consiglio finale (col personaggio o, se assente, come messaggio)
    await spotlightPick(heroCard, hero);
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  // mette in risalto la scelta: con mascotte → si alza, indica e parla nella nuvoletta; senza → bagliore + messaggio
  async function spotlightPick(heroCard, hero) {
    if (!hero) return;
    if (hasCharacter()) {
      await wait(1400);
      showPointer(heroCard, adviceLine(hero));
    } else {
      if (heroCard) heroCard.classList.add("kaya-target");
      await wait(500);
      await botMsg(adviceLine(hero), 500);
    }
  }
  // frase della NUVOLETTA del personaggio (consiglio personale sul prodotto scelto)
  function adviceLine(p) {
    const base = isLead() ? pickOne({
      es: [`Para tu caso, ${p.name} es justo lo que necesitas. Escríbeme aquí abajo y te respondo yo, sin compromiso 👇`, `Te lo digo de corazón: ${p.name}. Toca el botón de abajo y lo dejamos listo en 1 min 👇`, `${p.name} es lo tuyo, de verdad. Escríbenos ahora y te atendemos enseguida 👇`],
      en: [`For your case, ${p.name} is exactly what you need. Message me below and I'll reply myself, no strings 👇`, `Straight up: ${p.name}. Tap the button below and we'll sort it in 1 min 👇`, `${p.name} is the one for you. Message us now and we'll get right back to you 👇`],
      it: [`Per il tuo caso ${p.name} è proprio quello che ti serve. Scrivimi qui sotto e ti rispondo io, senza impegno 👇`, `Te lo dico col cuore: ${p.name}. Tocca il tasto qui sotto e lo sistemiamo in 1 minuto 👇`, `${p.name} è la cosa giusta per te, davvero. Scrivici ora e ti rispondiamo subito 👇`]
    }[LANG]) : pickOne({
      es: [`Para mí, el ${p.name} es tu elección — te va a encantar 👌`, `Si me preguntas a mí, sin dudar el ${p.name} 😉`, `De corazón: el ${p.name}. Lo siento perfecto para ti 👌`],
      en: [`For me, the ${p.name} is your pick — you'll love it 👌`, `If you ask me, the ${p.name}, no doubt 😉`, `Honestly? The ${p.name}. It just feels right for you 👌`],
      it: [`Secondo me il ${p.name} è la tua scelta — te ne innamori 👌`, `Se chiedi a me, senza dubbio il ${p.name} 😉`, `Di cuore: il ${p.name}. Lo sento proprio giusto per te 👌`]
    }[LANG]);
    const n = nm();
    return n && Math.random() < 0.6 ? n + ", " + lc(base) : base;
  }

  // 🌿 Vendita CBD problema→soluzione (CONFORME): scopre il "momento" e propone la soluzione cosmetica/aromatica
  async function recommendCBD() {
    state.flow = "cbd";
    clearQuick();
    await botMsg(D.cbd.intro[LANG], 700);
    const q = D.cbd.needQ;
    quickReplies(q.options.map(o => ({
      label: o[LANG], onClick: () => { userMsg(o[LANG]); presentCBD(o.val); }
    })));
  }
  async function presentCBD(need) {
    clearQuick();
    const sol = D.cbd.solutions[need] || D.cbd.solutions.calma;
    const hero = prod(sol.productId), cross = prod(sol.crossId);
    if (!hero) return;
    // problema→soluzione in UN messaggio + il prodotto consigliato
    await botMsg(sol.pitch[LANG], 900);
    const heroCard = productCard(hero, true);
    if (cross && cross.id !== hero.id) productCard(cross, false);
    // pack "ritual" (hero + complementare) se l'eroe non è già il set
    const bundle = [hero]; if (cross && cross.id !== hero.id) bundle.push(cross);
    state.flow = "free";
    if (bundle.length >= 2 && hero.id !== 25) await offerBundle(bundle);
    await botMsg(D.cbd.disclaimer[LANG], 600);   // nota legale conforme
    offerFreeQuick();
    await spotlightPick(heroCard, hero);
  }

  // offerta pacchetto: anchoring sul totale + sconto pack 15%
  async function offerBundle(items) {
    const was = items.reduce((s, p) => s + p.price, 0);
    const now = Math.round(was * 0.85 * 100) / 100;
    const save = Math.round((was - now) * 100) / 100;
    const msg = D.seller.bundle[LANG]
      .replace("{was}", money(was)).replace("{now}", money(now)).replace("{save}", money(save));
    await botMsg(msg, 1300);
    // CTA persistente nel corpo chat (non una quick-reply che verrebbe sovrascritta)
    const el = document.createElement("div");
    el.className = "msg-product bundle-cta";
    el.innerHTML = `<div class="mp-img">🎁</div>
      <div class="mp-info"><div class="mp-name">Pack ×${items.length}</div>
      <div class="mp-price">${money(now)} <span class="price-was">${money(was)}</span></div></div>
      <button class="mp-add">${D.seller.bundleAdd[LANG].replace("{save}", money(save))}</button>`;
    const btn = el.querySelector(".mp-add");
    btn.onclick = () => {
      if (btn.disabled) return;
      items.forEach(p => addToCart(p.id, 1, { silent: true }));
      state.discount += save;          // applica DAVVERO lo sconto pack al carrello
      renderCart();
      toast(t("added", LANG)); pingSound(); cartBump();
      btn.textContent = t("added", LANG); btn.disabled = true;
      botMsg(D.seller.assumptiveClose[LANG], 500);
    };
    $("#chatBody").appendChild(el);
    scrollChat();
  }

  // richiesta valutazione a stelle dopo il checkout (boost rating + reciprocità con codice)
  async function askRating() {
    await botMsg(D.marketing.ratePrompt[LANG], 700);
    const el = document.createElement("div");
    el.className = "rate-stars";
    for (let i = 1; i <= 5; i++) {
      const b = document.createElement("button");
      b.textContent = "★"; b.setAttribute("aria-label", i + " estrellas");
      b.onmouseover = () => [...el.children].forEach((c, idx) => c.classList.toggle("hot", idx < i));
      b.onclick = () => {
        [...el.children].forEach((c, idx) => { c.classList.toggle("hot", idx < i); c.disabled = true; });
        pingSound();
        botMsg(D.marketing.rateThanks[LANG].replace("{n}", i), 500);
      };
      el.appendChild(b);
    }
    $("#chatBody").appendChild(el);
    scrollChat();
  }
  function pickTactic(profile, picks) {
    if (profile.experience === "beginner") return D.tactics.authority[LANG];
    if (profile.experience === "expert") return D.tactics.socialProof[LANG];
    if (profile.category === "CBD" || profile.experience === "cbd") return D.tactics.sensory[LANG];
    if (profile.budget === "high") return D.tactics.anchoring[LANG];
    if (profile.category === "Accendini") return D.tactics.lossAversion[LANG];
    return D.tactics.socialProof[LANG];
  }

  // ri-mostra il menu delle categorie/servizi (per "vedi altro")
  function showCategoryMenu() {
    const q = isLead() ? D.profiling[0] : (D.profiling[2] || D.profiling[D.profiling.length - 1] || D.profiling[0]);
    if (!q || !q.options) { offerFreeQuick(); return; }
    botMsg({ es: "Dime, ¿qué más miramos? 👇", en: "Tell me, what else shall we look at? 👇", it: "Dimmi, cos'altro vediamo? 👇" }[LANG], 450)
      .then(() => quickReplies(q.options.map(o => ({
        label: o[LANG], onClick: async () => { if (optionLink(o)) return; userMsg(o[LANG]); state.profile.category = o.val; await humanAck(q.intent || "category", o.val); recommend(); }
      }))));
  }
  function offerFreeQuick() {
    if (hasCrossSell()) {   // bottega/food: il checkout è la BARRA fissa; qui solo navigazione
      quickReplies([{ label: { es: "Ver categorías 🧺", en: "See categories 🧺", it: "Vedi i reparti 🧺" }[LANG], onClick: () => showCategoryMenu() }]);
      return;
    }
    if (isLead()) {
      // SERVIZI/prenotazione: il CONTATTO è l'azione primaria → primo bottone, etichetta chiara verso WhatsApp
      var hasWa = !!(KF_DATA.lead && KF_DATA.lead.whatsapp);
      var leadCta = (KF_DATA.lead && KF_DATA.lead.cta && KF_DATA.lead.cta[LANG])
        || (hasWa ? { es: "💬 Escríbenos por WhatsApp", en: "💬 Message us on WhatsApp", it: "💬 Scrivici su WhatsApp" }[LANG]
                  : { es: "Reservar", en: "Book", it: "Prenota un appuntamento" }[LANG]);
      quickReplies([
        { label: leadCta, onClick: () => openBooking("") },   // azione primaria PRIMA (era seconda → poche conversioni)
        { label: { es: "Ver otros servicios", en: "See other services", it: "Vedi altri servizi" }[LANG], onClick: () => showCategoryMenu() }
      ]);
      return;
    }
    const opts = [{ es: "Ver más opciones", en: "See more options", it: "Vedi altre opzioni" }];
    if (D.cbd) opts.push({ es: "¿Es legal el CBD?", en: "Is CBD legal?", it: "Il CBD è legale?" });   // solo se nicchia CBD
    opts.push({ es: "Envío y entrega", en: "Shipping & delivery", it: "Spedizione e consegna" });
    quickReplies(opts.map(o => ({ label: o[LANG], onClick: () => handleUser(o[LANG]) })));
  }

  // ===== COMPRENSIONE TESTO LIBERO (generica, guidata dai SERVIZI/PRODOTTI del cliente) =====
  const STOPW = ["della","delle","degli","sono","come","cosa","molto","anche","quale","quali","vorrei","posso","serve","fare","bene","questo","questa","dopo","prima","tutto","tutta","mia","mio","mie","miei","con","per","una","uno","che","non","gli","the","and","you","for","con","sul","sulla","alla","dal"];
  // ===== SAPERE INSEGNATO DAL TITOLARE (pagina Allena) — il bot risponde con le voci che il capo gli ha dato =====
  function bestKnowledge(low) {
    var list = D.knowledge; if (!Array.isArray(list) || !list.length) return null;
    var best = null, score = 0;
    for (var i = 0; i < list.length; i++) {
      var e = list[i], keys = e.keys || e.k || [], s = 0;
      for (var j = 0; j < keys.length; j++) { var k = String(keys[j] || "").toLowerCase().trim(); if (k && low.indexOf(k) >= 0) s += 2; }
      if (s > score) { score = s; best = e; }
    }
    return score >= 2 ? best : null;   // serve almeno una parola-chiave centrata
  }
  function kAnswer(e) {
    var a = e.a || e.answer || ""; if (a && typeof a === "object") a = a[LANG] || a.it || a.es || a.en || "";
    if (e.safe && D.safetyNote) { var n = D.safetyNote; n = (typeof n === "object") ? (n[LANG] || n.it || n.es || n.en || "") : n; if (n) a = a + "\n\n" + n; }
    return a;
  }

  function matchService(low) {
    let best = null, bestScore = 0;
    for (const p of (D.products || [])) {
      let score = 0;
      const words = (p.name || "").toLowerCase().split(/[^a-zàèéìòùçñ]+/).filter(w => w.length >= 4 && STOPW.indexOf(w) < 0);
      for (const w of words) {
        if (low.indexOf(w) >= 0) score += 2;
        else if (low.indexOf(w.slice(0, 4)) >= 0) score += 1;   // match per radice (gomme↔gommista)
      }
      const cat = String(p.category || "").toLowerCase();
      if (cat.length >= 3 && low.indexOf(cat) >= 0) score += 2;
      if (Array.isArray(p.keys)) for (const k of p.keys) { try { if (new RegExp(k, "i").test(low)) score += 3; } catch (e) {} }
      if (score > bestScore) { bestScore = score; best = p; }
    }
    return bestScore >= 2 ? best : null;
  }
  // un PROBLEMA/guasto espresso a parole (modalità servizi) → empatia + diagnosi
  function isProblem(low) {
    return /non\s*(parte|va\b|funziona|si\s*avvia|accende|frena|tiene|carica|prende|gira|stacca|chiude|apre)|si\s*è\s*(fermat|spent|rott|blocc|scaric)|in\s*panne|guast|\brott[oa]\b|problema|\bpanne\b|rumor|cigol|vibr|perd[ei]|\bfuma\b|\bfumo\b|\bspia\b|surriscald|puzza|si\s*spegne|sussult|strapp|no\s*(arranca|enciende|funciona)|won'?t\s*(start|work)|not\s*working|broken|noise|leak/i.test(low);
  }
  // EMERGENZA / "panico totale": il cliente è bloccato o è urgente → si BYPASSA tutto e si fa contattare SUBITO un umano
  function isEmergency(low) {
    return /non\s*(parte|riparte|si\s*avvia|si\s*accende|frena|fren)|in\s*panne|rimast[oa]\s*a\s*piedi|bloccat[oa]\s*(in|per|sulla|a)\s*\w*strada|ferm[oa]\s*(in|per|a)\s*\w*strada|si\s*è\s*spent[ao]\s*(in|per|mentre|d|sull)|\bincidente\b|tamponat|\bemergenz|urgent|\bsubito\b|perdo\s*i\s*freni|fumo\s*dal|non\s*si\s*avvia|no\s*(arranca|enciende|frena)|won'?t\s*start|broke\s*down|stranded|\baccident/i.test(low);
  }
  function callUrl() { const L = KF_DATA.lead || {}; return L.phone ? "tel:" + String(L.phone).replace(/[^0-9+]/g, "") : null; }
  // risposta EMERGENZA: empatia forte + contatto immediato (chiamata + WhatsApp), niente domande inutili
  async function emergencyHandoff(raw) {
    await botMsg(pickOne({
      it: ["Capito, è da risolvere SUBITO — niente domande inutili 🔧 Ti faccio contattare al volo, scegli come 👇", "Ricevuto, qui è urgenza 🚨 Saltiamo i convenevoli: parla con noi adesso 👇", "Tranquillo, ci pensiamo noi all'istante 🔧 Niente chat lunghe — ecco come raggiungerci ora 👇"],
      es: ["Entendido, esto se resuelve YA — sin preguntas 🔧 Te paso con nosotros al vuelo 👇", "Recibido, es urgencia 🚨 Saltamos lo demás: habla con nosotros ahora 👇", "Tranquilo, nos encargamos al instante 🔧 Sin chats largos — así nos contactas ya 👇"],
      en: ["Got it, this needs sorting NOW — no pointless questions 🔧 Let me connect you right away 👇", "Understood, this is urgent 🚨 Skipping the rest: talk to us now 👇", "Relax, we're on it instantly 🔧 No long chats — here's how to reach us now 👇"]
    }[LANG]), 650);
    const call = callUrl();
    const btns = [{ label: tline({ it: "💬 Scrivici ora su WhatsApp", es: "💬 Escríbenos ya por WhatsApp", en: "💬 Message us now" }), onClick: () => openBooking(raw) }];
    if (call) btns.unshift({ label: tline({ it: "📞 Chiama ora", es: "📞 Llamar ahora", en: "📞 Call now" }), onClick: () => { try { parent.postMessage({ aiseller: "lead", service: "EMERGENZA", brand: KF_DATA._brand || "" }, "*"); } catch (e) {} window.open(call, "_self"); } });
    quickReplies(btns);
  }
  function primaryService() {
    return (D.products || []).find(p => /diagnos|controll|\bcheck|tagliand|visita|preventiv|consul|prima\s*visita/i.test((p.name || "") + " " + (p.category || "")))
      || (D.products || []).find(p => p.badge) || (D.products || [])[0] || null;
  }
  function tline(map) { return map[LANG] || map.it; }
  async function leadBookReply(msgMap) {
    await botMsg(tline(msgMap), 650);
    const cta = (KF_DATA.lead && KF_DATA.lead.cta && KF_DATA.lead.cta[LANG]) || tline({ it: "Prenota su WhatsApp", es: "Reservar por WhatsApp", en: "Book on WhatsApp" });
    quickReplies([
      { label: cta, onClick: () => openBooking("") },
      { label: tline({ it: "Vedi i servizi", es: "Ver servicios", en: "See services" }), onClick: () => showCategoryMenu() }
    ]);
  }

  // Input libero → capisce cosa vuole/dice il cliente e instrada SEMPRE con senso (e umanità)
  async function handleUser(text) {
    sniffLang(text);
    userMsg(text);
    clearQuick();
    state.engaged = true;
    if (state.flow === "askName") {
      if (await captureName(text)) return;   // era il nome → catturato e prosegue
      state.flow = "free";                   // NON era un nome (problema/domanda) → bypassa e processa il messaggio, senza perderlo
    }
    if (CFG.useClaude && CFG.apiKey) { await claudeReply(text); return; }

    const raw = (text || "").trim();
    const low = raw.toLowerCase();
    const has = (arr) => arr.some(k => low.includes(k));

    // 0) saluto breve → accoglie e propone
    if (raw.length <= 16 && has(["hola", "buenas", "buenos", "hello", " hi", "hey", "ciao", "salve", "buongiorno", "hi!", "ola"])) {
      await botMsg(D.greetings[LANG], 500);
      offerFreeQuick();
      return;
    }

    // 0.6) SAPERE INSEGNATO DAL TITOLARE (pagina Allena) — priorità: risponde con ciò che il capo ha insegnato
    var kb = bestKnowledge(low);
    if (kb) { await botMsg(kAnswer(kb), 650); offerFreeQuick(); return; }

    // 0.5) EMERGENZA / panico ("non parte", "in panne", "urgente"…) → BYPASS totale: contatto umano immediato
    if (isLead() && KF_DATA.emergency !== false && isEmergency(low)) { await emergencyHandoff(raw); return; }

    // 1) MODALITÀ SERVIZI — un PROBLEMA a parole (drivibile: "fa rumore", "perde olio") → empatia + il servizio giusto
    if (isLead() && isProblem(low)) {
      await botMsg(D.problemEmpathy ? pickOne(D.problemEmpathy[LANG] || D.problemEmpathy.it) : pickOne({
        it: ["Capito, niente panico — è proprio il nostro lavoro 🔧 Vediamo subito di cosa si tratta 👇", "Tranquillo, ci pensiamo noi 🔧 Partiamo da qui per capire il problema 👇", "Ti capisco, dà fastidio 😟 Ma sei nel posto giusto: lo guardiamo subito 👇"],
        es: ["Entendido, sin pánico — es justo lo nuestro 🔧 Vemos enseguida qué es 👇", "Tranquilo, nos encargamos 🔧 Empezamos por aquí para ver el problema 👇", "Te entiendo, molesta 😟 Pero estás en el sitio correcto: lo miramos ya 👇"],
        en: ["Got it, no panic — that's exactly our job 🔧 Let's see what it is 👇", "Relax, we've got this 🔧 Let's start here to pin down the problem 👇", "I get it, annoying 😟 But you're in the right place: we'll check it now 👇"]
      }[LANG]), 700);
      const svc = matchService(low) || primaryService();   // il servizio specifico citato, altrimenti la diagnosi
      if (svc) { state.profile.category = svc.category; recommend(); } else offerFreeQuick();
      return;
    }

    // 2) ha NOMINATO un servizio/prodotto → instrada lì (vale per ogni cliente)
    const svc = matchService(low);
    if (svc) { state.profile.category = svc.category; recommend(); return; }

    // 3) MODALITÀ SERVIZI — prezzo / prenotazione
    if (isLead()) {
      if (/quanto\s*cost|che\s*prezz|\bprezz|preventiv|listino|tariff|\bcosta\b|cu[aá]nto\s*cuesta|how\s*much|\bprice\b/i.test(low)) {
        await leadBookReply({ it: "I prezzi dipendono dall'intervento — il modo più veloce e preciso è un preventivo al volo su WhatsApp 👇", es: "El precio depende del trabajo — lo más rápido es un presupuesto al vuelo por WhatsApp 👇", en: "Pricing depends on the job — the fastest way is a quick quote on WhatsApp 👇" }); return;
      }
      if (/prenot|appuntament|\bquando\b|disponib|\borari|\baperto|passare|venire|reservar|\bcita\b|\bbook/i.test(low)) {
        await leadBookReply({ it: "Perfetto, fissiamo! Scrivimi su WhatsApp e troviamo l'orario giusto 👇", es: "¡Perfecto, lo fijamos! Escríbeme por WhatsApp y buscamos hora 👇", en: "Perfect, let's set it! Message me on WhatsApp and we'll find a time 👇" }); return;
      }
    }

    // 3) obiezioni — solo shop/CBD (non in modalità servizi)
    if (!isLead() && D.objections) {
      for (const obj of D.objections) {
        if (obj.keys[LANG].some(k => low.includes(k))) { await botMsg(obj.r[LANG], 700); offerFreeQuick(); return; }
      }
    }

    // 4) nicchia CBD: bisogno problema→soluzione + generico
    if (D.cbd) {
      const needMap = {
        calma: ["relax", "relaj", "rilass", "estr", "stress", "ansi", "calm", "tranquil", "desconect", "stacca", "nerv", "tension", "tensión", "dormir", "sueñ", "sonno", "insomn", "descans", "noche", "notte", "night", "unwind", "chill", "agobi"],
        piel: ["piel", "pelle", "skin", "cara", "rostro", "arrug", "hidrat", "cutis", "facial", "crema"],
        deporte: ["deporte", "sport", "gym", "gimnas", "entren", "muscul", "agujet", "correr", "running", "recuper", "fitness", "pesas", "espalda"],
        ritual: ["regalo", "regal", "regà", "gift", "present", "primera vez", "first time", "empezar", "probar cbd", "set ", "kit cbd"]
      };
      for (const [need, keys] of Object.entries(needMap)) { if (has(keys)) { await presentCBD(need); return; } }
      if (has(["cbd", "cannabidiol", "bienestar", "benessere", "wellness"])) { await recommendCBD(); return; }
      const catMap = {
        CBD: ["cbd", "cannabidiol", "aceite", "resina"], Cartine: ["cartin", "papel", "paper", "rolling", "raw", "liar", "rollare"],
        Grinder: ["grinder", "moler", "macina", "tritar"], Accendini: ["mechero", "lighter", "clipper", "accendin", "encendedor"],
        Vaporizzatori: ["vape", "vaper", "vapor", "vaporizz", "pod"], Edibles: ["dulce", "sweet", "dolce", "comestible", "edible", "caramelo", "gomin"],
        Accessori: ["cenicero", "ashtray", "posacener", "accesori", "accessor"]
      };
      for (const [cat, keys] of Object.entries(catMap)) { if (has(keys)) { await guideCategory(cat); return; } }
    }

    // 5) "tutto / catalogo / preferiti"
    if (/(todo|everything|\btutto\b|favorit|m[áa]s|\bmore\b|altro|otras|other|cat[aá]log|tienda|shop|productos|prodotti)/.test(low)) {
      const picks = (D.products || []).filter(p => p.badge).slice(0, 3);
      await botMsg(tline({ es: "Estos son los favoritos de la casa 👇", en: "These are the house favorites 👇", it: "Questi sono i nostri più richiesti 👇" }), 600);
      picks.forEach(p => productCard(p, false));
      offerFreeQuick();
      return;
    }

    // 6) FALLBACK UMANO — non si blocca, accoglie e guida (mai bottoni a caso)
    if (isLead()) {
      await botMsg(D.askHint ? tline(D.askHint) : tline({
        it: "Raccontami pure di cosa hai bisogno, anche a parole tue (es. \"perde olio\", \"fa un rumore strano\") — oppure scegli qui sotto 👇",
        es: "Cuéntame qué necesitas, con tus palabras (ej. \"pierde aceite\", \"hace un ruido raro\") — o elige aquí debajo 👇",
        en: "Tell me what you need, in your own words (e.g. \"leaking oil\", \"weird noise\") — or pick below 👇"
      }), 650);
      showCategoryMenu();
      return;
    }
    await botMsg({ es: "Te leo 👀 Para clavarte la recomendación, dime qué buscas:", en: "I hear you 👀 To nail the pick, tell me what you're after:", it: "Ti seguo 👀 Per azzeccare il consiglio, dimmi cosa cerchi:" }[LANG], 600);
    const menuQ = D.profiling[2] || D.profiling[D.profiling.length - 1] || D.profiling[0];
    quickReplies(((menuQ && menuQ.options) || []).map(o => ({
      label: o[LANG],
      onClick: async () => { if (optionLink(o)) return; userMsg(o[LANG]); state.profile.category = o.val; await humanAck("category", o.val); recommend(); }
    })));
  }
  // IMBUTO per categoria: non scarica prodotti, GUIDA con una domanda (budget) + bottoni → poi consiglia
  async function guideCategory(cat) {
    clearQuick();
    state.profile.category = cat;
    const cl = catLabel(cat);
    await botMsg({
      es: `${cl} da para mucho 😏 Para clavarte la elección, dime: ¿qué presupuesto tienes en mente?`,
      en: `${cl} is a whole world 😏 To nail your pick, tell me: what budget do you have in mind?`,
      it: `${cl} è un mondo 😏 Per azzeccarti la scelta dimmi: che budget hai in mente?`
    }[LANG], 650);
    const bq = (D.profiling && D.profiling[3]) ? D.profiling[3].options : null;
    if (bq) {
      quickReplies(bq.map(o => ({ label: o[LANG], onClick: async () => { userMsg(o[LANG]); state.profile.budget = o.val; await humanAck("budget", o.val); recommend(); } })));
    } else { recommend(); }
  }

  /* =========================================================
     7. CLAUDE API (opzionale) — attivo solo con chiave
     ========================================================= */
  function systemPrompt() {
    const cat = D.products.map(p => `- ${p.name} | ${p.category} | ${money(p.price)} | ${p.description}`).join("\n");
    return `Sei "Kaya", budtender di Kayaman's Farm (smoke shop & CBD boutique, Las Palmas, solo +18).
Parla in ${LANG === "es" ? "spagnolo" : LANG === "en" ? "inglese" : "italiano"}. Tono: chill, esperto, amichevole, mai invadente.
Profila il cliente, consiglia per stile di vita e budget, fai cross-sell con tatto. Niente promesse mediche. Sempre +18.
Usa tecniche di neuromarketing (riprova sociale, scarsità, autorità) con misura.
CATALOGO:\n${cat}`;
  }
  let history = [];
  async function claudeReply(text) {
    history.push({ role: "user", content: text });
    const typing = addTyping();
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": CFG.apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: CFG.model, max_tokens: 400,
          system: systemPrompt(), messages: history
        })
      });
      const data = await res.json();
      typing.remove();
      const reply = (data.content && data.content[0] && data.content[0].text) || "…";
      history.push({ role: "assistant", content: reply });
      const el = document.createElement("div");
      el.className = "msg bot"; el.textContent = reply;
      $("#chatBody").appendChild(el); scrollChat();
    } catch (e) {
      typing.remove();
      await botMsg("⚠️ " + ({ es: "No pude conectar con la IA, sigo en modo budtender experto.", en: "Couldn't reach the AI, staying in expert budtender mode.", it: "Non riesco a contattare l'IA, resto in modalità budtender esperto." }[LANG]), 200);
      CFG.useClaude = false;
      handleUser(text);
    }
  }

  /* =========================================================
     8. RE-ENGAGEMENT "SPIETATO"
     ========================================================= */
  let idleTimer = null, minTimer = null, idleCount = 0, exitShown = false, titleFlash = null;
  const baseTitle = document.title;

  function startReengage() {
    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(ev =>
      document.addEventListener(ev, resetIdle, { passive: true }));
    resetIdle();
    // exit-intent solo su desktop con mouse (su touch non ha senso e non si attiva)
    const isTouch = window.matchMedia && window.matchMedia("(pointer:coarse)").matches;
    if (CFG.exitIntentEnabled && !isTouch) document.addEventListener("mouseout", onExitIntent);
    document.addEventListener("visibilitychange", onVisibility);
  }
  function scheduleIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(onIdle, CFG.idleSeconds * 1000);
  }
  function resetIdle() {
    // l'elfo NON sparisce col movimento del mouse: resta nell'angolo finché la chat è chiusa.
    // si nasconde solo aprendo la chat (openChat). Qui riavvio solo il timer dei nudge.
    scheduleIdle();
  }
  function onIdle() {
    // cap: max 3 nudge totali, per non essere fastidiosi (specie la vibrazione su mobile)
    if (idleCount >= 3) return;
    const idx = idleCount % D.reengage.idle.es.length;
    idleCount++;
    if (state.chatOpen) {
      botMsg(D.reengage.idle[LANG][idx], 300);
    } else {
      showSmokingElf();
      companionSay(D.reengage.idle[LANG][idx]);  // commento nel fumetto, lingua corrente
      vibrate([60]);
    }
    if (idleCount < 3) scheduleIdle();
  }
  let elfHideTimer = null;
  function showSmokingElf() {
    const e = $("#elfSmoke");
    if (!e || state.chatOpen) return;
    clearTimeout(elfHideTimer);  // annulla un eventuale fade-out in corso
    e.hidden = false;
    e.classList.add("show");
    // stile inline pilotato via rAF: garantisce l'entrata animata
    requestAnimationFrame(() => requestAnimationFrame(() => {
      e.style.opacity = "1";
      e.style.transform = "translateY(0) rotate(0)";
    }));
  }
  function hideSmokingElf() {
    const e = $("#elfSmoke");
    hideBubble();
    if (!e || e.hidden) return;
    e.style.opacity = "0";
    e.style.transform = "translateY(40px) rotate(6deg)";
    e.classList.remove("show");
    clearTimeout(elfHideTimer);
    elfHideTimer = setTimeout(() => { if (e.style.opacity === "0") e.hidden = true; }, 500);
  }
  // ===== ELFO COMPAGNO: fumetti contestuali =====
  let bubbleTimer = null, addReactIdx = 0;
  function comp(key) { const c = D.companion[key]; return c ? (c[LANG] || c.es) : ""; }
  function companionSay(text, ms = 5500) {
    if (state.chatOpen || !text) return;
    showSmokingElf();                 // l'elfo è presente quando parla
    const b = $("#elfBubble");
    if (!b) return;
    b.textContent = text;
    b.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add("show")));
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(hideBubble, ms);
  }
  function hideBubble() {
    const b = $("#elfBubble");
    if (!b || b.hidden) return;
    b.classList.remove("show");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => { b.hidden = true; }, 300);
  }
  // reazione + STRATEGIA all'aggiunta al carrello (guida la spesa e concatena)
  function onAdded(p) {
    if (state.chatOpen) { crossSell(p); return; }   // in chat: catena di prodotti
    const rem = D.freeShipThreshold - cartTotal();
    if (rem <= 0) companionSay(comp("shipDone"));
    else if (rem <= 25) companionSay(D.companion.shipClose[LANG].replace("{v}", money(rem)));
    else crossSell(p);   // bolla: "ya que llevas X, llévate Y"
  }
  let pendingIdleIdx = null;

  function scheduleMinimizedNudge() {
    clearTimeout(minTimer);
    minTimer = setTimeout(() => {
      if (state.minimized && !state.chatOpen) {
        bumpBadge();
        nudgeLauncher();
        vibrate([120, 60, 120]);
        pingSound();
        flashTitle(D.reengage.tabBait[LANG]);
      }
    }, CFG.minimizedNudgeSeconds * 1000);
  }

  function bumpBadge() {
    state.badge++;
    const b = $("#chatBadge");
    b.hidden = false; b.textContent = state.badge;
    nudgeLauncher();
    vibrate([90]);
    pingSound();
  }
  function clearBadge() {
    state.badge = 0;
    $("#chatBadge").hidden = true;
    // se c'era un nudge idle in sospeso, Kaya lo dice all'apertura NELLA LINGUA ATTUALE
    if (pendingIdleIdx != null) {
      const arr = D.reengage.idle[LANG], m = arr[pendingIdleIdx % arr.length];
      pendingIdleIdx = null;
      setTimeout(() => botMsg(m, 300), 400);
    }
  }
  function nudgeLauncher() {
    const l = $("#chatLauncher");
    if (l.hidden) return;
    l.classList.remove("nudge"); void l.offsetWidth; l.classList.add("nudge");
  }

  // vibrazione (mobile) + beep (desktop)
  function vibrate(pattern) {
    if (CFG.vibrate && navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} }
  }
  let audioCtx = null;
  function pingSound() {
    if (!CFG.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.type = "sine"; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
      o.start(); o.stop(audioCtx.currentTime + 0.26);
    } catch (e) {}
  }

  // exit-intent: il mouse esce dall'alto della pagina
  function onExitIntent(e) {
    if (exitShown) return;
    if (window.matchMedia && matchMedia("(pointer:coarse)").matches) return; // mai su touch
    if (document.getElementById("exitPopup") && !document.getElementById("exitPopup").hidden) return;
    // solo quando il cursore esce davvero dalla cima della finestra
    if (e.clientY > 0) return;
    if (e.relatedTarget && e.relatedTarget.nodeName !== "HTML") return;
    exitShown = true;
    document.removeEventListener("mouseout", onExitIntent); // one-shot: non serve più
    showExitPopup();
  }
  let exitInt = null;
  function stopExitCountdown() { clearInterval(exitInt); exitInt = null; }
  function showExitPopup() {
    $("#exitPopup").hidden = false;
    vibrate([150, 80, 150]); pingSound();
    let secs = 300;
    const cd = $("#exitCountdown");
    const tick = () => {
      const m = String(Math.floor(secs / 60)).padStart(2, "0");
      const s = String(secs % 60).padStart(2, "0");
      cd.textContent = `${m}:${s}`;
      if (secs-- <= 0) stopExitCountdown();
    };
    tick();
    stopExitCountdown();
    exitInt = setInterval(tick, 1000);
  }

  // cambio scheda: titolo lampeggia per "riportare" l'utente
  function onVisibility() {
    if (document.hidden) {
      const bait = D.reengage.tabBait[LANG];
      flashTitle(bait);
    } else {
      stopFlashTitle();
      if (state.minimized || !state.chatOpen) { /* lascia il badge */ }
    }
  }
  function flashTitle(text) {
    stopFlashTitle();
    let on = false;
    titleFlash = setInterval(() => {
      document.title = on ? baseTitle : text;
      on = !on;
    }, 1000);
  }
  function stopFlashTitle() {
    clearInterval(titleFlash); titleFlash = null; document.title = baseTitle;
  }

  /* =========================================================
     9. TOAST
     ========================================================= */
  let toastTimer = null;
  function toast(msg) {
    let el = $(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg;
    el.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.style.display = "none", 1400);
  }

  /* =========================================================
     9b. SOCIAL PROOF (bilanciato)
     ========================================================= */
  let spIdx = 0;
  function socialToast() {
    if (document.hidden || state.chatOpen) return;
    if (spIdx >= 5) { clearInterval(socialInt); return; } // max 5 volte, niente spam
    const list = D.socialProof[LANG];
    const n = 5 + Math.floor(Math.random() * 14);
    const m = 2 + Math.floor(Math.random() * 12);
    const html = list[spIdx % list.length].replace("{n}", n).replace("{m}", m);
    spIdx++;
    let el = $(".toast.sp");
    if (!el) { el = document.createElement("div"); el.className = "toast sp"; document.body.appendChild(el); }
    el.innerHTML = html;
    el.style.display = "block";
    clearTimeout(el._t);
    el._t = setTimeout(() => el.style.display = "none", 4200);
  }
  let socialInt = null;
  function startSocialProof() {
    setTimeout(socialToast, 14000);
    clearInterval(socialInt);
    socialInt = setInterval(socialToast, 42000); // ~ogni 42s, max 5 volte
  }

  /* =========================================================
     10. WIRING
     ========================================================= */
  function init() {
    LANG = detectLang();
    setLang(LANG);
    initAgeGate();
    window.addEventListener("scroll", onScrollLazy, { passive: true });
    window.addEventListener("resize", checkLazy);

    $$(".lang-switch button").forEach(b => b.onclick = () => setLang(b.dataset.lang));
    $("#cartBtn").onclick = openCart;
    $("#cartClose").onclick = closeCart;
    $("#overlay").onclick = closeCart;
    $("#checkoutBtn").onclick = () => {
      if (!state.cart.length) { toast(t("emptyCart", LANG)); return; }
      const msg = t("checkoutMsg", LANG).replace("{t}", money(cartTotal()));
      $("#chatBody").dataset.started = "1"; // contesto post-acquisto: niente intro vendite
      state.flow = "free";
      closeCart(); openChat();
      botMsg(msg, 300).then(askRating);   // dopo l'acquisto chiede la valutazione ⭐
      state.cart = []; renderCart();
    };
    $("#heroCta").onclick = () => scrollToShop();
    $("#heroCta2").onclick = openChat;
    $("#hamburger").onclick = () => document.querySelector(".navbar").classList.toggle("open");
    $("#promoClose").onclick = () => { $("#promoBar").style.display = "none"; if (promoInt) clearInterval(promoInt); };
    $("#chatLauncher").onclick = openChat;
    $("#elfSmoke").onclick = openChat;   // toccare l'elfo apre la chat
    $("#elfBubble").onclick = openChat;  // toccare il fumetto apre la chat
    const sellerEl = $(".chat-seller"); if (sellerEl) sellerEl.onclick = pokeSeller; // stuzzica il venditore
    const heroM = $(".hero-mascot"); if (heroM) { heroM.style.cursor = "pointer"; heroM.onclick = openChat; }
    // ricerca: filtra la griglia per nome/categoria
    $("#searchForm").onsubmit = e => { e.preventDefault(); doSearch($("#searchInput").value.trim()); };
    // account / login: demo → apre Kaya
    ["#hrAccount", "#tbLogin", "#tbRegister"].forEach(sel => { const el = $(sel); if (el) el.onclick = e => { e.preventDefault(); openChat(); }; });
    // barra sticky mobile → apre il carrello
    $("#mbCta").onclick = openCart;
    $("#mobileBar").onclick = e => { if (e.target.id !== "mbCta") openCart(); };
    // newsletter: cattura email → codice sconto
    $("#nlForm").onsubmit = e => {
      e.preventDefault();
      const email = $("#nlEmail").value.trim();
      if (!email) return;
      $("#nlForm").hidden = true;
      const th = $("#nlThanks");
      th.textContent = D.marketing.newsletter.thanks[LANG] || D.marketing.newsletter.thanks.es;
      th.hidden = false;
      pingSound();
    };
    $("#chatMin").onclick = minimizeChat;
    $("#chatForm").onsubmit = e => {
      e.preventDefault();
      const v = $("#chatInput").value.trim();
      if (!v) return;
      $("#chatInput").value = "";
      handleUser(v);
    };
    // exit popup
    const closeExit = () => { $("#exitPopup").hidden = true; stopExitCountdown(); };
    $("#exitClose").onclick = closeExit;
    $("#exitPopup").onclick = e => { if (e.target.id === "exitPopup") closeExit(); }; // tocca lo sfondo per chiudere
    $("#exitCta").onclick = () => {
      $("#exitPopup").hidden = true; stopExitCountdown();
      openChat();
      setTimeout(() => botMsg({ es: "¡Código KAYA10 activado! 🎉 Te aplico el 10%. ¿Empezamos por algo para liar o CBD?", en: "Code KAYA10 activated! 🎉 10% is on. Shall we start with rolling gear or CBD?", it: "Codice KAYA10 attivato! 🎉 Applico il 10%. Partiamo da qualcosa per rollare o dal CBD?" }[LANG], 400), 300);
    };
  }

  /* =========================================================
     WIDGET / MULTI-TENANT — modalità embeddabile + config da URL
     ========================================================= */
  // applica una config-cliente (brand, prodotti, categorie) al motore generico
  function mergeTenant(p) {
    if (!p || !window.KF_DATA) return;
    if (p.products) KF_DATA.products = p.products;
    if (p.catLabels) KF_DATA.catLabels = p.catLabels;
    if (p.mode) KF_DATA.mode = p.mode;           // "lead" = servizi/prenotazione, "shop" = e-commerce
    if (p.lead) KF_DATA.lead = p.lead;           // { whatsapp, phone, bookText, cta }
    if (p.character !== undefined) KF_DATA.character = p.character;   // {rest,point,pointBack,thumb,blink,face,finger} oppure false = nessuna mascotte
    if (p.askName !== undefined) KF_DATA.askName = p.askName;   // chiedere il nome a inizio chat (default sì)
    if (p.remember !== undefined) KF_DATA.remember = p.remember;   // memoria cliente via localStorage (default sì); false = disattiva
    if (p.knowledge) KF_DATA.knowledge = p.knowledge;              // "sapere insegnato" dal titolare (pagina Allena): [{keys:[], a:"", safe:true}]
    if (p.safetyNote) KF_DATA.safetyNote = p.safetyNote;          // nota di sicurezza CBD appesa alle risposte con safe:true ("solo da collezione…")
    if (p.dark !== undefined) KF_DATA.dark = p.dark;            // tema chat scuro/chiaro come il sito
    if (p.bg) KF_DATA.bg = p.bg;                                // colore di sfondo del sito → superficie chat
    if (p.accent) KF_DATA.accent = p.accent;
    if (p.logo) KF_DATA.logo = p.logo;                          // logo del brand (filigrana di sfondo chat)
    if (p.nameQ) KF_DATA.nameQ = p.nameQ;                       // domanda del nome su misura del brand
    if (p.acks) KF_DATA.acks = p.acks;                          // tono di settore: reazioni "ti ho ascoltato" su misura
    if (p.emergency !== undefined) KF_DATA.emergency = p.emergency;   // false = disattiva il flusso "emergenza/panne→umano" (settori senza urgenze, es. agenzia)
    if (p.askHint) KF_DATA.askHint = p.askHint;                       // suggerimento del fallback su misura del settore (no esempi da officina)
    if (p.problemEmpathy) KF_DATA.problemEmpathy = p.problemEmpathy;  // frasi empatiche sui problemi su misura (senza "🔧")
    if (p.emoji) Object.assign(emoji, p.emoji);                       // icone segnaposto per categoria (evita la 🔧 di default fuori dall'officina)
    if (p.itemEmoji) KF_DATA.itemEmoji = p.itemEmoji;                 // icona segnaposto generica del settore
    // etichetta "scelta consigliata" sulla card hero: neutra per ogni tenant (evita la "La scelta di Kaya" del config base), override via p.pick
    KF_DATA.seller = Object.assign({}, KF_DATA.seller, { pick: p.pick || { es: "Mi elección", it: "La mia scelta", en: "My pick" } });
    if (p.crossSell) KF_DATA.crossSell = p.crossSell;   // mappa abbinamenti cross-sell (bottega/food): categoria → complemento + frase di vendita
    if (p.ctaAdd) KF_DATA.ctaAdd = p.ctaAdd;            // etichetta "aggiungi" delle card in modalità cross-sell
    if (p.prepInstructions) KF_DATA.prepInstructions = p.prepInstructions;   // istruzioni di cottura per prodotto (piatti pronti)
    if (p.persona) KF_DATA.persona = Object.assign({}, KF_DATA.persona, p.persona);   // nome+ruolo del venditore
    if (p.profiling) KF_DATA.profiling = p.profiling;   // override domande (es. problema auto per Lead)
    if (p.categoryOptions && KF_DATA.profiling && KF_DATA.profiling[2]) KF_DATA.profiling[2].options = p.categoryOptions;
    KF_DATA.cbd = p.cbd || null;  // pacchetto-nicchia CBD off di default (motore generico)
    if (!p.cbd && KF_DATA.profiling && KF_DATA.profiling[0] && KF_DATA.profiling[0].options) KF_DATA.profiling[0].options = KF_DATA.profiling[0].options.filter(o => o.val !== "cbd");
    if (p.greeting) {
      KF_DATA.greetings = typeof p.greeting === "string" ? { es: p.greeting, en: p.greeting, it: p.greeting } : p.greeting;
    } else if (p.brand) {
      const B = p.brand;
      KF_DATA.greetings = {
        es: `¡Hola y bienvenido a ${B}! 👋 Soy tu asistente. Para aconsejarte mejor, ¿te hago un par de preguntas rápidas?`,
        en: `Hi and welcome to ${B}! 👋 I'm your assistant. To advise you better, can I ask a couple of quick questions?`,
        it: `Ciao e benvenuto da ${B}! 👋 Sono il tuo assistente. Per consigliarti meglio, posso farti un paio di domande veloci?`
      };
    }
    if (p.brand) {
      if (KF_DATA.site) KF_DATA.site.bannerKicker = { es: p.brand, en: p.brand, it: p.brand };
      KF_DATA._brand = p.brand;
      if (KF_DATA.persona && !p.persona) KF_DATA.persona.role = { es: "tu asistente", en: "your assistant", it: "il tuo assistente" };
    }
  }
  // link prenotazione WhatsApp (modalità Lead)
  function bookUrl(serviceName) {
    const L = KF_DATA.lead || {};
    const txt = encodeURIComponent((L.bookText || "Ciao! Vorrei prenotare per: ") + (serviceName || ""));
    if (L.whatsapp) return "https://wa.me/" + L.whatsapp.replace(/[^0-9]/g, "") + "?text=" + txt;
    if (L.phone) return "tel:" + L.phone.replace(/[^0-9+]/g, "");
    return null;
  }
  // apre la prenotazione WhatsApp E segnala l'evento "lead" al sito ospite (tracciamento, separato dal WhatsApp del sito)
  function openBooking(serviceName) {
    const u = bookUrl(serviceName); if (!u) return;
    try { parent.postMessage({ aiseller: "lead", service: serviceName || "", brand: KF_DATA._brand || "" }, "*"); } catch (e) {}
    window.open(u, "_blank");
  }
  // apre DIRETTAMENTE una pagina (link del servizio/opzione) invece della prenotazione WhatsApp — e traccia l'evento
  function openLink(url, label) {
    if (!url) return;
    try { parent.postMessage({ aiseller: "lead", service: label || "", brand: KF_DATA._brand || "" }, "*"); } catch (e) {}
    window.open(url, "_blank");
  }
  // opzione di profilazione/menu che porta DIRETTO a una pagina: se ha un link lo apre e ferma il flusso chat
  function optionLink(o) {
    if (!o || !o.link) return false;
    userMsg(o[LANG]);
    openLink(o.link, o.val || o[LANG]);
    return true;
  }
  function isLead() { return KF_DATA.mode === "lead"; }

  /* ===== CROSS-SELL "costruisci il tuo piatto" (modalità lead + D.crossSell) =====
     Neuromarketing: scegli un prodotto → abbino il complemento perfetto → propongo la portata
     successiva → "ordina tutto" su WhatsApp con la lista completa. Attivo SOLO se la config
     definisce D.crossSell, così officina/agenzia restano col flusso prenotazione classico. */
  function hasCrossSell() { return isLead() && D.crossSell && typeof D.crossSell === "object"; }
  function listaText() { return state.lista.map(i => "• " + i.name).join("\n"); }
  function checkoutLabel() {
    const n = state.lista.length;
    return tline({ es: "🛒 Encargar (" + n + ") por WhatsApp", it: "🛒 Ordina (" + n + ") su WhatsApp", en: "🛒 Order (" + n + ") on WhatsApp" });
  }
  function bestProductOf(cat) {
    const inLista = (nm) => state.lista.some(i => i.name === nm);
    const pool = (D.products || []).filter(p => p.category === cat && !inLista(p.name));
    pool.sort((a, b) => ((b.badge ? 1 : 0) - (a.badge ? 1 : 0)));
    return pool[0] || null;
  }

  /* ===== SKILL ABBINAMENTI (cucina italiana) =====
     Per ogni prodotto sa il complemento GIUSTO (tradizione), in ordine di priorità.
     L'engine poi cerca il primo complemento DISPONIBILE in catalogo. Mai abbinamenti sbagliati
     (es. niente pesto sui cappellacci di zucca). Le parole in "w" si cercano nei nomi/keys dei prodotti. */
  var FOOD_PAIRINGS = [
    { m: /cappellacci|tortell\w*\s*(di\s*)?(zucca|calabaza)|ravioli?\s*(di\s*)?(zucca|calabaza)|zucca|calabaza|pumpkin/i,
      w: ["burro", "salvia", "amaretti", "parmigiano", "grana", "ragù", "ragu", "speck", "tartufo", "trufa", "nuez", "noci"],
      why: { es: "el dulce de la calabaza pide mantequilla y salvia, no pesto", it: "il dolce della zucca chiede burro e salvia, mai il pesto", en: "pumpkin's sweetness wants butter & sage, never pesto" } },
    { m: /(ravioli?|tortell\w*|pasta|gnocch\w*)\s.*\b(trufa|tartufo|truffle)\b|\b(trufa|tartufo|truffle)\b.*\b(ravioli?|pasta)\b/i,
      w: ["burro", "parmigiano", "grana", "panna", "trebbiano", "vino"],
      why: { es: "con trufa, mejor mantequilla y parmesano para no taparla", it: "col tartufo meglio burro e parmigiano, per non coprirlo", en: "with truffle, butter & parmesan so you don't mask it" } },
    { m: /ravioli?\s.*\b(carne|brasato|stracotto|manzo|ossobuco|ragu|ragù|salsiccia)\b/i,
      w: ["ragù", "ragu", "arrosto", "burro", "tartufo", "trufa", "funghi", "porcini", "parmigiano", "tinto", "nero", "montepulciano", "primitivo"],
      why: { es: "la carne pide un ragú o mantequilla, y un tinto", it: "la carne chiede un ragù o burro, e un rosso", en: "meat wants ragù or butter, and a red wine" } },
    { m: /ravioli?\s.*\b(ricotta|spinaci|espinac|magro|verdura|formaggi|queso|nervetti)\b|tortell\w*\s.*ricotta/i,
      w: ["burro", "salvia", "pomodoro", "tomate", "pomodorini", "parmigiano", "noci", "ragù"],
      why: { es: "ricotta y espinacas: mantequilla y salvia o un tomate ligero", it: "ricotta e spinaci: burro e salvia o un pomodoro leggero", en: "ricotta & spinach: butter & sage or a light tomato" } },
    { m: /tortellin|cappellett|anolini|agnolotti/i,
      w: ["brodo", "panna", "ragù", "ragu", "parmigiano", "burro"],
      why: { es: "el tortellino brilla en caldo o con nata y parmesano", it: "il tortellino dà il meglio in brodo o panna e parmigiano", en: "tortellini shine in broth or cream & parmesan" } },
    { m: /ravioli?|tortell\w*|cappellacci|fagottini|caramelle|mezzelune|girasoli/i,
      w: ["burro", "salvia", "pomodoro", "tomate", "ragù", "ragu", "parmigiano", "panna"],
      why: { es: "la pasta rellena delicada pide mantequilla y salvia o un buen tomate", it: "la pasta ripiena delicata chiede burro e salvia o un buon pomodoro", en: "delicate filled pasta wants butter & sage or a good tomato" } },
    { m: /tagliatell|fettuccin|pappardell|tagliolini|tajarin|maccheroni|garganelli/i,
      w: ["ragù", "ragu", "funghi", "porcini", "tartufo", "trufa", "arrosto", "panna", "burro", "bolognese"],
      why: { es: "la pasta al huevo pide ragú, hongos o trufa", it: "la pasta all'uovo chiede ragù, funghi o tartufo", en: "egg pasta wants ragù, mushrooms or truffle" } },
    { m: /trofie|trenette|linguine|troccoli|bavette|spaghett/i,
      w: ["pesto", "genoves", "genovés", "trapanese", "pomodoro", "tomate", "vongole"],
      why: { es: "trofie y trenette son la casa del pesto", it: "trofie e trenette sono la casa del pesto", en: "trofie & trenette are pesto's home" } },
    { m: /gnocch/i,
      w: ["gorgonzola", "ragù", "ragu", "pomodoro", "tomate", "burro", "salvia", "pesto", "quattro formaggi", "fontina"],
      why: { es: "los ñoquis aman el gorgonzola, el ragú o el tomate", it: "gli gnocchi amano gorgonzola, ragù o pomodoro", en: "gnocchi love gorgonzola, ragù or tomato" } },
    { m: /lasagn|cannellon|canelon|parmigiana|berenjena|melanzan|plato\s*preparado|preparado|rotolo/i,
      w: ["tinto", "nero", "montepulciano", "primitivo", "vino", "postre", "dolce", "tiramisu", "ensalada", "pane"],
      combo: [["tinto", "nero", "montepulciano", "primitivo", "vino", "biodin", "lambrusco"], ["postre", "dolce", "tiramisu", "cannoli", "zeppole", "pastel", "tarta", "dulce"]],
      why: { es: "un plato listo pide un buen vino y, de postre, algo dulce", it: "un piatto pronto chiede un buon vino e, per finire, un dolce", en: "a ready dish wants a good wine and a dessert to finish" } },
    { m: /\bpesto\b/i, w: ["trofie", "trenette", "gnocchi", "parmigiano", "vermentino", "blanco"], why: null },
    { m: /rag[uù]|bolognese/i, w: ["tagliatelle", "pappardelle", "gnocchi", "parmigiano", "tinto", "nero", "montepulciano", "primitivo"], why: null },
    { m: /tomate|pomodoro|tomato|arrabbiata|amatriciana/i, w: ["gnocchi", "pasta", "parmigiano", "ricotta", "albahaca", "burrata"], why: null },
    { m: /embutido|salumi|mortadella|prosciutto|jam[oó]n|salami|speck|bresaola|culatello|coppa|'nduja/i,
      w: ["queso", "parmigiano", "pecorino", "pane", "focaccia", "tinto", "nero", "montepulciano", "lambrusco"],
      why: { es: "una tabla de embutidos pide quesos, pan y un tinto", it: "un tagliere di salumi chiede formaggi, pane e un rosso", en: "a cured meats board wants cheeses, bread and a red" } },
    { m: /queso|formaggi|parmigiano|pecorino|gorgonzola|mozzarella|burrata|grana|taleggio/i,
      w: ["tinto", "nero", "montepulciano", "miel", "mostarda", "pane", "embutido", "pera", "nuez"],
      why: { es: "el queso pide un buen vino, miel o pan", it: "il formaggio chiede un buon vino, miele o pane", en: "cheese wants a good wine, honey or bread" } },
    { m: /trufa|tartufo|truffle/i,
      w: ["tagliatelle", "ravioli", "pasta", "huevo", "uova", "parmigiano", "burro", "mantequilla"],
      why: { es: "la trufa luce sobre pasta fresca, huevo o mantequilla", it: "il tartufo brilla su pasta fresca, uovo o burro", en: "truffle shines on fresh pasta, egg or butter" } },
    { m: /vino|tinto|birra|cerveza|nero|montepulciano|primitivo|trebbiano|lambrusco/i,
      w: ["queso", "embutido", "salumi", "postre", "dolce", "tiramisu"], why: null }
  ];
  function _norm(s) { return String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }   // minuscolo + senza accenti (ragù = ragú = ragu)
  function nameHit(prod, kw) {
    var hay = _norm((prod.name || "") + " " + (Array.isArray(prod.keys) ? prod.keys.join(" ") : "") + " " + (prod.category || ""));
    return hay.indexOf(_norm(kw)) >= 0;
  }
  function pairEntry(p) {
    var hay = (p.name || "") + " " + (p.category || "") + " " + (Array.isArray(p.keys) ? p.keys.join(" ") : "");
    for (var i = 0; i < FOOD_PAIRINGS.length; i++) { try { if (FOOD_PAIRINGS[i].m.test(hay)) return FOOD_PAIRINGS[i]; } catch (e) {} }
    return null;
  }
  // sceglie il complemento GIUSTO e DISPONIBILE — MAI la stessa categoria (un raviolo non si abbina a un raviolo)
  function bestComplement(p) {
    var entry = pairEntry(p), kws = entry ? entry.w : [];
    var inLista = function (n) { return state.lista.some(function (it) { return it.name === n; }); };
    var rule = (D.crossSell || {})[p.category];
    // 1) categoria-complemento dalla config (es. Pasta fresca → Salsas) — è SEMPRE una categoria diversa
    if (rule && rule.suggest && rule.suggest !== p.category) {
      var pool = (D.products || []).filter(function (q) { return q.category === rule.suggest && !inLista(q.name); });
      if (pool.length) {
        for (var i = 0; i < kws.length; i++) {                                   // tra i complementi, scegli il culinariamente giusto (es. ragù per ravioli di carne)
          var hit = pool.find(function (q) { return nameHit(q, kws[i]); });
          if (hit) return { product: hit, entry: entry };
        }
        pool.sort(function (a, b) { return (b.badge ? 1 : 0) - (a.badge ? 1 : 0); });
        return { product: pool[0], entry: null, ruleP: rule.pitch };             // altrimenti il migliore del reparto, con la frase della config
      }
    }
    // 2) fallback: parole culinarie su tutto il catalogo, ma MAI la stessa categoria del prodotto scelto
    for (var j = 0; j < kws.length; j++) {
      var cand = (D.products || []).find(function (q) { return q.category !== p.category && !inLista(q.name) && nameHit(q, kws[j]); });
      if (cand) return { product: cand, entry: entry };
    }
    // 3) ultima spiaggia: regola di categoria semplice
    if (rule && rule.suggest && rule.suggest !== p.category) { var sug = bestProductOf(rule.suggest); if (sug) return { product: sug, entry: null, ruleP: rule.pitch }; }
    return null;
  }
  // trova il primo prodotto disponibile per un gruppo di parole-chiave (per il combo vino+dolce)
  function bestFromKeywords(kws) {
    for (var i = 0; i < kws.length; i++) {
      var cand = (D.products || []).find(function (q) { return !state.lista.some(function (it) { return it.name === q.name; }) && nameHit(q, kws[i]); });
      if (cand) return cand;
    }
    return null;
  }
  function buildComboPitch(p) {
    if (LANG === "es") return "Para completar " + p.name + ": un buen vino 🍷 y, de postre, algo dulce 🍰 👇";
    if (LANG === "en") return "To round off " + p.name + ": a good wine 🍷 and a dessert to finish 🍰 👇";
    return "Per completare " + p.name + ": un buon vino 🍷 e, per finire, un dolce 🍰 👇";
  }
  // frase di vendita che SPIEGA l'abbinamento (suona da esperto)
  function buildPairPitch(p, sug, entry) {
    var why = entry && entry.why ? (entry.why[LANG] || entry.why.it || "") : "";
    var tail = why ? " — " + why : "";
    if (LANG === "es") return "Con " + p.name + ", te pega perfecto " + sug.name + tail + " 👌";
    if (LANG === "en") return "With " + p.name + ", " + sug.name + " is the perfect match" + tail + " 👌";
    return "Con " + p.name + ", ci sta perfetto " + sug.name + tail + " 👌";
  }
  // mostra i prodotti del reparto (fino a 6) con "Aggiungi" — punto di partenza del flusso
  async function browseCategory(cat) {
    state.flow = "free";
    clearQuick();
    updateCartBar();   // se hai già una lista, la barra resta in primo piano
    $("#chatProg").hidden = true;
    let pool = (D.products || []).filter(p => !cat || cat === "any" || p.category === cat);
    pool.sort((a, b) => ((b.badge ? 1 : 0) - (a.badge ? 1 : 0)));
    if (!pool.length) { offerFreeQuick(); return; }
    const cl = catLabel(cat);
    await botMsg(tline({ es: "Esto tenemos hoy en " + cl + " 👇 ¿Cuál te llevas?", it: "Ecco cosa abbiamo oggi in " + cl + " 👇 Quale prendi?", en: "Here's what we have today in " + cl + " 👇 Which one?" }), 600);
    pool.slice(0, 6).forEach(p => productCard(p, false));
    offerCheckout(false);
  }
  // aggiunge alla lista e propone l'abbinamento (catena cross-sell)
  async function addToLista(p) {
    if (!state.lista.some(i => i.name === p.name)) state.lista.push({ name: p.name, category: p.category });
    memRecordItem(p, false);   // memoria cliente: segna l'interesse per questo prodotto
    updateCartBar();   // la barra carrello fissa si aggiorna subito (sempre in primo piano)
    await botMsg(tline({ es: "Añadido: " + p.name + " ✅", it: "Aggiunto: " + p.name + " ✅", en: "Added: " + p.name + " ✅" }), 450);
    var prep = prepFor(p);
    if (prep) await botMsg(tline(prep), 700);   // istruzioni di cottura (piatti pronti monoporzione)
    await suggestNext(p);
  }
  // istruzioni di preparazione/cottura per prodotto (da config D.prepInstructions: [{match, text{es,it,en}}])
  function prepFor(p) {
    var list = D.prepInstructions; if (!Array.isArray(list)) return null;
    var hay = (p.name || "") + " " + (p.category || "") + " " + (Array.isArray(p.keys) ? p.keys.join(" ") : "");
    for (var i = 0; i < list.length; i++) { try { if (new RegExp(list[i].match, "i").test(hay)) return list[i].text; } catch (e) {} }
    return null;
  }
  // barra carrello SEMPRE visibile (nel footer, separata dalle quick-reply): "Invia il mio ordine (N)"
  function ensureCartBar() {
    if (!hasCrossSell()) return null;
    var bar = document.getElementById("chatCart");
    if (!bar) {
      bar = document.createElement("button");
      bar.id = "chatCart"; bar.type = "button"; bar.className = "chat-cart"; bar.hidden = true;
      bar.onclick = function () { listaCheckout(); };
      var inner = document.querySelector(".chat-inner"), form = document.querySelector("#chatForm");
      if (inner && form) inner.insertBefore(bar, form);
    }
    return bar;
  }
  function updateCartBar() {
    var bar = ensureCartBar(); if (!bar) return;
    var n = state.lista.length;
    if (n > 0) {
      bar.innerHTML = tline({ es: "🛒 Enviar mi pedido", it: "🛒 Invia il mio ordine", en: "🛒 Send my order" }) + " <b>(" + n + ")</b>";
      bar.style.background = KF_DATA.accent || "#e8b84f";
      bar.hidden = false;
      bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "cartBump .35s ease";   // un tocco gentile a ogni aggiunta, niente pulsazione continua
    } else { bar.hidden = true; }
  }
  // l'abbinamento: legge D.crossSell[categoria] → propone il complemento con una frase di vendita
  async function suggestNext(p) {
    // ANTI-ANSIA: non insistere. Dopo 2 proposte, o se l'utente ha detto "no", smetti di spingere.
    if (state.noMorePush || state.suggestCount >= 2) return offerCheckout(false);
    state.suggestCount++;
    var firstTime = state.suggestCount === 1;   // la mascotte indica SOLO la prima volta
    // COMBO (piatto pronto): proponi VINO + DOLCE insieme
    var entry = pairEntry(p);
    if (entry && entry.combo) {
      var picks = [], seen = {};
      entry.combo.forEach(function (grp) { var c = bestFromKeywords(grp); if (c && !seen[c.name]) { seen[c.name] = true; picks.push(c); } });
      if (picks.length) {
        await botMsg(buildComboPitch(p), 750);
        var firstEl = null;
        picks.forEach(function (sg, i) { var el = productCard(sg, i === 0); if (i === 0) firstEl = el; });
        quickReplies([{ label: tline({ es: "No, gracias · seguir 🧺", it: "No, grazie · continua 🧺", en: "No, thanks · keep browsing 🧺" }), onClick: function () { state.noMorePush = true; showCategoryMenu(); } }]);
        if (hasCharacter() && firstEl && firstTime) {
          spotlightPick(firstEl, picks[0]);
          setTimeout(function () { var pn = $("#chatPanel"); if (pn && pn.classList.contains("pointing")) hidePointer(); }, 4800);
        }
        return;
      }
    }
    const found = bestComplement(p);
    if (!found || !found.product) return offerCheckout(true);
    const sug = found.product;
    await botMsg(found.ruleP ? tline(found.ruleP) : buildPairPitch(p, sug, found.entry), 750);
    const card = productCard(sug, true);   // card tentatrice; il suo "Aggiungi" continua la catena
    quickReplies([
      { label: tline({ es: "No, gracias · seguir 🧺", it: "No, grazie · continua 🧺", en: "No, thanks · keep browsing 🧺" }), onClick: () => { state.noMorePush = true; showCategoryMenu(); } }
    ]);
    if (hasCharacter() && firstTime) {   // la mascotte indica SOLO la prima volta (meno insistenza)
      spotlightPick(card, sug);
      setTimeout(function () { var pn = $("#chatPanel"); if (pn && pn.classList.contains("pointing")) hidePointer(); }, 4800);
    }
  }
  // proposta di chiusura: "ordina tutto" + continua a guardare
  async function offerCheckout(withPitch) {
    if (withPitch && state.lista.length) await botMsg(tline({ es: "Cuando quieras, dale a 🛒 ahí abajo y te envío el pedido 👇", it: "Quando vuoi, premi 🛒 qui sotto e ti invio l'ordine 👇", en: "Whenever you're ready, tap 🛒 below and I'll send your order 👇" }), 600);
    quickReplies([{ label: tline({ es: "Seguir mirando 🧺", it: "Continua a guardare 🧺", en: "Keep browsing 🧺" }), onClick: () => showCategoryMenu() }]);
  }
  // invia la LISTA completa su WhatsApp (un solo messaggio, ordinabile/ritirabile)
  function listaCheckout() {
    const L = KF_DATA.lead || {};
    if (!state.lista.length) { openBooking(""); return; }
    const body = (L.bookText || "Hola, quiero encargar:") + "\n" + listaText();
    let u = null;
    if (L.whatsapp) u = "https://wa.me/" + L.whatsapp.replace(/[^0-9]/g, "") + "?text=" + encodeURIComponent(body);
    else if (L.phone) u = "tel:" + L.phone.replace(/[^0-9+]/g, "");
    if (!u) return;
    state.lista.forEach(function (i) { memRecordItem(i, true); });   // memoria cliente: ordine inviato = segnale forte
    try { parent.postMessage({ aiseller: "lead", service: state.lista.map(i => i.name).join(", "), brand: KF_DATA._brand || "" }, "*"); } catch (e) {}
    window.open(u, "_blank");
  }
  function hasCharacter() { return KF_DATA.character !== false; }
  // filigrana sullo sfondo della chat (tocco professionale): logo del brand, o in mancanza il viso del personaggio
  function applyWatermark() {
    const c = KF_DATA.character;
    const mark = safeImg(KF_DATA.logo) || safeImg(c && typeof c === "object" && (c.face || c.thumb)) || "";
    if (!mark) return;   // safeImg scarta URL non http(s)/data:image o con caratteri pericolosi (anti CSS-injection)
    document.documentElement.style.setProperty("--chat-logo", "url('" + mark + "')");
    document.body.classList.add("has-watermark");
  }
  // applica la mascotte del tenant (immagini da config) o la nasconde (character:false)
  function applyCharacter() {
    const c = KF_DATA.character;
    // pallina/launcher chiuso: icona neutra se non c'è personaggio (così non resta il viso di Kaya)
    const NEUTRAL = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#6c4cff"/><path d="M12 6c-3.3 0-6 2.2-6 5 0 1.4.7 2.7 1.8 3.6L7 18l3-1c.6.1 1.3.2 2 .2 3.3 0 6-2.2 6-5s-2.7-5-6-5z" fill="#fff"/></svg>');
    if (c === false) {
      document.body.classList.add("no-character");
      const lf = $("#chatLauncher img"); if (lf) lf.src = NEUTRAL;
      return;
    }
    if (c && typeof c === "object") {
      const set = (sel, url) => { const el = $(sel); if (el && url) el.src = url; };
      set(".chat-seller", c.rest);
      set(".chat-seller-blink", c.blink || c.rest);
      set(".cp-ext", c.point);
      set(".cp-bent", c.pointBack || c.point);
      set(".cp-thumb", c.thumb || c.point);
      set(".age-mascot", c.face || c.rest);
      set("#chatLauncher img", c.face || c.rest);   // viso del personaggio sulla pallina chiusa
      // adatta le proporzioni del rig al personaggio caricato (evita il letterbox)
      const rig = $(".chat-pointer");
      if (c.w && c.h) {
        const ar = c.w + " / " + c.h;
        if (rig) rig.style.aspectRatio = ar;
        const wrap = $(".chat-seller-wrap"); if (wrap) wrap.style.aspectRatio = ar;
      }
      // verso dell'indicazione: i personaggi caricati di default NON sono specchiati
      // (puntano già verso il prodotto). flip:true = specchia (come la demo Kaya).
      if (rig) rig.style.setProperty("--flip", c.flip === true ? "-1" : "1");
    }
  }
  // applica il TEMA colori del sito ospite (accent dal brand) — chat neutra + accento del cliente
  function applyTheme(accent, paper, head) {
    const r = document.documentElement.style;
    if (accent) { r.setProperty("--chat-accent", accent); r.setProperty("--chat-accent-2", accent); }
    if (paper) r.setProperty("--chat-paper", paper);
    if (head) r.setProperty("--chat-head", head);
  }
  // schiarisce/scurisce un hex di una quantità (per derivare bolle/header dalla superficie)
  function shift(hex, amt) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || ""); if (!m) return hex;
    const n = parseInt(m[1], 16); let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.max(0, Math.min(255, Math.round(v + amt)));
    const to = v => { v = f(v).toString(16); return v.length < 2 ? "0" + v : v; };
    return "#" + to(r) + to(g) + to(b);
  }
  // TEMA CHAT = TEMA DEL SITO: scura coi colori del sito (si fonde) o chiara, + accento del brand
  function applyChatTheme(accent) {
    const r = document.documentElement.style;
    if (accent) { r.setProperty("--chat-accent", accent); r.setProperty("--chat-accent-2", accent); }
    if (KF_DATA.dark) {
      document.body.classList.add("chat-dark");
      const surface = (KF_DATA.bg && /^#?[0-9a-f]{6}$/i.test(KF_DATA.bg)) ? (KF_DATA.bg[0] === "#" ? KF_DATA.bg : "#" + KF_DATA.bg) : "#12161e";
      r.setProperty("--chat-paper", surface);                 // corpo chat = sfondo del sito
      r.setProperty("--chat-head", shift(surface, -10));      // header un filo più scuro
      r.setProperty("--chat-bubble", shift(surface, 22));     // bolle/card un filo più chiare
    } else {
      document.body.classList.remove("chat-dark");
      r.setProperty("--chat-paper", "#ffffff");
      r.setProperty("--chat-head", "#f5f6f8");
      r.setProperty("--chat-bubble", "#ffffff");
    }
  }
  // modalità widget: solo la chat (niente storefront), sfondo trasparente, auto-aperta, dialoga col sito ospite
  function initWidgetMode() {
    document.body.classList.add("widget-mode");
    enterSite();          // sblocca senza age-gate (nicchie 18+ gestite via config in futuro)
    openChat();
    const close = () => { try { parent.postMessage({ aiseller: "close" }, "*"); } catch (e) {} };
    const min = $("#chatMin"); if (min) min.onclick = close;
    if (KF_DATA._brand) { const b = $("#chatTitle"); if (b) b.textContent = KF_DATA._brand; }
    try { parent.postMessage({ aiseller: "ready" }, "*"); } catch (e) {}
  }
  async function boot() {
    const P = new URLSearchParams(location.search);
    // anti-flash: in widget nascondi lo storefront PRIMA di scaricare la config (niente lampo di Kaya)
    if (P.has("widget")) {
      document.body.classList.add("widget-mode");
      // anti-flash PERSONAGGIO: svuota SUBITO (prima del fetch) le immagini di default (Kaya),
      // così durante il caricamento della config non lampeggia il primo personaggio. applyCharacter() poi mette quelle del cliente.
      const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      document.querySelectorAll("#chatLauncher img, .chat-seller, .chat-seller-blink, .cp-ext, .cp-bent, .cp-thumb, .age-mascot, .hero-mascot").forEach(el => { el.src = BLANK; });
    }
    let cfg = null;
    // ANTEPRIMA dallo Studio: config completa salvata in localStorage (mode/personaggio/lead/prodotti)
    if (P.has("preview")) {
      try { cfg = JSON.parse(localStorage.getItem("AISELLER_PREVIEW") || "null"); } catch (e) { console.warn("preview parse", e); }
    } else {
      const cfgUrl = P.get("config");
      if (cfgUrl) { try { cfg = await (await fetch(cfgUrl)).json(); } catch (e) { console.warn("config load", e); } }
    }
    if (cfg) mergeTenant(cfg);
    init();
    applyCharacter();   // mascotte del tenant (o nessuna)
    applyWatermark();   // filigrana logo sullo sfondo chat (se presente)
    if (P.has("widget")) {
      // tema chat = tema del sito ospite (scuro/chiaro + colori) → si fonde, look professionale
      applyChatTheme(P.get("accent") || (cfg && cfg.accent) || KF_DATA.accent || "#6c4cff");
      initWidgetMode();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
