// AI Seller · CONFIG DINAMICA per Il Raviolo Bottega.
// Costruisce la config del chatbot leggendo il catalogo LIVE da Supabase (tabella bottega_products):
// così il bot riflette SEMPRE i prodotti presenti (aggiunti/tolti/esauriti), senza interventi manuali.
// Cache 10 min (s-maxage), CORS aperto. La parte fissa (tema, saluti, WhatsApp, tono) è qui sotto.
// Chiave Supabase = process.env.ILRAVIOLO_SUPABASE_KEY (anon public). Made in Italy.

const SUPABASE = "https://rllxrcitzofompzuipxh.supabase.co/rest/v1/bottega_products";

// metadati per categoria: ordine nel menu, emoji, etichette ES/IT/EN. Le categorie sconosciute
// (nuove) compaiono comunque, in fondo, con emoji generica.
const META = [
  { cat: "Pasta fresca",      emoji: "🥟", label: { es: "Pasta fresca",        it: "Pasta fresca",      en: "Fresh pasta" } },
  { cat: "Embutidos",         emoji: "🥓", label: { es: "Embutidos italianos", it: "Salumi italiani",    en: "Italian cured meats" } },
  { cat: "Quesos",            emoji: "🧀", label: { es: "Quesos",              it: "Formaggi",          en: "Cheeses" } },
  { cat: "Salsas",            emoji: "🍅", label: { es: "Salsas",              it: "Sughi & salse",     en: "Sauces" } },
  { cat: "Trufa",             emoji: "🍄", label: { es: "Trufa",               it: "Tartufo",           en: "Truffle" } },
  { cat: "Postres",           emoji: "🍰", label: { es: "Postres",             it: "Dolci",             en: "Desserts" } },
  { cat: "Focaccia y pizza",  emoji: "🍕", label: { es: "Focaccia y pizza",    it: "Focaccia e pizza",  en: "Focaccia & pizza" } },
  { cat: "Plato preparado",   emoji: "🍽️", label: { es: "Platos preparados",   it: "Piatti pronti",     en: "Ready dishes" } },
  { cat: "Bebidas",           emoji: "🥤", label: { es: "Bebidas",             it: "Bevande",           en: "Drinks" } },
  { cat: "Vino biodinámico",  emoji: "🍷", label: { es: "Vinos",               it: "Vini",              en: "Wines" } },
  { cat: "Licores",           emoji: "🥂", label: { es: "Licores",             it: "Liquori",           en: "Spirits" } },
  { cat: "Horno",             emoji: "🥖", label: { es: "Horno",               it: "Forno",             en: "Bakery" } },
  { cat: "Pane",              emoji: "🍞", label: { es: "Pan",                 it: "Pane",              en: "Bread" } },
  { cat: "Harinas",           emoji: "🌾", label: { es: "Harinas",             it: "Farine",            en: "Flours" } },
  { cat: "Complementos",      emoji: "🧺", label: { es: "Complementos",        it: "Complementi",       en: "Extras" } }
];
const metaOf = (c) => META.find(m => m.cat === c) || { cat: c, emoji: "🍝", label: { es: c, it: c, en: c } };
const orderOf = (c) => { const i = META.findIndex(m => m.cat === c); return i < 0 ? 99 : i; };

const isTrue = (v) => v === true || v === "True" || v === "true" || v === "t" || v === 1;
const toNum = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
const STOP = ["italiano","italiana","italianos","fresco","fresca","della","con","sin","para","the","and"];
function keysFrom(name, cat) {
  const set = new Set();
  String(cat || "").toLowerCase().split(/[^a-zàâäéèêëíìîïóòôöúùûüñç]+/i).forEach(w => { if (w.length >= 4) set.add(w); });
  String(name || "").toLowerCase().split(/[^a-zàâäéèêëíìîïóòôöúùûüñç]+/i).forEach(w => { if (w.length >= 4 && STOP.indexOf(w) < 0) set.add(w); });
  return [...set].slice(0, 12);
}

// ---- parte FISSA della config (tema, saluti, tono, WhatsApp) ----
function baseConfig() {
  return {
    brand: "Il Raviolo Bottega",
    host: "ilraviolo.es",
    mode: "lead",
    character: {
      rest: "https://ilraviolo.es/assets/il-raviolino.webp",
      point: "https://ilraviolo.es/assets/il-raviolino.webp",
      pointBack: "https://ilraviolo.es/assets/il-raviolino.webp",
      face: "https://ilraviolo.es/assets/il-raviolino.webp",
      w: 1024, h: 1536
    },
    accent: "#e8b84f",
    dark: true,
    bg: "#0a1f35",
    logo: "https://ilraviolo.es/assets/logo.webp",
    askName: true,
    emergency: false,
    itemEmoji: "🍝",
    pick: { es: "Mi elección", it: "La mia scelta", en: "My pick" },
    ctaAdd: { es: "➕ Añadir", it: "➕ Aggiungi", en: "➕ Add" },
    crossSell: {
      "Pasta fresca":     { suggest: "Salsas",            pitch: { es: "Para que el plato quede perfecto, ¿le añadimos una salsa? 🍅", it: "Per rendere il piatto perfetto, ci mettiamo un sugo? 🍅", en: "To make the dish perfect, shall we add a sauce? 🍅" } },
      "Plato preparado":  { suggest: "Salsas",            pitch: { es: "¿Una salsa para acompañar? 🍅", it: "Un sugo per accompagnare? 🍅", en: "A sauce to go with it? 🍅" } },
      "Salsas":           { suggest: "Embutidos",         pitch: { es: "¿Y de antipasto? Una tabla de embutidos para empezar 🥓", it: "E come antipasto? Un tagliere di salumi per iniziare 🥓", en: "And for a starter? An Italian cured meats board 🥓" } },
      "Embutidos":        { suggest: "Quesos",            pitch: { es: "¿Unos quesos para completar la tabla? 🧀", it: "Dei formaggi per completare il tagliere? 🧀", en: "Some cheeses to complete the board? 🧀" } },
      "Quesos":           { suggest: "Vino biodinámico",  pitch: { es: "¿Un buen vino italiano para acompañar? 🍷", it: "Un buon vino italiano per accompagnare? 🍷", en: "A nice Italian wine to pair? 🍷" } },
      "Vino biodinámico": { suggest: "Postres",           pitch: { es: "¿Cerramos con un postre casero? 🍰", it: "Chiudiamo con un dolce fatto in casa? 🍰", en: "Shall we finish with a homemade dessert? 🍰" } },
      "Trufa":            { suggest: "Pasta fresca",      pitch: { es: "La trufa pide pasta fresca para lucirse, ¿unos ravioli? 🥟", it: "Il tartufo dà il meglio sulla pasta fresca, dei ravioli? 🥟", en: "Truffle shines on fresh pasta — some ravioli? 🥟" } },
      "Focaccia y pizza": { suggest: "Embutidos",         pitch: { es: "¿Unos embutidos para acompañar la focaccia? 🥓", it: "Dei salumi per accompagnare la focaccia? 🥓", en: "Some cured meats with the focaccia? 🥓" } },
      "Bebidas":          { suggest: "Postres",           pitch: { es: "¿Algo dulce para acompañar? 🍰", it: "Qualcosa di dolce per accompagnare? 🍰", en: "Something sweet to go with it? 🍰" } }
    },
    prepInstructions: [
      { match: "lasagne|lasaña|lasagna|cannellon|canelon|parmigiana|berenjena|melanzan", text: {
        es: "🔥 Cómo prepararla: horno o freidora de aire a 180° durante 18 min — quita solo la tapa de plástico de arriba. ¡Lista para disfrutar!",
        it: "🔥 Come si prepara: forno o friggitrice ad aria a 180° per 18 min — togli solo il coperchio di plastica sopra. Pronta da gustare!",
        en: "🔥 How to prepare: oven or air fryer at 180° for 18 min — just remove the plastic lid on top. Ready to enjoy!"
      } }
    ],
    persona: { name: "Il Raviolo Bottega", role: { es: "tu tendero italiano", it: "il tuo bottegaio", en: "your Italian deli host" } },
    greeting: {
      es: "¡Hola! 👋 Soy el asistente de Il Raviolo Bottega 🍝 Pasta fresca hecha a mano, embutidos, quesos, trufa, vinos y dulces — lo mejor de Italia, para llevar. Dime, ¿qué te apetece hoy? 👇",
      it: "Ciao! 👋 Sono l'assistente di Il Raviolo Bottega 🍝 Pasta fresca fatta a mano, salumi, formaggi, tartufo, vini e dolci — il meglio dell'Italia, da portar via. Dimmi, cosa ti va oggi? 👇",
      en: "Hi! 👋 I'm Il Raviolo Bottega's assistant 🍝 Handmade fresh pasta, cured meats, cheeses, truffle, wines and sweets — the best of Italy, to take away. Tell me, what are you craving today? 👇"
    },
    askHint: {
      es: "Cuéntame qué te apetece (ej. \"ravioli de trufa\", \"una tabla de embutidos\", \"algo para una cena italiana\") — o elige aquí debajo 👇",
      it: "Dimmi cosa ti va (es. \"ravioli al tartufo\", \"un tagliere di salumi\", \"qualcosa per una cena italiana\") — oppure scegli qui sotto 👇",
      en: "Tell me what you fancy (e.g. \"truffle ravioli\", \"a cured meats board\", \"something for an Italian dinner\") — or pick below 👇"
    },
    problemEmpathy: {
      es: ["¡Tranquilo, te ayudo a elegir! 😊 Vamos 👇", "Sin problema, estás en buenas manos 🍝 Miramos juntos 👇"],
      it: ["Tranquillo, ti aiuto a scegliere! 😊 Andiamo 👇", "Nessun problema, sei in buone mani 🍝 Guardiamo insieme 👇"],
      en: ["No worries, I'll help you choose! 😊 Let's go 👇", "All good, you're in good hands 🍝 Let's look together 👇"]
    },
    acks: {
      es: ["¡Buena elección! 😋", "Mmm, me encanta 🤤", "Perfecto, apunto 📝", "¡Eso está hecho! 🙌"],
      it: ["Ottima scelta! 😋", "Mmm, una bontà 🤤", "Perfetto, segno 📝", "Detto fatto! 🙌"],
      en: ["Great choice! 😋", "Mmm, lovely 🤤", "Perfect, noted 📝", "Consider it done! 🙌"]
    },
    teasers: {
      es: ["🍝 ¿Pasta fresca recién hecha hoy?", "🧀 ¿Te preparo una tabla italiana?", "🍄 ¿Probamos la trufa?"],
      it: ["🍝 Pasta fresca fatta oggi?", "🧀 Ti preparo un tagliere italiano?", "🍄 Proviamo il tartufo?"],
      en: ["🍝 Fresh pasta made today?", "🧀 Shall I build you an Italian board?", "🍄 Fancy some truffle?"]
    },
    lead: {
      whatsapp: "34671085862",
      phone: "+34671085862",
      bookText: "¡Hola Il Raviolo Bottega! 🍝 Me gustaría preguntar/encargar: ",
      cta: { es: "Encargar por WhatsApp", it: "Ordina su WhatsApp", en: "Order on WhatsApp" }
    },
    emoji: {},
    catLabels: {},
    profiling: [],
    products: []
  };
}

// catalogo statico di riserva (se Supabase non risponde) — il bot non si rompe mai
function fallbackCatalog(cfg) {
  const cats = ["Pasta fresca", "Embutidos", "Quesos", "Salsas", "Trufa", "Vino biodinámico", "Postres"];
  applyCatalog(cfg, cats.map((c, i) => ({
    nombre: metaOf(c).label.es, categoria: c, descripcion: "", precio: 0, imagen_url: "", destacado: "True", visible: "True", agotado: "False", orden: i
  })));
  cfg._source = "fallback";
}

function applyCatalog(cfg, live) {
  // categorie presenti, ordinate per META
  const present = [...new Set(live.map(p => p.categoria))].sort((a, b) => orderOf(a) - orderOf(b) || a.localeCompare(b));
  const LANGS = ["es", "it", "en"];
  cfg.profiling = [{
    intent: "category",
    q: { es: "¿Qué te apetece hoy? 👇", it: "Cosa ti va oggi? 👇", en: "What are you craving today? 👇" },
    options: present.map(c => {
      const m = metaOf(c), o = {};
      LANGS.forEach(l => o[l] = m.label[l] + " " + m.emoji);
      o.val = c;
      return o;
    })
  }];
  present.forEach(c => {
    const m = metaOf(c);
    cfg.catLabels[c] = m.label;
    cfg.emoji[c] = m.emoji;
  });
  // prodotti (ognuno una card; recommend ne mostra i migliori per categoria)
  cfg.products = live.map((p, i) => {
    const promo = isTrue(p.promo_activa) && p.promo_texto;
    return {
      id: 8000 + i,
      name: p.nombre,
      category: p.categoria,
      price: toNum(p.promo_precio || p.precio),
      description: p.descripcion || "",
      imageUrl: p.imagen_url || "",
      unit: p.unidad || "",
      badge: promo ? ("🎉 " + p.promo_texto) : (isTrue(p.destacado) ? "⭐ Destacado" : ""),
      keys: keysFrom(p.nombre, p.categoria),
      stock: 99
    };
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800");
  if (req.method === "OPTIONS") return res.status(200).end();

  const cfg = baseConfig();
  const key = process.env.ILRAVIOLO_SUPABASE_KEY;
  try {
    if (!key) throw new Error("missing ILRAVIOLO_SUPABASE_KEY");
    const url = SUPABASE + "?select=id,categoria,nombre,descripcion,precio,imagen_url,destacado,visible,agotado,orden,promo_activa,promo_texto,promo_precio,unidad&visible=eq.true&order=categoria.asc,orden.asc";
    const r = await fetch(url, { headers: { apikey: key, Authorization: "Bearer " + key } });
    if (!r.ok) throw new Error("supabase " + r.status);
    const rows = await r.json();
    const live = (Array.isArray(rows) ? rows : []).filter(p => isTrue(p.visible) && !isTrue(p.agotado) && p.nombre && p.categoria);
    if (!live.length) throw new Error("empty catalog");
    applyCatalog(cfg, live);
    cfg._source = "supabase";
    cfg._count = live.length;
    return res.status(200).end(JSON.stringify(cfg));
  } catch (e) {
    fallbackCatalog(cfg);
    cfg._error = String(e && e.message || e);
    return res.status(200).end(JSON.stringify(cfg));
  }
};
