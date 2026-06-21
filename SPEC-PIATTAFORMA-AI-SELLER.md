# AI Seller — Spec per ricostruire il software come piattaforma (brief per Cowork)

> Documento da passare a Cowork per fargli capire **cos'è il progetto** e **cosa costruire**:
> una piattaforma SaaS dove inserisci l'URL di un sito e il software genera in automatico
> un chatbot-venditore su misura (colori, personaggio/mascotte, prodotti, copy, lingua),
> pronto da installare con una riga di codice.
>
> Autore: Blackstar Digital Studio · **Made in Italy 🇮🇹**

---

## 1. In una frase

**AI Seller** è un chatbot-venditore *white-label* che si installa sul sito di un cliente con
**una riga di codice**, si auto-configura per quel cliente (colori, settore, prodotti/servizi,
personaggio), parla **IT/ES/EN**, e converte i visitatori: o li porta su **WhatsApp** come lead,
o li guida all'**acquisto** con cross-sell. Lo stesso identico motore veste ogni cliente in modo
diverso leggendo un file di configurazione JSON.

L'obiettivo di questo documento: trasformare ciò che oggi è semi-manuale in una **piattaforma**
dove tutto è già sviluppato e il flusso *"incolla URL → bot pronto"* è automatico.

---

## 2. La visione da costruire (l'obiettivo)

```
            ┌─────────────────────────────────────────────────────────┐
   URL  ──► │  1. ANALIZZA   leggi sito: brand, logo, colori, settore, │
            │                prodotti/prezzi/foto/categorie            │
            │  2. GENERA     personaggio/mascotte (immagini AI),       │
            │                copy di vendita IT/ES/EN, cross-sell       │
            │  3. ASSEMBLA   un file config JSON del cliente            │
            │  4. PUBBLICA   deploy + snippet pronto da incollare       │
            └─────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    Bot live sul sito del cliente
```

Una **dashboard multi-cliente** dove l'agenzia (o il cliente stesso) incolla l'URL, rivede/ritocca
ciò che il software ha proposto (è già previsto un pannello, vedi §7), e pubblica. Niente lavoro
manuale ripetitivo: il software fa il 90%, l'umano conferma.

---

## 3. Architettura attuale (cosa esiste GIÀ e si riusa)

Stack volutamente semplice: **HTML/CSS/JS vanilla, nessun build, nessun framework**. Il motore è
**data-driven**: tutta la logica è generica, i dati del cliente arrivano da un JSON.

| Pezzo | File | Ruolo |
|---|---|---|
| **Motore** | `app.js` | Il cervello del bot: conversazione, profilazione, neuromarketing, cross-sell, memoria cliente, multilingua. ~2000 righe, generico. |
| **Dati base/demo** | `data/data.js`, `config.js` | Config di default (demo Kayaman). Sovrascritta a runtime dalla config del cliente. |
| **UI/stili** | `styles.css`, `index.html` | La chat (bolle, mascotte, card prodotto, barra carrello). |
| **Widget universale** | `widget.js` | Lo snippet che il cliente incolla. Auto-rileva il tenant dal dominio, inietta la chat in un iframe. |
| **Config cliente** | `clients/<tenant>.json` | Il "vestito" di ogni cliente (vedi §5). È il contratto chiave. |
| **Pannello creazione** | `studio.html` | URL → analizza → scegli prodotti → colore/tono/personaggio → snippet. (vedi §7) |
| **Pannello controllo** | `pannello.html` | Stato bot, cambio mascotte, editor config, salva via API. |

### Come si applica una config (il punto centrale del motore)
`app.js` espone `window.KF_DATA` (la config attiva). La funzione **`mergeTenant(p)`** prende il JSON
del cliente e ne applica i campi a `KF_DATA` (whitelist di chiavi). **Regola d'oro per chi estende:**
ogni nuovo campo di config deve essere aggiunto a `mergeTenant` per propagarsi, altrimenti viene
ignorato.

### Il widget universale (lo snippet che non cambia mai)
```html
<script src="https://aiseller.pages.dev/widget.js" defer></script>
```
`widget.js` contiene una `HOSTMAP` che mappa dominio → tenant → colore → (eventuale restrizione di
path). Esempio reale:
```js
var HOSTMAP = [
  ["blackstardigitalstudio", "blackstar",  "#a68732", null],
  ["gasproject",             "gasproject", "#0099b8", null],
  ["ilraviolo",              "ilraviolo",  "#e8b84f", /\/bottega/i], // solo su /bottega
  ["mariowine",              "mariowine",  "#7b1e3b", null]
];
```
Il widget rileva `location.hostname`, carica `clients/<tenant>.json`, apre la chat in iframe
(`/?widget=1&config=...&accent=...`). Per i clienti che non possono editare l'HTML di ogni pagina,
si inietta via Hostinger `.htaccess` + `mod_substitute` (file `aiseller-htaccess.txt`).

---

## 4. Il motore: cosa sa fare (feature da preservare)

- **Due modalità**: `lead` (servizi → prenotazione/contatto su WhatsApp) e `shop` (e-commerce con
  carrello).
- **Profilazione conversazionale**: poche domande guidate (categoria, budget…) con quick-reply.
- **Neuromarketing**: tattiche di vendita (autorità, riprova sociale, anchoring, scarsità) scelte
  in base al profilo; card "la mia scelta"; mascotte che indica il prodotto.
- **Cross-sell "costruisci il piatto/ordine"** (food/bottega): scegli un prodotto → abbina il
  complemento giusto (mai stessa categoria) → propone la portata successiva → "ordina tutto" su
  WhatsApp. Catena definita in `crossSell` (es. Pasta → Salse → Salumi → Formaggi → Vino → Dolci).
  C'è una *knowledge base culinaria* (`FOOD_PAIRINGS`) che sceglie l'abbinamento sensato (ravioli di
  carne → ragù, non un'altra pasta).
- **Memoria cliente** (localStorage, first-party, niente invii esterni): ricorda **nome**, lingua,
  prodotti aggiunti/ordinati, visite. Alla visita dopo: *"Bentornato, Marco!"* + aggancio al
  preferito. Pulsante **"Non sono io"** = reset (diritto all'oblio). Flag config `remember:false`.
  Vedi nota privacy: `PRIVACY-MEMORIA-CLIENTE.md`.
- **Multilingua IT/ES/EN**: rileva la lingua del browser e dal testo digitato; ogni stringa di copy
  è un oggetto `{es,it,en}`.
- **Copy orientato alla conversione**: in modalità lead, il bottone di contatto è l'azione primaria
  (primo, etichetta tipo "💬 Scrivici su WhatsApp") e l'ultima frase invita esplicitamente a
  scrivere, a bassa frizione.
- **Gestione emergenze** (officina): frasi tipo "rimasto a piedi" bypassano tutto e propongono
  contatto immediato (chiamata + WhatsApp).
- **Sicurezza**: escaping XSS (`esc()`), validazione URL immagini (`safeImg()`), header
  (nosniff, referrer-policy), check origin su `postMessage`.

---

## 5. Lo schema della config del cliente (IL CONTRATTO)

È ciò che l'analizzatore deve produrre. Esempio reale (Il Raviolo Bottega), ridotto:

```jsonc
{
  "brand": "Il Raviolo Bottega",
  "host": "ilraviolo.es",                 // dominio del cliente (per HOSTMAP)
  "mode": "lead",                          // "lead" | "shop"
  "accent": "#e8b84f",                     // colore brand (dal sito)
  "dark": true, "bg": "#0a1f35",           // tema chat scuro/chiaro + superficie
  "logo": "https://.../logo.webp",
  "character": {                            // mascotte (4 pose, qui stessa img)
    "rest": "url", "point": "url", "pointBack": "url", "face": "url",
    "w": 1024, "h": 1536
  },                                        // oppure character:false = nessuna mascotte
  "askName": true,                          // chiede il nome a inizio chat
  "remember": true,                         // memoria cliente (default true)
  "emergency": false,                       // flusso emergenza on/off (off fuori officina)
  "itemEmoji": "🍝",                        // emoji segnaposto del settore
  "persona": { "name": "Il Raviolo Bottega",
               "role": {"es":"tu tendero","it":"il tuo bottegaio","en":"your deli host"} },

  "greeting": {"es":"…","it":"…","en":"…"}, // saluto iniziale (gancio)
  "askHint":  {"es":"…","it":"…","en":"…"}, // suggerimento input libero
  "problemEmpathy": {"es":["…"],"it":["…"],"en":["…"]},
  "acks":     {"es":["…"],"it":["…"],"en":["…"]}, // reazioni "ti ho ascoltato"
  "teasers":  {"es":["…"],"it":["…"],"en":["…"]}, // nuvolette di richiamo

  "lead": {                                 // contatto/prenotazione
    "whatsapp": "34671085862", "phone": "+34671085862",
    "bookText": "¡Hola! Me gustaría encargar: ",
    "cta": {"es":"Encargar por WhatsApp","it":"Ordina su WhatsApp","en":"Order on WhatsApp"}
  },

  "catLabels": { "Pasta fresca": {"es":"…","it":"…","en":"…"}, … }, // nomi reparti per lingua
  "emoji":     { "Pasta fresca": "🥟", "Salsas": "🍅", … },          // emoji per reparto
  "pick":      {"es":"Mi elección","it":"La mia scelta","en":"My pick"},
  "ctaAdd":    {"es":"➕ Añadir","it":"➕ Aggiungi","en":"➕ Add"},

  "crossSell": {                            // catena di abbinamenti (solo food/bottega)
    "Pasta fresca": { "suggest": "Salsas",
      "pitch": {"es":"¿Le añadimos una salsa? 🍅","it":"Ci mettiamo un sugo? 🍅","en":"…"} },
    "Salsas": { "suggest": "Embutidos", "pitch": {…} }
    // … Salumi→Formaggi→Vino→Dolci
  },
  "prepInstructions": [                      // istruzioni cottura per prodotto (piatti pronti)
    { "match": "lasagne|lasaña|parmigiana", "text": {"es":"🔥 …","it":"🔥 …","en":"🔥 …"} }
  ],

  "profiling": [                             // domande guidate (override per settore)
    { "intent": "category",
      "q": {"es":"¿Qué te apetece? 👇","it":"Cosa ti va? 👇","en":"What do you fancy? 👇"},
      "options": [ { "es":"Pasta fresca 🥟","it":"Pasta fresca 🥟","en":"Fresh pasta 🥟",
                     "val":"Pasta fresca" }, … ] }
  ],

  "products": [                              // catalogo (shop) o servizi (lead)
    { "id": 8033, "name": "Ravioli carne", "category": "Pasta fresca", "price": 2.5,
      "description": "…", "imageUrl": "https://…", "badge": "⭐ Destacado",
      "keys": ["pasta","fresca","ravioli","carne"], "stock": 99 }
    // badge tipo "⭐ Destacado" = prodotto da spingere; "🎉 Solo por hoy" = offerta
  ]
}
```

Note importanti:
- Ogni testo rivolto all'utente è **`{es,it,en}`** (mai stringa secca).
- `keys` sono parole-chiave per il matching del testo libero e degli abbinamenti.
- `badge` è la leva neuromarketing (in evidenza/offerta).
- I campi sono **opzionali**: assenza = comportamento di default del motore generico.

---

## 6. La pipeline URL → config (l'analizzatore da industrializzare)

Oggi esiste già un endpoint chiamato dal pannello: **`GET /api/scrape?url=<sito>`** che ritorna
`{ count, brand, host, platform, mode, products:[…] }` (rileva la piattaforma — Shopify/Woo/ecc. —
ed estrae prodotti, prezzi, foto, categorie). ⚠️ Era ospitato su **Vercel** (ora deprecato nella
migrazione a Cloudflare): **va ricostruito** come funzione serverless (Cloudflare Worker) o come
automazione dentro Cowork. È il primo mattone da rifare.

Pipeline completa da realizzare:

1. **Analisi sito** (`/api/scrape`)
   - Rileva piattaforma e-commerce (Shopify `/products.json`, WooCommerce REST, sitemap, JSON-LD
     `Product`, OpenGraph) → estrai **prodotti**: nome, prezzo, foto, categoria, descrizione.
   - Se non è e-commerce → **modalità lead** (sito di servizi): estrai i servizi dai titoli/sezioni.
   - Estrai **brand** (title/og:site_name), **logo** (og:image/favicon/logo), **colori** (palette
     dominante dal CSS/logo → `accent`, decide `dark`/`bg`).
   - Rileva **settore** (officina, ristorante/bottega, agenzia, vino…) per scegliere tono, emoji,
     se attivare `emergency` e `crossSell`.

2. **Generazione personaggio/mascotte** (oggi semi-manuale: lo `studio.html` offre *prompt pronti*
   e poi si caricano le immagini). Da automatizzare:
   - Genera la mascotte con un modello immagini (es. prompt brand-aware → 1 immagine PNG/WebP a
     sfondo trasparente, formato verticale ~1024×1536).
   - Servono idealmente 4 pose (`rest`, `point`, `pointBack`, `face`) — si può partire da 1 sola
     riusata, come fa Il Raviolo.
   - Opzione **logo overlay** sul personaggio (già previsto nello studio: posizione + scala).

3. **Generazione copy IT/ES/EN** (LLM): da brand + settore + prodotti produci
   `greeting`, `askHint`, `acks`, `teasers`, `persona.role`, `profiling`, `catLabels`, e — se food —
   la catena `crossSell` + `prepInstructions`. Tutto orientato alla conversione (gancio + invito
   chiaro al contatto).

4. **Assemblaggio config** → `clients/<tenant>.json` secondo lo schema §5.

5. **Pubblicazione**: salva la config (oggi `POST /api/save`), aggiungi il tenant alla `HOSTMAP`,
   deploy, e restituisci lo **snippet** pronto + l'anteprima live.

> Modelli consigliati per la parte AI: **Claude (famiglia 4.x)** per analisi sito + copy
> multilingua; un generatore di immagini per la mascotte. (Per AI Seller a runtime invece **non**
> serve LLM: il motore del bot è a regole, così gira gratis e non cade.)

---

## 7. Il pannello di creazione già pronto (`studio.html`) — da incapsulare

Fa già quasi tutto il flusso, va inglobato nella piattaforma e completato:

1. Campo **URL** + "Analizza" → chiama `/api/scrape`, mostra **N prodotti trovati** e la piattaforma.
2. **Griglia prodotti**: clicchi quelli da **spingere** (diventano `badge`).
3. **Modalità** servizi (Lead) vs prodotti (Shop) — auto-rilevata, modificabile.
4. **Tono di voce** (selettore).
5. **Colore brand** (color picker + swatches auto-proposte) → `accent`.
6. **Personaggio**: prompt pronti per generare la mascotte + upload immagini + flip + **logo sul
   personaggio** (posizione/scala con anteprima).
7. **Genera** → produce lo **snippet** + box embed, e **salva/pubblica** il cliente (`/api/save`).

Pannello di controllo separato (`pannello.html`): stato dei bot, cambio mascotte, editor della
config JSON, salvataggio via API.

---

## 8. Cosa costruire nella piattaforma (il delta rispetto a oggi)

| Area | Oggi | Da costruire in Cowork |
|---|---|---|
| Analizzatore `/api/scrape` | era su Vercel, orfano | rifare come Worker/automazione |
| Generazione mascotte | prompt manuali + upload | generazione immagini automatica |
| Generazione copy | manuale/assistita | pipeline LLM IT/ES/EN |
| Multi-cliente | cartella `clients/*.json` | dashboard SaaS: auth, lista clienti, ruoli |
| Onboarding | studio.html standalone | wizard guidato URL→pubblica dentro la piattaforma |
| Deploy per cliente | git push + HOSTMAP a mano | provisioning automatico (config + dominio + snippet) |
| Billing | — | 3 fasce (vedi §10) + attivazione una-tantum |
| Statistiche | eventi `postMessage` (`chat_open`, `chat_lead`, `click_chiama`…) | dashboard conversioni per cliente |

Eventi già emessi dal bot al sito ospite (per analytics): `chat_open`, `chat_lead` (bot→WhatsApp),
`click_chiama`, `click_whatsapp`. La piattaforma dovrebbe raccoglierli per mostrare il funnel
*aperture → contatti*.

---

## 9. Hosting & deploy attuali (da conoscere)

- **Repo privato** GitHub `blackstardigitalstudio/aiseller`.
- **Cloudflare Pages** progetto `aiseller` (`aiseller.pages.dev`): serve `widget.js`, `app.js`,
  `styles.css`, `index.html`, `clients/`, ecc. CORS aperto via file `_headers`.
- **Deploy automatico**: push su `main` → GitHub Action `deploy-cloudflare.yml` pubblica.
- **Sync cataloghi**: per i clienti con catalogo dinamico (es. Il Raviolo da Supabase) c'è una
  Action cron che rigenera `clients/<tenant>.json` (`sync-ilraviolo.yml` + `scripts/build-*.mjs`).
- **Cache-bust**: in `index.html` la versione `?v=NN` va incrementata a ogni modifica del motore
  (4 punti) per invalidare la cache.
- **Vercel è deprecato** (lo storage Blob morì → si è migrato qui). Non riusarlo.

---

## 10. Pricing (le 3 fasce, per il billing della piattaforma)

| | Prezzo | Include |
|---|---|---|
| **Base** | 49 €/mese | Bot sul sito (1 riga), mascotte, 1 lingua, lead→WhatsApp |
| **Pro ⭐** | 99 €/mese | + IT/ES/EN, memoria cliente, cross-sell, pannello + statistiche, copy ottimizzato |
| **Full** | 179 €/mese | + catalogo dinamico, copy su misura, report mensile, supporto prioritario (SLA 24h) |

➕ Attivazione una-tantum **190 €** (gratis se prepaghi 12 mesi). Annuale: **paghi 10 mesi su 12**.
(Numeri di partenza, da confermare.)

---

## 11. Vincoli e regole NON negoziabili

- **Segreti mai nei file committati** (solo GitHub Secrets / variabili d'ambiente): token Cloudflare,
  chiavi Supabase, token GitHub. Il repo del prodotto resta **privato**.
- **Multilingua sempre**: ogni testo è `{es,it,en}`.
- **Il bot a runtime è a regole, senza LLM** (così non ha costi per messaggio e non cade). L'AI sta
  solo nella *fase di creazione* (analisi + generazione).
- **Privacy memoria cliente**: dati solo first-party sul dispositivo; prevedere nota privacy (file
  `PRIVACY-MEMORIA-CLIENTE.md`) e il reset "Non sono io".
- **Dicitura "Made in Italy 🇮🇹"** in ogni documento/README/app prodotti.
- **Niente dipendenza da un singolo fornitore fragile** (lezione Vercel Blob): preferire soluzioni
  ridondanti/statiche.

---

## 12. Stack tecnologico (riassunto)

- **Frontend bot**: HTML/CSS/JS vanilla, nessun build. Iframe + `postMessage`.
- **Config**: JSON per cliente (`clients/<tenant>.json`).
- **Hosting**: GitHub (privato) + Cloudflare Pages + GitHub Actions.
- **Cataloghi dinamici**: Supabase (sorgente) → script Node ESM → JSON statico.
- **Da aggiungere (piattaforma)**: backend analizzatore (Cloudflare Worker), generatore immagini,
  pipeline LLM (Claude 4.x), dashboard multi-cliente con auth e billing.

---

## 13. File chiave del repo (mappa rapida)

| File | Cos'è |
|---|---|
| `app.js` | motore del bot (cervello) |
| `widget.js` | snippet universale + HOSTMAP |
| `styles.css`, `index.html` | UI chat |
| `clients/*.json` | config dei clienti (il contratto §5) |
| `studio.html` | pannello creazione (URL→bot) |
| `pannello.html` | pannello controllo |
| `_headers` | CORS Cloudflare |
| `.github/workflows/deploy-cloudflare.yml` | deploy automatico |
| `.github/workflows/sync-*.yml` + `scripts/build-*.mjs` | sync cataloghi |
| `aiseller-htaccess.txt` | iniezione su Hostinger |
| `ventaglio-inline*.html` | sezione marketing 3 bot (IT/ES/EN) |
| `PRIVACY-MEMORIA-CLIENTE.md` | nota privacy memoria |

---

### TL;DR per Cowork
Esiste già un **motore di chatbot-venditore completo e generico** (vanilla JS, config JSON per
cliente) e un **pannello che parte da un URL**. Il compito è trasformarlo in una **piattaforma**:
(1) ricostruire l'analizzatore del sito, (2) automatizzare la generazione di mascotte e copy
IT/ES/EN, (3) avvolgere tutto in una dashboard multi-cliente con onboarding, deploy automatico e
billing a 3 fasce. Il bot resta a regole (gratis, sempre su); l'AI lavora solo in fase di creazione.

**Made in Italy 🇮🇹**
