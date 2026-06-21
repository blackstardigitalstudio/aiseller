import fs from "fs";
const read = f => JSON.parse(fs.readFileSync(`./clients/${f}.json`, "utf8"));
const gas = read("gasproject"), bs = read("blackstar");
const charOf = c => { const ch = c.character; return ch && typeof ch === "object" ? (ch.rest || ch.thumb || ch.face || "") : (typeof ch === "string" ? ch : ""); };
const MAS_GAS = charOf(gas), MAS_BS = charOf(bs), MAS_RAV = "https://ilraviolo.es/assets/il-raviolino.webp";

const bots = [
  { accent:"#e8b84f", ink:"#3a2c10", uc:"#3a2c10", onln:"#5c4a1e", mascot:MAS_RAV, brand:"Il Raviolo Bottega", rot:-11, x:-150, y:20, z:1,
    t:{
      it:{g:"Ciao! 👋 Sono l'assistente di Il Raviolo Bottega 🍝 Cosa ti va oggi?", u:"Ravioli di carne", r:"Aggiunto: Ravioli carne ✅ Con la carne ci sta perfetta la <b>Salsa de ragú</b> 👌", c:"🛒 Ordina su WhatsApp"},
      es:{g:"¡Hola! 👋 Soy el asistente de Il Raviolo Bottega 🍝 ¿Qué te apetece hoy?", u:"Ravioli de carne", r:"Añadido: Ravioli carne ✅ Con la carne va perfecta la <b>Salsa de ragú</b> 👌", c:"🛒 Pide por WhatsApp"},
      en:{g:"Hi! 👋 I'm Il Raviolo Bottega's assistant 🍝 What do you fancy today?", u:"Meat ravioli", r:"Added: Ravioli carne ✅ With meat, <b>Salsa de ragú</b> is the perfect match 👌", c:"🛒 Order on WhatsApp"} } },
  { accent:"#0099b8", ink:"#06323b", uc:"#fff", onln:"#cdeef4", mascot:MAS_GAS, brand:"GAS Project", rot:0, x:0, y:0, z:3,
    t:{
      it:{g:"Ciao! 👋 Sono l'assistente di GAS Project 🏁 Raccontami cosa fa la tua auto o moto.", u:"Fa un rumore strano quando freno", r:"Ti capisco, dà fastidio 😟 Ma sei nel posto giusto: lo guardiamo subito. Prima diagnosi gratis 👇", c:"💬 Scrivici su WhatsApp"},
      es:{g:"¡Hola! 👋 Soy el asistente de GAS Project 🏁 Cuéntame qué le pasa a tu coche o moto.", u:"Hace un ruido raro al frenar", r:"Te entiendo, molesta 😟 Pero estás en el sitio correcto: lo miramos enseguida. Primer diagnóstico gratis 👇", c:"💬 Escríbenos por WhatsApp"},
      en:{g:"Hi! 👋 I'm GAS Project's assistant 🏁 Tell me what your car or bike is doing.", u:"Weird noise when I brake", r:"I get it, that's annoying 😟 But you're in the right place: we'll check it right away. First diagnosis free 👇", c:"💬 Message us on WhatsApp"} } },
  { accent:"#a68732", ink:"#2a2310", uc:"#fff", onln:"#f0e6cc", mascot:MAS_BS, brand:"Blackstar Digital Studio", rot:11, x:150, y:20, z:1,
    t:{
      it:{g:"Ciao 👋 Sono l'assistente di Blackstar Digital Studio. Trasformiamo prodotti digitali in ecosistemi che acquisiscono clienti.", u:"Vorrei più clienti dal sito", r:"Perfetto, è esattamente ciò che facciamo 🚀 Ti va una call conoscitiva, senza impegno?", c:"📅 Prenota una call"},
      es:{g:"Hola 👋 Soy el asistente de Blackstar Digital Studio. Convertimos productos digitales en ecosistemas que captan clientes.", u:"Quiero más clientes desde la web", r:"Perfecto, es justo lo que hacemos 🚀 ¿Te apetece una llamada sin compromiso?", c:"📅 Reserva una llamada"},
      en:{g:"Hi 👋 I'm Blackstar Digital Studio's assistant. We turn digital products into ecosystems that win customers.", u:"I'd like more clients from my site", r:"Perfect, that's exactly what we do 🚀 Fancy a quick intro call, no strings?", c:"📅 Book a call"} } }
];
const HEAD = {
  it:{ title:"Un venditore AI per ogni attività", sub:"Lo stesso motore, vestito su misura per ogni cliente — colori, settore, mascotte e lingua.", leg:["Il Raviolo · bottega","GAS Project · autofficina","Blackstar · agenzia"] },
  es:{ title:"Un vendedor con IA para cada negocio", sub:"El mismo motor, hecho a medida para cada cliente — colores, sector, mascota e idioma.", leg:["Il Raviolo · tienda","GAS Project · taller","Blackstar · agencia"] },
  en:{ title:"An AI seller for every business", sub:"The same engine, tailored to each client — colours, sector, mascot and language.", leg:["Il Raviolo · deli","GAS Project · garage","Blackstar · agency"] }
};
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

const CSS = `
.asv{container-type:inline-size;color:inherit;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;text-align:center;padding:1.5rem 0}
.asv *{box-sizing:border-box;margin:0;padding:0;text-transform:none;letter-spacing:normal}
.asv .asv-t{font-size:23px;font-weight:800;color:inherit;margin-bottom:6px}
.asv .asv-s{font-size:14px;color:inherit;opacity:.7;margin:0 auto 54px;max-width:520px}
.asv .asv-fan{position:relative;width:100%;max-width:700px;height:520px;margin:0 auto;display:flex;align-items:center;justify-content:center}
.asv .asv-phone{position:absolute;width:230px;height:460px;background:#fff;border:8px solid #11161d;border-radius:30px;overflow:hidden;transform-origin:bottom center;transition:transform .35s ease;box-shadow:0 24px 54px rgba(0,0,0,.32)}
.asv .asv-phone:hover{transform:translateY(-12px) scale(1.03) !important;z-index:9 !important}
.asv .asv-notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:104px;height:19px;background:#11161d;border-radius:0 0 14px 14px;z-index:5}
.asv .asv-head{display:flex;align-items:center;gap:9px;padding:13px 12px 10px;background:var(--a)}
.asv .asv-av{width:34px;height:34px;border-radius:50%;flex:0 0 auto;background:#fff var(--m) center top/cover no-repeat;border:2px solid rgba(255,255,255,.9)}
.asv .asv-who{display:flex;flex-direction:column;line-height:1.2;min-width:0;text-align:left}
.asv .asv-who strong{font-size:12.5px;font-weight:600;color:var(--uc);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.asv .asv-who em{font-size:10px;font-style:normal;color:var(--on)}
.asv .asv-body{position:relative;height:calc(100% - 57px);background:#f5f3ee;padding:13px;display:flex;flex-direction:column;gap:7px}
.asv .asv-b{font-size:11px;line-height:1.38;padding:8px 10px;border-radius:13px;max-width:88%}
.asv .asv-bot{background:#fff;border:.5px solid #e3d9c6;border-bottom-left-radius:4px;align-self:flex-start;color:#2a2a2a}
.asv .asv-bot b{color:var(--ink);font-weight:600}
.asv .asv-usr{background:var(--a);color:var(--uc);border-bottom-right-radius:4px;align-self:flex-end}
.asv .asv-cta{margin-top:auto;background:var(--a);color:var(--uc);text-align:center;border-radius:12px;padding:11px;font-size:11.5px;font-weight:600;position:relative;z-index:3}
.asv .asv-mascot{position:absolute;left:-10px;bottom:54px;width:84px;height:135px;background:var(--m) left bottom/contain no-repeat;filter:drop-shadow(0 5px 9px rgba(0,0,0,.26));z-index:2;pointer-events:none}
.asv .asv-legend{margin-top:52px;display:flex;gap:20px;flex-wrap:wrap;justify-content:center;font-size:12.5px;opacity:.7}
.asv .asv-legend span{display:flex;align-items:center;gap:6px}
.asv .asv-legend i{width:11px;height:11px;border-radius:3px}
@container (max-width:680px){.asv .asv-fan{flex-direction:column;height:auto;gap:26px;max-width:250px}.asv .asv-phone{position:static;transform:none !important}}
@media (max-width:680px){.asv .asv-fan{flex-direction:column;height:auto;gap:26px;max-width:250px}.asv .asv-phone{position:static;transform:none !important}}`;

const phone = (b, L) => { const x = b.t[L]; return `
    <div class="asv-phone" style="--a:${b.accent};--ink:${b.ink};--m:url('${b.mascot}');--uc:${b.uc};--on:${b.onln};transform:translate(${b.x}px,${b.y}px) rotate(${b.rot}deg);z-index:${b.z}">
      <span class="asv-notch"></span>
      <div class="asv-head"><span class="asv-av"></span><span class="asv-who"><strong>${esc(b.brand)}</strong><em>● online</em></span></div>
      <div class="asv-body">
        <span class="asv-b asv-bot">${esc(x.g)}</span>
        <span class="asv-b asv-usr">${esc(x.u)}</span>
        <span class="asv-b asv-bot">${x.r}</span>
        <span class="asv-cta">${esc(x.c)}</span>
        <span class="asv-mascot"></span>
      </div>
    </div>`; };

const build = L => { const h = HEAD[L]; return `<!-- AI Seller — ventaglio 3 bot (${L.toUpperCase()}) · Made in Italy 🇮🇹 · incolla cosi com'e -->
<div class="asv">
  <style>${CSS}
  </style>
  <div class="asv-t">${esc(h.title)}</div>
  <div class="asv-s">${esc(h.sub)}</div>
  <div class="asv-fan">${bots.map(b => phone(b, L)).join("")}
  </div>
  <div class="asv-legend">
    <span><i style="background:#e8b84f"></i>${esc(h.leg[0])}</span>
    <span><i style="background:#0099b8"></i>${esc(h.leg[1])}</span>
    <span><i style="background:#a68732"></i>${esc(h.leg[2])}</span>
  </div>
</div>`; };

const files = { it:"ventaglio-inline.html", es:"ventaglio-inline-es.html", en:"ventaglio-inline-en.html" };
for (const L of Object.keys(files)) { fs.writeFileSync(files[L], build(L)); console.log(files[L], (fs.statSync(files[L]).size/1024).toFixed(0) + "KB"); }
