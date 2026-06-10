/* AI Seller · widget integrabile (Black Star). Una riga sul sito del cliente:
   <script src="https://.../widget.js" data-config="https://.../config.json" defer></script>
   Carica solo una bollina leggera col VISO del personaggio; la chat parte in un iframe isolato al primo click.
   Quando è chiusa e inattiva, manda piccoli richiami (teaser) per riagganciare il cliente. Made in Italy. */
(function () {
  "use strict";
  var script = document.currentScript || (function () { var s = document.getElementsByTagName("script"); return s[s.length - 1]; })();
  if (!script || window.__AISELLER__) return;
  window.__AISELLER__ = true;

  var APP = new URL(script.src);
  // base = cartella che contiene widget.js (funziona su Cloudflare Pages, sottocartelle o dominio custom)
  var base = script.src.replace(/\/widget\.js(\?.*)?$/i, "");
  if (!base || base === script.src) base = APP.origin;       // fallback
  var cfg = script.getAttribute("data-config") || "";        // URL config (opzionale: di norma si auto-rileva)
  if (cfg && !/^https?:\/\//i.test(cfg)) cfg = base + (cfg[0] === "/" ? "" : "/") + cfg;
  // AUTO-RILEVAMENTO CLIENTE dal dominio → snippet UNIVERSALE (una riga uguale per tutti, non cambia MAI).
  // Per un nuovo cliente: aggiungo una riga qui sotto e basta — il sito del cliente non si tocca.
  // [match dominio, id config, colore, (opz.) regex percorso dove ATTIVARE il bot]
  var HOSTMAP = [
    ["blackstardigitalstudio", "blackstar",  "#a68732", null],
    ["gasproject",             "gasproject", "#0099b8", null],
    ["ilraviolo",              "ilraviolo",  "#e8b84f", /\/bottega/i],   // Il Raviolo: SOLO sezione /bottega
    ["mariowine",              "mariowine",  "#7b1e3b", null]
  ];
  var hostHit = null, _h = (location.hostname || "").toLowerCase();
  for (var hi = 0; hi < HOSTMAP.length; hi++) { if (_h.indexOf(HOSTMAP[hi][0]) >= 0) { hostHit = HOSTMAP[hi]; break; } }
  // cliente attivo solo su certe sezioni? fuori da lì il widget NON parte (niente pallina)
  if (hostHit && hostHit[3] && !hostHit[3].test(location.pathname || "")) return;
  if (!cfg && hostHit) cfg = base + "/clients/" + hostHit[1] + ".json";   // config dedotta dal dominio
  var color = script.getAttribute("data-color") || (hostHit ? hostHit[2] : "#6c4cff");
  var label = script.getAttribute("data-label") || "Parla con noi";
  var faceUrl = script.getAttribute("data-face") || "";      // avatar diretto (opzionale, evita il fetch)
  // posizione: data-position="left|right" (def. right), data-bottom / data-gap = distanze in px,
  // data-avoid="off" disattiva l'auto-evitamento dei bottoni flottanti già presenti sul sito.
  var side = (script.getAttribute("data-position") || "right").toLowerCase().indexOf("left") >= 0 ? "left" : "right";
  var gap = parseInt(script.getAttribute("data-gap"), 10); if (isNaN(gap)) gap = 20;
  var curBottom = parseInt(script.getAttribute("data-bottom"), 10); if (isNaN(curBottom)) curBottom = 20;
  var autoAvoid = (script.getAttribute("data-avoid") || "on") !== "off";
  var BTN = 64;

  var frame = null, open = false, conf = null, ring = null;

  // ---- motion graphics di richiamo (keyframes iniettate una volta) ----
  (function () {
    var s = document.createElement("style");
    s.textContent =
      "@keyframes aiseller-pop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.14)}100%{transform:scale(1);opacity:1}}" +
      "@keyframes aiseller-bounce{0%,100%{transform:translateY(0)}25%{transform:translateY(-13px)}45%{transform:translateY(0)}63%{transform:translateY(-6px)}82%{transform:translateY(0)}}" +
      "@keyframes aiseller-wiggle{0%,100%{transform:rotate(0)}15%{transform:rotate(-11deg)}30%{transform:rotate(9deg)}45%{transform:rotate(-6deg)}62%{transform:rotate(4deg)}80%{transform:rotate(-2deg)}}" +
      "@keyframes aiseller-ring{0%{transform:scale(.82);opacity:.28}70%{opacity:0}100%{transform:scale(2);opacity:0}}";
    (document.head || document.documentElement).appendChild(s);
  })();

  function isMobile() { return window.matchMedia("(max-width:560px)").matches; }
  function lang() { var l = (navigator.language || "it").slice(0, 2).toLowerCase(); return ["it", "es", "en"].indexOf(l) >= 0 ? l : "en"; }
  function style(el, o) { for (var k in o) el.style[k] = o[k]; }
  // tracciamento: manda l'evento all'analytics GIÀ presente sul sito del cliente (GA4 / GTM / Meta) — niente backend
  function track(name, params) {
    params = params || {};
    try { if (typeof window.gtag === "function") window.gtag("event", name, params); } catch (e) {}
    try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params)); } catch (e) {}
    try { if (typeof window.fbq === "function") window.fbq("trackCustom", name === "chat_lead" ? "ChatLead" : "ChatOpen", params); } catch (e) {}
  }

  // ---- bollina (launcher) ----
  var btn = document.createElement("button");
  btn.setAttribute("aria-label", label);
  style(btn, {
    position: "fixed", zIndex: 2147483000,
    width: "64px", height: "64px", borderRadius: "50%", border: "none", cursor: "pointer",
    background: "linear-gradient(135deg," + color + ",#8b6cff)", boxShadow: "0 10px 30px rgba(0,0,0,.28)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "transform .2s ease", padding: "0", overflow: "visible"
  });
  function applyPos() {
    btn.style.bottom = curBottom + "px";
    if (side === "left") { btn.style.left = gap + "px"; btn.style.right = "auto"; }
    else { btn.style.right = gap + "px"; btn.style.left = "auto"; }
    if (ring) {   // l'anello pulsante segue la pallina
      ring.style.bottom = curBottom + "px";
      if (side === "left") { ring.style.left = gap + "px"; ring.style.right = "auto"; }
      else { ring.style.right = gap + "px"; ring.style.left = "auto"; }
    }
  }
  applyPos();
  setChatGlyph();
  btn.onmouseenter = function () { btn.style.transform = "scale(1.06)"; };
  btn.onmouseleave = function () { btn.style.transform = "scale(1)"; };
  btn.onclick = function () { open ? hide() : show(); };

  // pallino-notifica (badge) sopra la bollina
  var dot = document.createElement("span");
  style(dot, {
    position: "absolute", top: "-2px", right: "-2px", minWidth: "18px", height: "18px",
    borderRadius: "9px", background: "#ff3b30", color: "#fff", fontSize: "11px", fontWeight: "700",
    lineHeight: "18px", textAlign: "center", padding: "0 4px", boxShadow: "0 2px 6px rgba(0,0,0,.3)",
    display: "none", fontFamily: "system-ui,-apple-system,sans-serif"
  });
  dot.textContent = "1";
  btn.appendChild(dot);

  function setChatGlyph() {
    btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 3C7 3 3 6.6 3 11c0 2.2 1 4.2 2.7 5.6L5 21l4.6-1.6c.8.2 1.6.3 2.4.3 5 0 9-3.6 9-8s-4-8-9-8z" fill="#fff"/><circle cx="8.5" cy="11" r="1.2" fill="' + color + '"/><circle cx="12" cy="11" r="1.2" fill="' + color + '"/><circle cx="15.5" cy="11" r="1.2" fill="' + color + '"/></svg>';
    if (dot) btn.appendChild(dot);
  }
  function setAvatar(url) {
    if (!url) return;
    btn.innerHTML = "";
    var img = document.createElement("img");
    img.src = url; img.alt = label;
    style(img, { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", objectPosition: "top center", display: "block", pointerEvents: "none" });
    img.onerror = function () { setChatGlyph(); };
    btn.appendChild(img);
    if (dot) btn.appendChild(dot);
    btn.style.background = "#fff";
    btn.style.border = "2px solid " + color;
  }
  function recolor() {
    if (ring) ring.style.background = color;
    if (btn.querySelector("img")) { btn.style.border = "2px solid " + color; }
    else { btn.style.background = "linear-gradient(135deg," + color + ",#8b6cff)"; setChatGlyph(); }
  }

  // ---- iframe della chat ----
  function iframeSrc() { return base + "/?widget=1" + (cfg ? "&config=" + encodeURIComponent(cfg) : "") + "&accent=" + encodeURIComponent(color); }
  function ensureFrame() {
    if (frame) return frame;
    frame = document.createElement("iframe");
    frame.src = iframeSrc();
    frame.title = "AI Seller"; frame.allow = "clipboard-write";
    frame.setAttribute("allowtransparency", "true");
    style(frame, { position: "fixed", zIndex: 2147483001, border: "0", background: "transparent", colorScheme: "normal", display: "none" });
    sizeFrame();
    document.body.appendChild(frame);
    window.addEventListener("resize", sizeFrame);
    return frame;
  }
  function sizeFrame() {
    if (!frame) return;
    if (isMobile()) style(frame, { inset: "0", left: "0", right: "0", top: "0", bottom: "0", width: "100%", height: "100%" });
    else if (side === "left") style(frame, { inset: "auto auto 0 0", right: "auto", top: "auto", width: "min(500px,100vw)", height: "min(780px, 96vh)", maxWidth: "100vw" });
    else style(frame, { inset: "auto 0 0 auto", left: "auto", top: "auto", width: "min(500px,100vw)", height: "min(780px, 96vh)", maxWidth: "100vw" });
  }
  function show() { ensureFrame(); frame.style.display = "block"; btn.style.display = "none"; open = true; hideTeaser(); dot.style.display = "none"; if (ring) ring.style.display = "none"; stopTeasers(); stopAttention(); track("chat_open", { ai_seller: (conf && conf.brand) || "" }); }
  function hide() { if (frame) frame.style.display = "none"; btn.style.display = "flex"; open = false; if (ring) ring.style.display = "block"; startAttention(); }

  window.addEventListener("message", function (e) {
    if (!e.data || !frame || e.source !== frame.contentWindow) return;   // accetta SOLO messaggi dal nostro iframe (anti-spoofing)
    if (e.data.aiseller === "close") hide();
    else if (e.data.aiseller === "lead") track("chat_lead", { service: e.data.service || "", ai_seller: e.data.brand || "" });
  });

  // ---- NOTIFICHE / TEASER: richiami quando è chiusa e inattiva (fidelizzazione) ----
  var DEFAULT_TEASERS = {
    it: ["👋 Posso aiutarti?", "Hai una domanda? Sono qui 😊", "Ci sono io se ti serve una mano 🙌"],
    es: ["👋 ¿Te ayudo?", "¿Tienes una duda? Estoy aquí 😊", "Aquí estoy si necesitas una mano 🙌"],
    en: ["👋 Need a hand?", "Got a question? I'm here 😊", "I'm here if you need me 🙌"]
  };
  var teaserEl = null, tTimer = null, shown = 0, tIdx = 0, teaserMsgs = DEFAULT_TEASERS[lang()];

  function startTeasers() {
    teaserMsgs = (conf && conf.teasers && (conf.teasers[lang()] || conf.teasers.it)) || DEFAULT_TEASERS[lang()];
    scheduleTeaser(4500);
  }
  function stopTeasers() { clearTimeout(tTimer); }
  function scheduleTeaser(ms) {
    clearTimeout(tTimer);
    tTimer = setTimeout(function () {
      if (open || shown >= 2 || document.hidden) { if (shown < 2) scheduleTeaser(20000); return; }
      showTeaser(teaserMsgs[tIdx % teaserMsgs.length]);
      tIdx++; shown++;
      if (shown < 2) scheduleTeaser(70000);
    }, ms);
  }
  function showTeaser(text) {
    hideTeaser();
    dot.style.display = "block";
    teaserEl = document.createElement("div");
    teaserEl.textContent = text;
    teaserEl.setAttribute("role", "button");
    style(teaserEl, {
      position: "fixed", zIndex: 2147483000, bottom: (curBottom + 8) + "px", maxWidth: "240px",
      background: "#fff", color: "#1a1a1a", padding: "11px 14px", borderRadius: "16px",
      boxShadow: "0 12px 30px rgba(0,0,0,.22)", cursor: "pointer",
      fontFamily: "system-ui,-apple-system,sans-serif", fontSize: "14px", fontWeight: "600", lineHeight: "1.3",
      borderLeft: "3px solid " + color, opacity: "0", transform: "translateY(8px) scale(.92)",
      transition: "opacity .25s ease, transform .3s cubic-bezier(.2,1.2,.3,1)"
    });
    var inset = gap + BTN + 12;   // sta a fianco della pallina, dal lato interno
    if (side === "left") { teaserEl.style.left = inset + "px"; teaserEl.style.right = "auto"; teaserEl.style.borderBottomLeftRadius = "5px"; }
    else { teaserEl.style.right = inset + "px"; teaserEl.style.left = "auto"; teaserEl.style.borderBottomRightRadius = "5px"; }
    if (isMobile()) { style(teaserEl, { bottom: (curBottom + BTN + 10) + "px", maxWidth: "62vw" }); teaserEl.style[side] = gap + "px"; }
    // chiudino della nuvoletta
    var x = document.createElement("span");
    x.textContent = "×";
    style(x, { position: "absolute", top: "-8px", right: "-8px", width: "20px", height: "20px", borderRadius: "50%", background: "#e9e9ee", color: "#555", fontSize: "14px", lineHeight: "20px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,.18)" });
    x.onclick = function (ev) { ev.stopPropagation(); hideTeaser(); };
    teaserEl.appendChild(x);
    teaserEl.onclick = function () { show(); };
    document.body.appendChild(teaserEl);
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (teaserEl) { teaserEl.style.opacity = "1"; teaserEl.style.transform = "none"; } }); });
    btn.style.animation = "aiseller-wiggle .8s ease"; setTimeout(function () { if (!open) btn.style.animation = ""; }, 850);   // la pallina "scuote" mentre parla
    clearTimeout(teaserEl._h); teaserEl._h = setTimeout(hideTeaser, 9000);   // si ritira da sola
  }
  function hideTeaser() {
    if (!teaserEl) return;
    var el = teaserEl; teaserEl = null;
    el.style.opacity = "0"; el.style.transform = "translateY(8px) scale(.92)";
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 280);
  }

  // ---- RICHIAMO periodico: la pallina "saltella" per farsi notare (chiusa, scheda attiva) ----
  var aTimer = null, pokeCount = 0;
  function poke() {
    if (open || document.hidden || teaserEl || pokeCount >= 3) return;   // max 3 saltelli a sessione (niente insistenza)
    pokeCount++;
    btn.style.animation = "aiseller-bounce .9s ease";
    setTimeout(function () { if (!open) btn.style.animation = ""; }, 950);
  }
  function startAttention() { stopAttention(); setTimeout(poke, 6000); aTimer = setInterval(poke, 20000); }
  function stopAttention() { clearInterval(aTimer); }

  // ---- carica la config del cliente (avatar + colore + teaser) senza bloccare ----
  function applyConf(c) {
    conf = c || {};
    if (conf.accent) { color = conf.accent; recolor(); }
    var ch = conf.character;
    var face = (ch && (ch.face || ch.thumb || ch.rest)) || "";
    if (face) setAvatar(face);
    startTeasers();
  }
  if (faceUrl) setAvatar(faceUrl);
  if (cfg) {
    fetch(cfg).then(function (r) { return r.json(); }).then(applyConf).catch(function () { startTeasers(); });
  } else { startTeasers(); }

  // ---- AUTO-EVITAMENTO: se sotto la pallina c'è già un bottone flottante (WhatsApp/chiamata), si sposta su ----
  function avoidCollision() {
    if (!autoAvoid || open) return;
    for (var tries = 0; tries < 6 && curBottom <= window.innerHeight * 0.6; tries++) {
      var r = btn.getBoundingClientRect();
      if (!r.width) break;
      var els = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2) || [];
      var hit = null;
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el === btn || btn.contains(el) || el === frame || el === teaserEl) continue;
        if (el === document.body || el === document.documentElement) break;
        var cs = getComputedStyle(el);
        if (cs.position === "fixed" || cs.position === "sticky") {
          var er = el.getBoundingClientRect();
          if (er.width <= window.innerWidth * 0.55 && er.height <= window.innerHeight * 0.55) hit = el;   // è un FAB, non un overlay a tutto schermo
        }
        break;   // valutiamo solo il primo elemento sotto la pallina
      }
      if (!hit) break;
      curBottom += Math.ceil(hit.getBoundingClientRect().height) + 14;
      applyPos();   // istantaneo (niente transizione sul bottom) → misura deterministica al giro dopo
    }
  }

  function mount() {
    // anello pulsante DIETRO la pallina (alone "sono attivo")
    ring = document.createElement("span");
    style(ring, {
      position: "fixed", zIndex: 2147482999, width: "64px", height: "64px", borderRadius: "50%",
      background: color, opacity: "0", pointerEvents: "none", animation: "aiseller-ring 3.6s ease-out infinite"
    });
    document.body.appendChild(ring);
    document.body.appendChild(btn);
    applyPos();
    btn.style.animation = "aiseller-pop .5s ease both";   // entrata con pop
    setTimeout(function () { if (!open) btn.style.animation = ""; }, 560);
    setTimeout(function () { if (!open) dot.style.display = "block"; }, 3000);   // badge "1" come richiamo
    startAttention();
    avoidCollision();
    setTimeout(avoidCollision, 1500);   // ricontrolla: alcuni widget (WhatsApp ecc.) si caricano in ritardo
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
