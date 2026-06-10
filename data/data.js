/* Kayaman's Farm — dati estratti dal sito reale + strategia neuromarketing.
   Caricato come oggetto globale (window.KF_DATA) per funzionare anche con file:// senza fetch/CORS.
   Made in Italy. */
window.KF_DATA = {
  products: [
    { id: 1,  name: "Papel Raw Classic Single Wide", category: "Cartine", price: 0.60, currency: "EUR", description: "Le iconiche cartine RAW non sbiancate, formato single wide, per chi cura ogni dettaglio con stile naturale.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2023/01/d33fe355-ec50-4505-868a-879b7d071d6e.jpeg?resize=300%2C300&ssl=1", badge: "Bestseller", stock: 42 },
    { id: 2,  name: "Raw King Size Supreme Classic", category: "Cartine", price: 1.30, currency: "EUR", description: "Cartine RAW King Size Supreme ultrasottili per rollare con stile e massima combustione.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2023/10/Raw-ks-supreme.jpg?resize=300%2C300&ssl=1", badge: "", stock: 30 },
    { id: 3,  name: "RAW Ethereal King Size Slim", category: "Cartine", price: 2.99, currency: "EUR", description: "L'edizione RAW Ethereal, le cartine più sottili mai prodotte, quasi trasparenti e leggerissime.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2024/12/kingsize-slim.jpeg?resize=300%2C300&ssl=1", badge: "Nuevo", stock: 8 },
    { id: 4,  name: "RAW Black Connoisseur 1¼ con Filtros", category: "Cartine", price: 1.75, currency: "EUR", description: "Libretto RAW Black Connoisseur con cartine extra fini e filtri in carta inclusi, tutto in uno.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2021/06/raw_back_connoisseur_1.14_-_librillo.jpg?resize=300%2C300&ssl=1", badge: "", stock: 25 },
    { id: 5,  name: "SLX PRO Grinder 62mm 4 Partes", category: "Grinder", price: 85.00, currency: "EUR", description: "Grinder premium SLX PRO da 62mm a 4 parti con rivestimento ceramico antiaderente per una macinatura perfetta.", imageUrl: "", badge: "Bestseller", stock: 5 },
    { id: 6,  name: "Clipper 420 Mix", category: "Accendini", price: 6.00, currency: "EUR", description: "Il classico accendino Clipper ricaricabile con grafica 420, compatto e collezionabile.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2025/03/Clipper-420-mix-8.jpg", badge: "", stock: 60 },
    { id: 7,  name: "Clipper 420 America", category: "Accendini", price: 6.00, currency: "EUR", description: "Accendino Clipper ricaricabile dal design America, dotato di pietrina rimovibile multifunzione.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2025/03/clipper-420-america.jpg", badge: "", stock: 50 },
    { id: 8,  name: "Clipper Coleccionable 420 Girly", category: "Accendini", price: 8.00, currency: "EUR", description: "Edizione collezionabile Clipper Girly 420, un accendino di tendenza per veri intenditori.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2023/08/clipper-girly.jpg", badge: "", stock: 18 },
    { id: 9,  name: "Clipper Art Classic Dragon Babies B-48", category: "Accendini", price: 16.00, currency: "EUR", description: "Pack collezione Clipper Art Classic Dragon Babies, accendini illustrati in edizione limitata.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2025/11/dragon-babys.png", badge: "Nuevo", stock: 4 },
    { id: 10, name: "Superior Vape 1ml Mango Ice", category: "Vaporizzatori", price: 30.00, compareAt: 39.90, currency: "EUR", description: "Vaporizzatore CBD Superior Vape da 1ml al gusto Mango Ice, fresco e fruttato in offerta.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2025/07/mango-ice-vaper.jpg", badge: "Oferta", stock: 12 },
    { id: 11, name: "Superior Vape 1ml Sandía", category: "Vaporizzatori", price: 30.00, currency: "EUR", description: "Vape al CBD Superior da 1ml gusto anguria, dolce e dissetante per momenti di relax.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2025/07/watermelon-vape-cbd.jpg", badge: "", stock: 14 },
    { id: 12, name: "Vape Desechable CBD Sabor Blueberry", category: "Vaporizzatori", price: 30.00, currency: "EUR", description: "Vaporizzatore usa e getta al CBD gusto mirtillo, pronto all'uso e dal sapore avvolgente.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2025/07/Vape-Desechable-CBD-Sabor-Blueberry-%E2%80%93-Only-Grams-Canarias.jpg", badge: "", stock: 20 },
    { id: 13, name: "Resina Aromática 'Rosin' CBD 67% · 3gr (de colección)", category: "CBD", price: 35.00, currency: "EUR", description: "Resina aromática de cáñamo CBD obtenida en frío, sin disolventes. <0,2% THC. Producto aromático de colección, no apto para consumo humano.", imageUrl: "", badge: "Bestseller", stock: 6 },
    { id: 14, name: "Resina Aromática de Cáñamo CBD (de colección)", category: "CBD", price: 12.00, currency: "EUR", description: "Resina de cáñamo aromática, <0,2% THC, conforme a normativa. Producto aromático/de colección, no apto para combustión ni consumo humano.", imageUrl: "", badge: "", stock: 22 },
    { id: 15, name: "Aceite Cosmético de CBD 10% (uso tópico)", category: "CBD", price: 24.90, currency: "EUR", description: "Aceite cosmético de CBD al 10% para masaje y cuidado de la piel. Uso tópico externo. Sin finalidad terapéutica. <0,2% THC.", imageUrl: "", badge: "", stock: 16 },
    { id: 21, name: "Bálsamo Muscular CBD Efecto Frío · 100ml", category: "CBD", price: 18.90, currency: "EUR", description: "Bálsamo cosmético con CBD y mentol para masajear tras el deporte. Frescor inmediato. Uso tópico externo. Sin finalidad terapéutica.", imageUrl: "", badge: "Nuevo", stock: 20 },
    { id: 22, name: "Crema Facial Hidratante CBD · 50ml", category: "CBD", price: 22.00, currency: "EUR", description: "Crema facial cosmética con CBD y ácido hialurónico para una piel cuidada y luminosa. Uso tópico diario.", imageUrl: "", badge: "", stock: 18 },
    { id: 23, name: "Sales de Baño CBD & Lavanda · 300g", category: "CBD", price: 14.50, currency: "EUR", description: "Sales de baño cosméticas con CBD y lavanda para tu ritual de desconexión. Uso externo. Una experiencia casi de spa en casa.", imageUrl: "", badge: "Bestseller", stock: 26 },
    { id: 24, name: "Roll-on Cosmético CBD Relax · 10ml", category: "CBD", price: 9.90, currency: "EUR", description: "Roll-on cosmético con CBD y aromas para masajear sienes y cuello en tu pausa del día. Uso tópico. Cabe en el bolsillo.", imageUrl: "", badge: "", stock: 35 },
    { id: 25, name: "Set Ritual CBD · bálsamo + sales + roll-on", category: "CBD", price: 39.90, compareAt: 47.30, currency: "EUR", description: "Set cosmético de regalo: bálsamo, sales de baño y roll-on con CBD para un ritual de cuidado completo. Uso tópico/externo.", imageUrl: "", badge: "Oferta", stock: 10 },
    { id: 26, name: "Piatella Hash 22% CBD (de colección)", category: "CBD", price: 7.49, currency: "EUR", description: "Resina aromática de cáñamo 'Piatella', 22% CBD, <0,2% THC. Producto aromático de colección, no apto para combustión ni consumo humano.", imageUrl: "", badge: "Bestseller", stock: 30 },
    { id: 27, name: "Red Liban Hash 30% CBD (de colección)", category: "CBD", price: 7.49, currency: "EUR", description: "Resina aromática estilo Líbano rojo, 30% CBD, <0,2% THC. De colección/aromático, no apto para consumo humano.", imageUrl: "", badge: "", stock: 24 },
    { id: 28, name: "Dry Filtered Hash 11% CBD + CBG (de colección)", category: "CBD", price: 8.99, currency: "EUR", description: "Resina filtrada en seco, 11% CBD + CBG, aromática. Producto de colección, <0,2% THC, no apto para consumo humano.", imageUrl: "", badge: "", stock: 18 },
    { id: 29, name: "OG Haze Indoor Premium <15% CBD (aromática)", category: "CBD", price: 13.99, currency: "EUR", description: "Flor aromática de cáñamo indoor premium 'OG Haze', <15% CBD, <0,2% THC. Aromática/de colección, no apta para consumo humano.", imageUrl: "", badge: "Nuevo", stock: 16 },
    { id: 30, name: "Mimosa Indoor Premium <15% CBD (aromática)", category: "CBD", price: 13.99, currency: "EUR", description: "Flor aromática indoor premium 'Mimosa', perfil afrutado, <15% CBD, <0,2% THC. De colección, no apta para consumo humano.", imageUrl: "", badge: "", stock: 14 },
    { id: 31, name: "Orange Diesel Glasshouse 8% CBD (aromática)", category: "CBD", price: 8.99, currency: "EUR", description: "Flor aromática glasshouse 'Orange Diesel', notas cítricas, 8% CBD, <0,2% THC. Aromática/de colección.", imageUrl: "", badge: "", stock: 20 },
    { id: 32, name: "Lavender Kush Glasshouse 6-10% CBD (aromática)", category: "CBD", price: 5.20, currency: "EUR", description: "Flor aromática 'Lavender Kush', aroma floral a lavanda, 6-10% CBD, <0,2% THC. De colección, no apta para consumo humano.", imageUrl: "", badge: "Oferta", compareAt: 7.99, stock: 28 },
    { id: 33, name: "Neo Cannatonic 11% CBD + CBG (aromática)", category: "CBD", price: 8.99, currency: "EUR", description: "Flor aromática 'Neo Cannatonic' con CBG, perfil equilibrado, <0,2% THC. Aromática/de colección, no apta para consumo humano.", imageUrl: "", badge: "", stock: 15 },
    { id: 34, name: "Peach Crumble 98% CBD (extracto de colección)", category: "CBD", price: 15.49, currency: "EUR", description: "Extracto aromático 'Peach Crumble', 98% CBD, aroma a melocotón. Producto aromático de colección, <0,2% THC, no apto para consumo humano.", imageUrl: "", badge: "", stock: 10 },
    { id: 35, name: "Orange Bud Crumble 96% CBD (extracto de colección)", category: "CBD", price: 12.99, currency: "EUR", description: "Extracto aromático 'Orange Bud Crumble', 96% CBD, notas cítricas. De colección, <0,2% THC, no apto para consumo humano.", imageUrl: "", badge: "", stock: 9 },
    { id: 36, name: "Vape Desechable CBD Magic Farmers 2ml", category: "CBD", price: 37.99, currency: "EUR", description: "Vaporizador desechable de 2ml con CBD y aroma intenso, listo para usar. <0,2% THC.", imageUrl: "", badge: "Nuevo", stock: 12 },
    { id: 37, name: "Pack Dúo Cremas Tattoo CBD (uso tópico)", category: "CBD", price: 40.99, currency: "EUR", description: "Pack de 2 cremas cosméticas con CBD para el cuidado de la piel tatuada y del día a día. Uso tópico diario.", imageUrl: "", badge: "", stock: 13 },
    { id: 16, name: "Multitrance Té Verde White Widow", category: "Edibles", price: 7.00, currency: "EUR", description: "Tè verde Multitrance Original Amsterdam alla White Widow, un infuso rilassante alla canapa.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2023/12/Bildschirmfoto-2023-12-15-um-19.38.16.png?resize=300%2C300&ssl=1", badge: "", stock: 28 },
    { id: 17, name: "Lollipops Cannabis Suckers Bubblegum", category: "Edibles", price: 1.00, currency: "EUR", description: "Lecca-lecca Cannabis Suckers al gusto bubblegum, una dolce sfiziosità aromatizzata alla canapa.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2022/12/28-cm-2022-12-28T171440.353-1.jpg?resize=300%2C300&ssl=1", badge: "", stock: 70 },
    { id: 18, name: "Chupa Chups Sticky Icky Ganja Khola", category: "Edibles", price: 0.70, compareAt: 1.20, currency: "EUR", description: "Lecca-lecca Sticky Icky Ganja Khola, un dolcetto aromatizzato perfetto da collezionare.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2023/05/sticky-icky-lollies-ganja-khola-70pcs-1.jpg?resize=300%2C300&ssl=1", badge: "Oferta", stock: 80 },
    { id: 19, name: "Cenicero Cristal Raw Edición Limitada", category: "Accessori", price: 44.95, currency: "EUR", description: "Posacenere RAW in cristallo edizione limitata, un pezzo da collezione elegante e robusto.", imageUrl: "", badge: "", stock: 3 },
    { id: 20, name: "Caja Raw Masterpiece Rollo + Filtros", category: "Accessori", price: 4.50, currency: "EUR", description: "Kit RAW Masterpiece con rotolo di carta e filtri prearrotolati, tutto il necessario in un'unica scatola.", imageUrl: "https://i0.wp.com/kayamansfarm.com/wp-content/uploads/2022/02/28-cm-2022-02-11T235431.031.jpg?resize=300%2C300&ssl=1", badge: "", stock: 24 }
  ],

  design: {
    palette: { primary: "#2F5D3A", secondary: "#C9A24B", accent: "#C1402E", dark: "#1C1B19", light: "#F7F4EC" },
    logoText: "Kayaman's Farm"
  },

  persona: {
    name: "Kaya",
    role: { es: "tu budtender", en: "your budtender", it: "il tuo budtender" }
  },

  // Domande di profilazione: capire chi ho davanti
  profiling: [
    { intent: "experience", q: { es: "¿Cómo te describirías? ¿Empezando o ya experto?", en: "How would you describe yourself — just starting out, or a connoisseur?", it: "Come ti descriveresti — alle prime armi o già un intenditore?" },
      options: [ { es: "Principiante", en: "Beginner", it: "Principiante", val: "beginner" }, { es: "Intermedio", en: "Intermediate", it: "Intermedio", val: "intermediate" }, { es: "Experto", en: "Connoisseur", it: "Esperto", val: "expert" }, { es: "Curiosidad CBD", en: "CBD-curious", it: "Curioso di CBD", val: "cbd" } ] },
    { intent: "motive", q: { es: "¿Es para ti o buscas un regalo?", en: "Is this for you, or a gift?", it: "È per te o stai cercando un regalo?" },
      options: [ { es: "Para mí", en: "For me", it: "Per me", val: "self" }, { es: "Regalo", en: "Gift", it: "Regalo", val: "gift" }, { es: "Aún no lo sé", en: "Not sure", it: "Non so ancora", val: "unsure" } ] },
    { intent: "category", q: { es: "¿Qué te llama más hoy?", en: "What are you most drawn to today?", it: "Cosa ti attira di più oggi?" },
      options: [ { es: "Liar (cartine, grinder)", en: "Rolling (papers, grinder)", it: "Rollare (cartine, grinder)", val: "Cartine" }, { es: "Vaporizadores", en: "Vaporizers", it: "Vaporizzatori", val: "Vaporizzatori" }, { es: "CBD & bienestar", en: "CBD & wellness", it: "CBD & benessere", val: "CBD" }, { es: "Mecheros & accesorios", en: "Lighters & accessories", it: "Accendini & accessori", val: "Accendini" }, { es: "Algo dulce", en: "Something sweet", it: "Qualcosa di dolce", val: "Edibles" } ] },
    { intent: "budget", q: { es: "¿Qué presupuesto tienes en mente?", en: "What budget do you have in mind?", it: "Che budget hai in mente?" },
      options: [ { es: "Económico (<15€)", en: "Budget (<15€)", it: "Economico (<15€)", val: "low" }, { es: "Medio (15-50€)", en: "Mid (15-50€)", it: "Medio (15-50€)", val: "mid" }, { es: "Premium (50€+)", en: "Premium (50€+)", it: "Premium (50€+)", val: "high" }, { es: "Enséñame de todo", en: "Show me everything", it: "Mostrami tutto", val: "any" } ] }
  ],

  // Tattiche neuromarketing (Cialdini) — frasi reali trilingue
  tactics: {
    socialProof: { es: "El Clipper clásico es nuestro mechero más vendido — la gente vuelve a por él justo porque es recargable. Un clásico por algo. 🔥", en: "The classic Clipper is our best-selling lighter — folks keep coming back because it's refillable. A classic for a reason. 🔥", it: "Il Clipper classico è il nostro accendino più venduto — la gente lo ricompra perché è ricaricabile. Un classico, non a caso. 🔥" },
    authority: { es: "Como budtender te diría: para empezar, unas RAW de cáñamo y un grinder de 4 partes. Es lo que recomendaría a cualquier amigo.", en: "Speaking as your budtender: to start, hemp RAW papers and a 4-part grinder. It's what I'd tell any friend.", it: "Da budtender ti dico: per iniziare, cartine RAW di canapa e un grinder a 4 parti. È ciò che consiglierei a qualsiasi amico." },
    scarcity: { es: "Te seré sincera: de este nos quedan pocas unidades y no siempre repetimos. Si te enamora, mejor no dejarlo pasar. ⏳", en: "Honestly: we're down to just a few of these and we don't always restock. If it's calling you, don't let it slip. ⏳", it: "Te lo dico sinceramente: ne restano poche e non sempre rifacciamo il colore. Se ti piace, non fartelo scappare. ⏳" },
    anchoring: { es: "Los de gama alta rondan los 250€. Este te da una experiencia muy cuidada por una fracción — la opción más equilibrada.", en: "High-end ones run ~€250. This gives a refined experience for a fraction — the smart middle-ground pick.", it: "I top arrivano sui 250€. Questo ti dà un'esperienza curatissima a una frazione — la scelta più equilibrata." },
    reciprocity: { es: "Como te llevas el kit, te apunto gratis un par de trucos para que las cartinas no se peguen con la humedad. Regalo de la casa. 🎁", en: "Since you're grabbing the kit, here's a free tip so your papers don't stick in the humidity. On the house. 🎁", it: "Visto che prendi il kit, ti regalo un paio di trucchi perché le cartine non si attacchino con l'umidità. Omaggio della casa. 🎁" },
    lossAversion: { es: "El de usar y tirar parece más barato hoy, pero acabas comprando cinco al año. Con uno recargable dejas de tirar dinero cada mes.", en: "The disposable looks cheaper today, but you buy five a year. A refillable one stops you throwing money away monthly.", it: "L'usa e getta sembra più economico oggi, ma ne compri cinque all'anno. Con uno ricaricabile smetti di buttare soldi ogni mese." },
    sensory: { es: "Imagina el cristal grueso y fresco en la mano, ese borboteo suave del agua… casi de spa. 🌿", en: "Picture the thick cool glass in hand, that soft bubble of water… almost spa-like. 🌿", it: "Immagina il vetro spesso e fresco in mano, quel gorgoglìo morbido dell'acqua… quasi da spa. 🌿" }
  },

  // 🌿 CBD — vendita PROBLEMA→SOLUZIONE per chi è nuovo, in chiave CONFORME (cosmetico/aromatico, niente claim medici né riferimenti al fumare)
  cbd: {
    intro: {
      es: "El CBD es un mundo entero 🌿 (y tranqui: ni coloca ni es medicina, es cuidado y ritual). Para clavarte el tuyo, dime una cosa 👇",
      en: "CBD is a whole world 🌿 (and chill: it doesn't get you high and isn't medicine — it's self-care and ritual). To nail yours, tell me one thing 👇",
      it: "Il CBD è un mondo intero 🌿 (e tranquillo: non sballa e non è una medicina, è cura e ritual). Per azzeccarti quello giusto, dimmi una cosa 👇"
    },
    needQ: { es: "¿Qué momento quieres cuidar?", en: "Which moment do you want to care for?", it: "Quale momento vuoi curare?",
      options: [
        { es: "Desconectar del estrés del día", en: "Unwind from the day", it: "Staccare dallo stress", val: "calma" },
        { es: "Cuidar mi piel", en: "Care for my skin", it: "Curare la pelle", val: "piel" },
        { es: "Recuperar tras el deporte", en: "Recover after sport", it: "Recuperare dopo lo sport", val: "deporte" },
        { es: "Un regalo / probar el ritual", en: "A gift / try the ritual", it: "Un regalo / provare il ritual", val: "ritual" }
      ]
    },
    solutions: {
      calma: { productId: 23, crossId: 24, pitch: {
        es: "Llegas a casa y la cabeza sigue a mil: el cuerpo está, pero tú no desconectas. La gente se monta un *ritual* — agua caliente, aroma a lavanda y CBD — para cerrar el día en modo avión. Esto es lo que se llevan 👇",
        en: "You're home but your head's still racing — body's here, you're not. People build a *ritual* — hot water, lavender aroma and CBD — to switch the day to airplane mode. This is what they grab 👇",
        it: "Torni a casa ma la testa va ancora a mille: il corpo c'è, tu no. La gente si crea un *ritual* — acqua calda, aroma di lavanda e CBD — per chiudere la giornata in modalità aereo. Ecco cosa prendono 👇" } },
      piel: { productId: 22, crossId: 24, pitch: {
        es: "La piel es lo primero que paga el cansancio: tirante, apagada. Un solo gesto al día cambia la foto. Esta crema con CBD e hialurónico es el paso fácil que la gente ya no suelta 👇",
        en: "Skin is the first thing tiredness hits — tight, dull. One daily gesture changes the picture. This CBD + hyaluronic cream is the easy step people don't drop 👇",
        it: "La pelle è la prima a pagare la stanchezza: tirata, spenta. Un solo gesto al giorno cambia tutto. Questa crema con CBD e acido ialuronico è il passo facile che la gente non molla più 👇" } },
      deporte: { productId: 21, crossId: 24, pitch: {
        es: "Después de entrenar las piernas pesan y al día siguiente lo notas. Un masaje con bálsamo de CBD efecto frío es el mimo que tu cuerpo te pide. Mira 👇",
        en: "After training your legs feel heavy and you pay for it next day. A massage with cool-effect CBD balm is the treat your body asks for. Look 👇",
        it: "Dopo l'allenamento le gambe pesano e il giorno dopo lo senti. Un massaggio col balsamo CBD effetto freddo è la coccola che il corpo ti chiede. Guarda 👇" } },
      ritual: { productId: 25, crossId: 23, pitch: {
        es: "¿Primera vez o buscas regalar? Este set es el 'todo en uno' del ritual CBD: bálsamo, sales y roll-on. Quien lo prueba, repite — y de regalo queda de lujo 👇",
        en: "First time or buying a gift? This set is the all-in-one CBD ritual: balm, salts and roll-on. Whoever tries it, repeats — and it's a luxe gift 👇",
        it: "Prima volta o cerchi un regalo? Questo set è il 'tutto in uno' del ritual CBD: balsamo, sali e roll-on. Chi lo prova ripete — e come regalo fa un figurone 👇" } }
    },
    disclaimer: {
      es: "ℹ️ CBD de uso cosmético/tópico o aromático de colección · THC <0,2% · sin finalidad terapéutica ni alimentaria · consulta a tu médico si tomas medicación · +18.",
      en: "ℹ️ CBD for cosmetic/topical or aromatic-collector use · THC <0.2% · no therapeutic or food purpose · check with your doctor if on medication · 18+.",
      it: "ℹ️ CBD a uso cosmetico/topico o aromatico da collezione · THC <0,2% · senza finalità terapeutica o alimentare · consulta il medico se assumi farmaci · +18."
    }
  },

  // Cross-sell / upsell: se interessa X, proponi Y
  upsell: {
    "Cartine": "Grinder", "Grinder": "Accendini",
    "Vaporizzatori": "Accessori", "CBD": "Edibles", "Accendini": "Accessori",
    "Edibles": "CBD", "Accessori": "Cartine"
  },

  // Rilevamento obiezioni (keyword) → risposta trilingue
  objections: [
    { keys: { es: ["caro","precio","dinero","barato"], en: ["expensive","price","cheap","money","cost"], it: ["caro","prezzo","costa","soldi","economico"] },
      r: { es: "Te entiendo. Un buen grinder o Clipper se amortiza en meses frente a comprar baratos una y otra vez. Si prefieres, te armo una opción más económica que cumple igual — tú decides. 😉", en: "Totally fair. A solid grinder or Clipper pays for itself in months vs buying cheap ones over and over. If you'd rather, I'll find a budget option that still delivers — you set the pace. 😉", it: "Ti capisco. Un buon grinder o Clipper si ripaga in pochi mesi rispetto a comprarne di scadenti in continuazione. Se preferisci ti trovo un'opzione più economica che funziona lo stesso — decidi tu. 😉" } },
    { keys: { es: ["legal","es legal","seguro","thc","ley","normativa"], en: ["legal","is it legal","safe","thc","law"], it: ["legale","è legale","sicuro","thc","legge","normativa"] },
      r: { es: "Buena pregunta. Vendemos CBD para uso de bienestar y lifestyle, dentro de la normativa. No hacemos promesas médicas: si tomas medicación, coméntalo con tu médico. Y siempre, solo +18.", en: "Great question. We carry CBD for wellness & lifestyle use, within regulations. We make no medical claims — if you take medication, check with your doctor. And always, 18+ only.", it: "Bella domanda. Trattiamo CBD per benessere e lifestyle, nel rispetto delle normative. Niente promesse mediche: se assumi farmaci, parlane col medico. E sempre, solo +18." } },
    { keys: { es: ["envío","envio","entrega","discreto","canarias"], en: ["shipping","delivery","discreet","ship"], it: ["spedizione","consegna","discreto","spedite"] },
      r: { es: "Enviamos a península y Canarias con embalaje neutro y discreto — nadie sabe qué hay dentro. Envío gratis a partir de 60€. ¿Te calculo el coste a tu zona?", en: "We ship across Spain & the Canaries in plain, discreet packaging — no one can tell. Free shipping over €60. Want me to check the cost for your area?", it: "Spediamo in Spagna e nelle Canarie con imballo neutro e discreto — nessuno capisce cosa c'è dentro. Spedizione gratis sopra 60€. Ti calcolo il costo per la tua zona?" } },
    { keys: { es: ["no sé","muchas opciones","lío","ayuda","principiante"], en: ["overwhelmed","too many","confused","help","beginner"], it: ["non so","troppe","confuso","aiuto","principiante"] },
      r: { es: "Tranqui, para eso estoy. Dime solo si es para liar, vapear o relajarte, y te dejo dos opciones claras, ni una más. Empezamos sencillo. 🙌", en: "No stress, that's what I'm here for. Just tell me if it's for rolling, vaping or relaxing, and I'll give you two clear options, no more. We start simple. 🙌", it: "Tranquillo, sono qui per questo. Dimmi solo se è per rollare, vaporizzare o rilassarti e ti do due opzioni chiare, non una di più. Partiamo semplici. 🙌" } }
  ],

  // Copy interfaccia
  ui: {
    chatPlaceholder: { es: "Escribe lo que buscas...", en: "Tell us what you're after...", it: "Scrivi cosa stai cercando..." },
    send: { es: "Enviar", en: "Send", it: "Invia" },
    ageGateTitle: { es: "¿Eres mayor de 18?", en: "Are you 18 or older?", it: "Hai almeno 18 anni?" },
    ageGateMsg: { es: "Este es un espacio solo para mayores de 18 años. Confirma tu edad para continuar.", en: "This space is for adults 18 and over only. Please confirm your age to continue.", it: "Questo spazio è riservato ai maggiori di 18 anni. Conferma la tua età per continuare." },
    ageYes: { es: "Sí, tengo 18+", en: "Yes, I'm 18+", it: "Sì, ho 18+" },
    ageNo: { es: "No, soy menor", en: "No, under 18", it: "No, sono minorenne" },
    ageDenied: { es: "Lo sentimos, debes ser mayor de 18 para entrar.", en: "Sorry, you must be 18+ to enter.", it: "Spiacenti, devi avere più di 18 anni per entrare." },
    shopTitle: { es: "La Tienda", en: "The Shop", it: "Lo Shop" },
    addToCart: { es: "Añadir", en: "Add", it: "Aggiungi" },
    added: { es: "✓ Añadido", en: "✓ Added", it: "✓ Aggiunto" },
    cart: { es: "Carrito", en: "Cart", it: "Carrello" },
    checkout: { es: "Finalizar compra", en: "Checkout", it: "Vai al pagamento" },
    typing: { es: "escribiendo...", en: "typing...", it: "sta scrivendo..." },
    recommended: { es: "Recomendado para ti", en: "Recommended for you", it: "Consigliato per te" },
    total: { es: "Total", en: "Total", it: "Totale" },
    emptyCart: { es: "Tu carrito está vacío. Déjame ayudarte a encontrar algo especial.", en: "Your cart is empty. Let me help you find something special.", it: "Il tuo carrello è vuoto. Lascia che ti aiuti a trovare qualcosa di speciale." },
    all: { es: "Todo", en: "All", it: "Tutto" },
    chatTitle: { es: "Kaya · budtender", en: "Kaya · budtender", it: "Kaya · budtender" },
    online: { es: "en línea", en: "online", it: "online" },
    onlyLeft: { es: "¡Solo quedan {n}!", en: "Only {n} left!", it: "Ne restano solo {n}!" },
    checkoutMsg: { es: "🎉 ¡Demo! Pedido simulado por {t}. En producción aquí iría la pasarela de pago.", en: "🎉 Demo! Simulated order for {t}. In production the payment gateway goes here.", it: "🎉 Demo! Ordine simulato per {t}. In produzione qui andrebbe il pagamento." },
    save: { es: "AHORRA {v}", en: "SAVE {v}", it: "RISPARMI {v}" },
    promoText: { es: "🚚 Envío gratis desde 60€", en: "🚚 Free shipping over €60", it: "🚚 Spedizione gratis sopra 60€" },
    promoOffer: { es: "−10% con KAYA10", en: "−10% with KAYA10", it: "−10% con KAYA10" },
    promoEnds: { es: "termina en", en: "ends in", it: "termina tra" },
    shipRemaining: { es: "Te faltan <b>{v}</b> para el envío gratis 🚚", en: "You're <b>{v}</b> away from free shipping 🚚", it: "Ti mancano <b>{v}</b> alla spedizione gratis 🚚" },
    shipDone: { es: "🎉 ¡Tienes envío GRATIS!", en: "🎉 You've unlocked FREE shipping!", it: "🎉 Hai sbloccato la spedizione GRATIS!" },
    profStep: { es: "Pregunta {a} de {b}", en: "Question {a} of {b}", it: "Domanda {a} di {b}" },
    shopLead: { es: "Selección curada · precios en € · solo +18", en: "Curated selection · prices in € · 18+ only", it: "Selezione curata · prezzi in € · solo +18" },
    trust: { es: ["⭐ 4.9/5", "🚚 Envío gratis +60€", "🔒 Embalaje discreto"], en: ["⭐ 4.9/5", "🚚 Free shipping +60€", "🔒 Discreet packaging"], it: ["⭐ 4.9/5", "🚚 Spedizione gratis +60€", "🔒 Imballo discreto"] }
  },

  // Social proof "soft" (bilanciato): messaggi a rotazione, reali e credibili
  socialProof: {
    es: ["🔥 <b>{n} personas</b> están viendo esto ahora", "✅ Última compra hace <b>{m} min</b> en Las Palmas", "⭐ <b>{n}</b> pedidos esta semana", "📦 <b>Envío gratis</b> desbloqueado a partir de 60€"],
    en: ["🔥 <b>{n} people</b> are viewing this right now", "✅ Last order <b>{m} min ago</b> in Las Palmas", "⭐ <b>{n}</b> orders this week", "📦 <b>Free shipping</b> unlocked from €60"],
    it: ["🔥 <b>{n} persone</b> lo stanno guardando ora", "✅ Ultimo ordine <b>{m} min fa</b> a Las Palmas", "⭐ <b>{n}</b> ordini questa settimana", "📦 <b>Spedizione gratis</b> sbloccata da 60€"]
  },
  freeShipThreshold: 60,

  // Etichette categorie come sul sito reale (ES) + EN/IT
  catLabels: {
    Cartine:       { es: "Papel de liar", en: "Rolling papers", it: "Cartine" },
    Grinder:       { es: "Grinders", en: "Grinders", it: "Grinder" },
    Accendini:     { es: "Mecheros", en: "Lighters", it: "Accendini" },
    Vaporizzatori: { es: "Vaporizadores", en: "Vaporizers", it: "Vaporizzatori" },
    CBD:           { es: "CBD", en: "CBD", it: "CBD" },
    Edibles:       { es: "Comestibles", en: "Edibles", it: "Edibili" },
    Accessori:     { es: "Accesorios", en: "Accessories", it: "Accessori" }
  },

  // Top utility bar + banner + footer (come il sito ufficiale)
  site: {
    topShipping: { es: "🚚 Envío gratis desde 60€ en Canarias", en: "🚚 Free shipping over €60 in the Canaries", it: "🚚 Spedizione gratis da 60€ alle Canarie" },
    topHours:    { es: "🕗 L-V 12:00–19:00", en: "🕗 Mon–Fri 12:00–19:00", it: "🕗 Lun–Ven 12:00–19:00" },
    topPhone:    "☎ 611 101 375",
    login:       { es: "Acceder", en: "Login", it: "Accedi" },
    register:    { es: "Registrarse", en: "Register", it: "Registrati" },
    searchPh:    { es: "Buscar productos…", en: "Search products…", it: "Cerca prodotti…" },
    bannerKicker:{ es: "Tu boutique de bienestar, cultura & lifestyle", en: "Your wellness, culture & lifestyle boutique", it: "La tua boutique di benessere, cultura & lifestyle" },
    bannerScript:{ es: "Bienvenido a Kayaman's Farm", en: "Welcome to Kayaman's Farm", it: "Benvenuto da Kayaman's Farm" },
    bannerSub:   { es: "CBD y parafernalia premium, seleccionados a mano en Las Palmas.", en: "Premium CBD & paraphernalia, hand-picked in Las Palmas.", it: "CBD e accessori premium, selezionati a mano a Las Palmas." },
    bannerCta:   { es: "Comprar ahora", en: "Shop now", it: "Acquista ora" },
    bannerCta2:  { es: "Hablar con Kaya", en: "Chat with Kaya", it: "Parla con Kaya" },
    catShop:     { es: "Comprar por categoría", en: "Shop by category", it: "Acquista per categoria" },
    secDestacados:{ es: "Destacados", en: "Featured", it: "In evidenza" },
    secNovedades:{ es: "Novedades", en: "New arrivals", it: "Novità" },
    secOfertas:  { es: "Ofertas", en: "Deals", it: "Offerte" },
    allShop:     { es: "Toda la tienda", en: "Full shop", it: "Tutto lo shop" },
    footTienda:  { es: "La Tienda", en: "The Shop", it: "Lo Shop" },
    footLinks:   { es: "Información", en: "Information", it: "Informazioni" },
    footPay:     { es: "Pago seguro", en: "Secure payment", it: "Pagamento sicuro" },
    footLinksList:{ es: ["Aviso Legal","Envíos y devoluciones","FAQ","Política de privacidad"], en: ["Legal notice","Shipping & returns","FAQ","Privacy policy"], it: ["Note legali","Spedizioni e resi","FAQ","Privacy"] },
    footAddr:    "Calle Pascal 26, Las Palmas de Gran Canaria",
    footEmail:   "info@kayamansfarm.com",
    footHours:   { es: "Horario: L-V 12:00–19:00", en: "Hours: Mon–Fri 12:00–19:00", it: "Orari: Lun–Ven 12:00–19:00" }
  },

  // 🔥 Neuromarketing dei MIGLIORI venditori — il "venditore" che ti vende l'impossibile
  seller: {
    // apertura proattiva da venditore d'élite (Belfort straight-line + tono caldo)
    pitchOpen: {
      es: "Te voy a ser MUY honesto: la mayoría sale de aquí con lo justo. Yo no trabajo así. Dame 20 segundos y te monto el setup perfecto para ti, al mejor precio. ¿Trato hecho? 🤝",
      en: "I'll be REAL with you: most people leave with just the basics. That's not how I work. Give me 20 seconds and I'll build you the perfect setup, at the best price. Deal? 🤝",
      it: "Sarò MOLTO onesto: la maggior parte esce di qui col minimo. Io non lavoro così. Dammi 20 secondi e ti costruisco il setup perfetto per te, al prezzo migliore. Affare fatto? 🤝"
    },
    // value-stacking (Hormozi): impila valore prima del prezzo
    valueStack: {
      es: "Mira lo que te llevas: producto premium ✅ truco de experto gratis ✅ envío discreto ✅ y mi garantía personal de que acertarás. Todo esto por menos de lo que cuesta un capricho. 🎁",
      en: "Look at everything you get: premium product ✅ free expert trick ✅ discreet shipping ✅ and my personal guarantee you'll love it. All for less than a casual treat. 🎁",
      it: "Guarda cosa ti porti a casa: prodotto premium ✅ trucco da esperto gratis ✅ spedizione discreta ✅ e la mia garanzia personale che ci azzeccherai. Tutto per meno di uno sfizio. 🎁"
    },
    // chiusura assuntiva
    assumptiveClose: {
      es: "Te lo dejo ya en el carrito para que no lo pierdas — si luego no te encaja, lo quitas en un segundo. ¿Empezamos por el más vendido? 👇",
      en: "I'll drop it in your cart so you don't lose it — if it's not for you, remove it in one tap. Shall we start with the bestseller? 👇",
      it: "Te lo metto già nel carrello così non lo perdi — se poi non fa per te lo togli in un attimo. Partiamo dal più venduto? 👇"
    },
    // offerta bundle irresistibile
    bundle: {
      es: "Y aquí va la jugada: llévate el pack y te hago precio cerrado — {was} se quedan en {now}. Ahorras {save} y tienes el kit completo. Esto no se lo hago a todo el mundo. 😉",
      en: "Here's the play: take the pack and I'll do bundle pricing — {was} drops to {now}. You save {save} and get the complete kit. I don't do this for everyone. 😉",
      it: "Ecco la mossa: prendi il pack e ti faccio prezzo chiuso — {was} diventano {now}. Risparmi {save} e hai il kit completo. Non lo faccio con tutti. 😉"
    },
    bundleAdd: { es: "Añadir el pack y ahorrar {save}", en: "Add the pack & save {save}", it: "Aggiungi il pack e risparmia {save}" },
    // cross-sell concatenato ("compraste esto → compra esto que te hará falta")
    chain: {
      es: ["¡Hola amigo! 👋 Ya que llevas {x}, te hará falta {y} 👇", "Buen ojo 😏 con {x} casi todos se llevan también {y} — te lo señalo 👇", "Espera, no te vayas sin {y}: con {x} es justo lo que necesitas 👇"],
      en: ["Hey amigo! 👋 Since you're getting {x}, you'll need {y} 👇", "Good eye 😏 with {x} almost everyone also grabs {y} — let me point it out 👇", "Wait, don't leave without {y}: with {x} it's exactly what you need 👇"],
      it: ["Ehi amigo! 👋 Visto che prendi {x}, ti servirà {y} 👇", "Occhio 😏 con {x} quasi tutti prendono anche {y} — te lo indico 👇", "Aspetta, non andare senza {y}: con {x} è proprio quello che ti serve 👇"]
    },
    pick: { es: "👉 La elección de Kaya", en: "👉 Kaya's pick", it: "👉 La scelta di Kaya" },
    shipPush: { es: "Y con esto te quedas a solo {v} del envío GRATIS 🚚 ¿lo redondeamos?", en: "And this leaves you just {v} from FREE shipping 🚚 shall we round it up?", it: "E con questo resti a soli {v} dalla spedizione GRATIS 🚚 lo arrotondiamo?" },
    shipUnlock: { es: "¡Y con esto DESBLOQUEAS el envío GRATIS! 🎉🚚 No lo dejes a medias.", en: "And this UNLOCKS your FREE shipping! 🎉🚚 Don't leave it half-done.", it: "E con questo SBLOCCHI la spedizione GRATIS! 🎉🚚 Non lasciarlo a metà." },
    poke: {
      es: ["¡Ey! 😎 Tranquilo, que ya te estoy buscando lo mejor.", "Jajaja me haces cosquillas 🤙 ¿qué buscamos?", "Aquí Kaya, siempre listo 🌿 dime qué necesitas."],
      en: ["Hey! 😎 Easy there, I'm already finding you the good stuff.", "Haha that tickles 🤙 what are we after?", "Kaya here, always ready 🌿 tell me what you need."],
      it: ["Ehi! 😎 Calmo, ti sto già cercando il meglio.", "Ahah mi fai il solletico 🤙 cosa cerchiamo?", "Kaya qui, sempre pronto 🌿 dimmi cosa ti serve."]
    },
    // urgenza finale
    urgency: {
      es: "Una cosa más: el descuento de hoy caduca cuando se acaba el contador de arriba. Yo de ti no lo dejaría escapar. ⏳",
      en: "One more thing: today's discount expires when the timer up top hits zero. If I were you, I wouldn't let it slip. ⏳",
      it: "Un'ultima cosa: lo sconto di oggi scade quando il contatore in alto arriva a zero. Se fossi in te non me lo farei scappare. ⏳"
    }
  },

  greetings: {
    es: "¡Hola y bienvenido a Kayaman's Farm! Soy Kaya, tu budtender personal. Para acertar contigo, déjame hacerte un par de preguntas rápidas. 🌿",
    en: "Hey, welcome to Kayaman's Farm! I'm Kaya, your personal budtender. To nail the perfect pick, let me ask you a couple of quick questions. 🌿",
    it: "Ehi, benvenuto da Kayaman's Farm! Sono Kaya, il tuo budtender personale. Per azzeccare il consiglio giusto, lascia che ti faccia un paio di domande veloci. 🌿"
  },

  // Frasi del motore di re-engagement "spietato"
  reengage: {
    idle: {
      es: ["¿Sigues ahí? 👀 Te he guardado un truco: gasta 60€ y el envío es gratis.", "Psst… mientras piensas, este Clipper vuela. ¿Lo quieres ver?", "No te decides, ¿eh? Dime tu presupuesto y te lo pongo fácil. 😏"],
      en: ["Still there? 👀 I saved you a tip: spend €60 and shipping's free.", "Psst… while you think, this Clipper is flying off the shelf. Wanna see?", "Can't decide, huh? Tell me your budget and I'll make it easy. 😏"],
      it: ["Ci sei ancora? 👀 Ti ho tenuto un trucco: spendi 60€ e la spedizione è gratis.", "Psst… mentre pensi, questo Clipper sta volando via. Vuoi vederlo?", "Non ti decidi, eh? Dimmi il budget e ti semplifico la vita. 😏"]
    },
    minimized: {
      es: "Tienes 1 mensaje nuevo de Kaya 💬", en: "You have 1 new message from Kaya 💬", it: "Hai 1 nuovo messaggio da Kaya 💬"
    },
    exitIntent: {
      title: { es: "¡Espera! 🌿", en: "Wait! 🌿", it: "Aspetta! 🌿" },
      body: { es: "Antes de irte: usa el código KAYA10 y llévate un 10% en tu primer pedido. Oferta válida solo ahora.", en: "Before you go: use code KAYA10 for 10% off your first order. Offer valid right now only.", it: "Prima di andare: usa il codice KAYA10 e prendi il 10% sul primo ordine. Offerta valida solo ora." },
      cta: { es: "Quiero mi 10%", en: "I want my 10%", it: "Voglio il mio 10%" },
      expires: { es: "Caduca en", en: "Expires in", it: "Scade tra" }
    },
    tabBait: { es: "👀 Vuelve aquí…", en: "👀 Come back…", it: "👀 Torna qui…" }
  },

  // 🧝 ELFO COMPAGNO: personaggio interattivo che ti segue nell'acquisto (fumetti contestuali)
  companion: {
    welcome: {
      es: "¡Ey! Soy Kaya 🌿 Tócame cuando quieras y te guío en la compra.",
      en: "Hey! I'm Kaya 🌿 Tap me anytime and I'll guide your shopping.",
      it: "Ehi! Sono Kaya 🌿 Toccami quando vuoi e ti guido nell'acquisto."
    },
    add: {
      es: ["¡Buen ojo! 👌 ¿Te enseño con qué combina?", "Ese vuela. 🔥 Lo tienes en el carrito.", "Me gusta tu estilo. ¿Seguimos montando el pack?"],
      en: ["Great pick! 👌 Want to see what it pairs with?", "That one flies. 🔥 It's in your cart.", "Love your taste. Shall we build the pack?"],
      it: ["Ottimo occhio! 👌 Ti mostro con cosa si abbina?", "Quello vola. 🔥 È nel carrello.", "Mi piace il tuo stile. Completiamo il pack?"]
    },
    shipClose: {
      es: "¡Casi! Te faltan {v} para envío GRATIS 🚚",
      en: "Almost! You're {v} from FREE shipping 🚚",
      it: "Ci sei quasi! Ti mancano {v} alla spedizione GRATIS 🚚"
    },
    shipDone: {
      es: "¡Boom! Envío GRATIS desbloqueado 🎉",
      en: "Boom! FREE shipping unlocked 🎉",
      it: "Boom! Spedizione GRATIS sbloccata 🎉"
    },
    cart: {
      es: "¿Cerramos el pedido? Te cuido el descuento 😉",
      en: "Shall we close the order? I'll keep your discount 😉",
      it: "Chiudiamo l'ordine? Ti tengo lo sconto 😉"
    },
    browse: {
      es: "Buena zona 👀 ¿Te marco lo mejor? Tócame.",
      en: "Nice section 👀 Want my top picks? Tap me.",
      it: "Bella zona 👀 Ti segno il meglio? Toccami."
    },
    tapToOpen: { es: "Tócame para hablar", en: "Tap me to chat", it: "Toccami per parlare" }
  },

  // ⭐ MARKETING: prova sociale, rating, fiducia (aumenta conversione e rating)
  marketing: {
    globalRating: { value: "4.9", count: "2.300+" },
    trust: {
      es: ["🔒 Pago 100% seguro", "🚚 Envío discreto", "✅ +2.300 reseñas verificadas", "↩️ Devolución en 7 días"],
      en: ["🔒 100% secure payment", "🚚 Discreet shipping", "✅ 2,300+ verified reviews", "↩️ 7-day returns"],
      it: ["🔒 Pagamento sicuro", "🚚 Spedizione discreta", "✅ +2.300 recensioni verificate", "↩️ Reso in 7 giorni"]
    },
    reviewsTitle: { es: "Lo que dicen nuestros clientes", en: "What our customers say", it: "Cosa dicono i clienti" },
    reviewsSub: { es: "4.9/5 · más de 2.300 reseñas verificadas", en: "4.9/5 · 2,300+ verified reviews", it: "4.9/5 · oltre 2.300 recensioni verificate" },
    testimonials: [
      { name: "Marco R.", stars: 5, es: "Pedido discreto y rapidísimo. El grinder es una pasada, repetiré seguro.", en: "Discreet and super fast delivery. The grinder is amazing, definitely reordering.", it: "Ordine discreto e velocissimo. Il grinder è una bomba, riordino di sicuro." },
      { name: "Lucía P.", stars: 5, es: "Kaya me ayudó a elegir el CBD perfecto. Atención de 10.", en: "Kaya helped me pick the perfect CBD. Top-notch service.", it: "Kaya mi ha aiutata a scegliere il CBD perfetto. Servizio top." },
      { name: "David S.", stars: 4, es: "Buena calidad y precios justos. El pack me salió genial.", en: "Great quality and fair prices. The pack was a great deal.", it: "Buona qualità e prezzi giusti. Il pack è stato un affare." },
      { name: "Sara M.", stars: 5, es: "Los Clipper coleccionables son preciosos. Llegó todo perfecto.", en: "The collectible Clippers are gorgeous. Everything arrived perfect.", it: "I Clipper da collezione sono bellissimi. Arrivato tutto perfetto." }
    ],
    soldToday: { es: "comprados hoy", en: "bought today", it: "comprati oggi" },
    verified: { es: "Compra verificada", en: "Verified purchase", it: "Acquisto verificato" },
    ratePrompt: { es: "¿Qué tal tu experiencia? Tu valoración sube nuestro rating ⭐", en: "How was your experience? Your rating boosts ours ⭐", it: "Com'è andata? La tua valutazione alza il nostro rating ⭐" },
    rateThanks: { es: "¡Gracias! 🙌 Tus {n}★ nos ayudan muchísimo. Te dejo un −5% extra: GRACIAS5", en: "Thanks! 🙌 Your {n}★ help a lot. Here's an extra −5%: GRACIAS5", it: "Grazie! 🙌 Le tue {n}★ ci aiutano tantissimo. Ti lascio un −5% extra: GRACIAS5" },
    barItems: { es: "art.", en: "items", it: "art." },
    newsletter: {
      title: { es: "Únete al club y llévate −10%", en: "Join the club for −10%", it: "Iscriviti al club e prendi −10%" },
      sub: { es: "Ofertas, novedades y trucos de experto. Sin spam, prometido.", en: "Deals, drops & expert tips. No spam, promise.", it: "Offerte, novità e trucchi da esperto. Niente spam, promesso." },
      placeholder: { es: "Tu email", en: "Your email", it: "La tua email" },
      cta: { es: "Quiero mi −10%", en: "Get my −10%", it: "Voglio il mio −10%" },
      thanks: { es: "¡Bienvenido al club! 🎉 Tu código: BIENVENIDO10", en: "Welcome to the club! 🎉 Your code: BIENVENIDO10", it: "Benvenuto nel club! 🎉 Il tuo codice: BIENVENIDO10" }
    }
  }
};
