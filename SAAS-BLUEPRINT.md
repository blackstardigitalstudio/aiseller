# AI Seller — Blueprint completo per costruire il SaaS
> *Blackstar Digital Studio · 🇮🇹 Made in Italy*
> Documento di handoff: consegnalo a un'altra chat/agente per far costruire il prodotto da zero.
> Versione 1.0 — base di partenza: prototipo funzionante già online su Vercel.

---

## 0. Come usare questo documento (istruzioni per la chat che riceve)

Sei incaricato di trasformare un **prototipo funzionante** di chatbot-venditore in un **prodotto SaaS multi-cliente, vendibile in white-label**. Non parti da zero concettualmente: la logica di conversazione, l'onboarding e il widget esistono già e vanno **portati e industrializzati**, non reinventati.

Regole di lavoro:
1. Leggi tutto il documento prima di scrivere codice.
2. Procedi a **fasi** (vedi §12). Non costruire tutto insieme: consegna un MVP funzionante prima di aggiungere billing/AI.
3. Ogni scelta tecnica non vincolata qui è tua, ma **motivala** e resta dentro lo stack consigliato (§4).
4. Includi **"Made in Italy"** nel footer del prodotto e nei README.
5. Lingue supportate: **italiano, spagnolo, inglese** (il motore è già multilingua).

---

## 1. Visione & modello di business

**Cos'è.** Un "venditore AI" che qualsiasi attività installa sul proprio sito con **una riga di codice**. Si auto-configura leggendo il sito del cliente (colori, tema, settore, servizi), genera un personaggio-mascotte coerente col brand, e converte i visitatori in contatti/clienti — in chat, 24/7, in 3 lingue.

**Due modalità di conversazione:**
- **Lead** (servizi): porta a prenotazione/WhatsApp, niente carrello/prezzi.
- **Shop** (e-commerce): catalogo, carrello, spinta al prodotto.

**Modello di business (white-label / reseller):**
- **Blackstar Digital Studio** è il brand-madre e il primo reseller.
- Il prodotto è rivendibile: un'agenzia compra un piano, crea sotto-account per i propri clienti, mette il proprio logo (white-label).
- Ricavi: abbonamento mensile per sito attivo + fee di setup opzionale + upsell (modalità AI, analytics avanzate).

**Personas:**
- *Cliente finale* (officina, ristorante, agenzia immobiliare…): vuole più contatti, zero complicazioni.
- *Reseller/agenzia* (come Black Star): rivende a molti clienti, vuole dashboard, white-label, margini.
- *Admin* (noi): gestisce tenant, piani, fatturazione, salute del sistema.

---

## 2. Cosa esiste già (il prototipo da riusare)

Stack attuale: **HTML/CSS/JS vanilla**, nessun build, deploy su **Vercel**, storage config su **Vercel Blob**. Funziona ed è online. Va portato a un'architettura SaaS, ma **la logica è oro e va conservata**.

Componenti esistenti (file → cosa fa):
- `index.html` + `app.js` + `styles.css` → **l'app chat** (l'iframe). Motore data-driven via `window.KF_DATA`; `mergeTenant(p)` applica gli override del cliente.
- `widget.js` → **il widget embed**: inietta una bolla sulla pagina del cliente; al click crea lazy un iframe `/?widget=1&config=<url>&accent=<color>`. Gestisce avatar, teaser, tracking, anti-collisione con altri bottoni flottanti.
- `studio.html` → **lo Studio di onboarding**: incolla un URL → scrape → propone colori/tema/settore/servizi → genera i **prompt del personaggio** → pubblica la config LIVE.
- `api/scrape.js` → estrae dal sito: palette colori (`brandColors`), dark/light, accento leggibile, settore, WhatsApp/telefono.
- `api/save.js` → pubblica la config su Vercel Blob (URL pubblico CORS:*).
- `clients/*.json` → le **config dei clienti** (oggi file statici; nel SaaS diventano righe di DB).

**Concetti chiave già risolti (NON ri-derivarli, riusali):**
- Config-driven character: `KF_DATA.character` = oggetto `{rest,point,pointBack,thumb,blink,face,finger,flip,w,h}` o `false`.
- Personaggio per settore: archetipi con accessori (meccanico→chiave inglese, chef→cappello, tech→occhiali+cuffie…). Il **tono dark** non forza più la tuta racing: il tipo di personaggio lo decide il settore.
- Motore testo libero: `matchService`, `isProblem`, `isEmergency`, `primaryService`, `emergencyHandoff`, `leadBookReply`.
- Gestione nome: distingue un **nome** da un **messaggio** (se l'utente parte col problema, bypassa la domanda del nome senza perdere la frase).
- Categoria **emergenza/panico**: bypassa tutto e manda a contatto umano (📞/💬).
- Mascotte che indica il servizio migliore: posizionata sopra i bottoni, i bottoni si nascondono durante il puntamento.
- Tracking cross-iframe: l'iframe fa `parent.postMessage({aiseller:"lead",service,brand})`; il widget rilancia eventi a gtag/dataLayer/fbq.

> ⚠️ La logica conversazionale e l'onboarding vanno **estratti in moduli riusabili** (TypeScript), non riscritti da capo. Il valore del prodotto è lì dentro.

---

## 3. Architettura target

```
┌───────────────────────────────────────────────────────────────┐
│  SITO DEL CLIENTE (qualsiasi)                                  │
│   <script src="https://cdn.aiseller.io/widget.js"             │
│           data-tenant="abc123"></script>                      │
│        │ inietta bolla → click → iframe                        │
└────────┼──────────────────────────────────────────────────────┘
         ▼
┌───────────────────────────────────────────────────────────────┐
│  WIDGET RUNTIME (CDN, statico, leggerissimo)                  │
│   widget.js  +  /embed (iframe app chat)                      │
│   fetch config: GET /api/public/config/:tenant                │
└────────┬──────────────────────────────────────────────────────┘
         ▼
┌───────────────────────────────────────────────────────────────┐
│  BACKEND SaaS (Next.js su Vercel)                            │
│   • App dashboard (reseller + cliente)  • Studio onboarding    │
│   • API pubbliche (config, chat, track) • API private (CRUD)   │
│   • Auth, billing, multi-tenancy, admin                        │
└───────┬───────────────────────┬───────────────────┬───────────┘
        ▼                       ▼                   ▼
   Postgres (Supabase)     Storage (Blob/S3)    Servizi esterni
   tenant, config,         loghi, immagini       Stripe (billing)
   utenti, analytics       personaggi            Claude API (AI mode)
                                                 Resend (email)
```

Principi:
- **Multi-tenant** con isolamento per `tenant_id` su ogni query.
- **Widget e iframe restano statici e cache-ati su CDN** (performance + non rallentano il sito del cliente).
- **Config pubblica via endpoint cache-ato** (oggi è un JSON su Blob; diventa `GET /api/public/config/:tenant` con cache 60s + CORS:*).
- **Niente segreti nel widget**: il widget è codice pubblico, parla solo con endpoint pubblici read-only + postMessage di tracking.

---

## 4. Stack tecnologico

**Consigliato (coerente con ciò che già giri su Vercel):**
- **Framework:** Next.js 14+ (App Router) + TypeScript — dashboard, API routes, SSR per le pagine marketing.
- **DB:** Postgres gestito via **Supabase** (include anche Auth + Row Level Security multi-tenant + storage). In alternativa Neon/PlanetScale + Auth.js.
- **ORM:** Prisma o Drizzle.
- **Auth:** Supabase Auth (email magic-link + Google OAuth). Ruoli: `owner_reseller`, `member`, `client`, `admin`.
- **Billing:** **Stripe** (Checkout + Customer Portal + Webhooks). Abbonamenti per-seat/per-sito.
- **Storage file:** Supabase Storage o Vercel Blob (loghi, frame personaggio).
- **AI (modalità AI):** **Claude API** (Anthropic). Proxy server-side `/api/chat`, mai chiave nel client.
- **Email transazionali:** Resend o Postmark.
- **Hosting:** Vercel (già in uso). Widget/iframe serviti come asset statici cache-ati.
- **Analytics interne:** tabella eventi su Postgres + viste aggregate (no dipendenza esterna obbligatoria).

**Vincoli da rispettare:**
- Il **widget** deve restare **vanilla JS, < 15KB gzip, zero dipendenze**, caricato async/defer: non deve mai rallentare il sito del cliente.
- L'**iframe chat** può diventare un bundle (riusa `app.js`), ma deve restare veloce e funzionare offline-cache.

---

## 5. Modello dati (schema essenziale)

```
tenants                     -- un cliente finale (un sito con un bot)
  id (uuid, pk)
  reseller_id (fk → resellers)   -- a chi appartiene (white-label)
  name, host
  mode                       -- 'lead' | 'shop'
  status                     -- 'trial' | 'active' | 'suspended'
  plan_id (fk → plans)
  created_at

resellers                   -- agenzia/rivenditore (es. Black Star)
  id, name, slug
  branding (jsonb)           -- logo, colori, dominio custom (white-label)
  stripe_customer_id
  owner_user_id (fk → users)

users
  id, email, name
  role                       -- 'admin' | 'reseller_owner' | 'member' | 'client'
  reseller_id (nullable)

configs                     -- LA config del bot (sostituisce clients/*.json)
  id, tenant_id (fk, unique)
  data (jsonb)               -- l'intero KF_DATA: persona, greeting, products,
                             --   profiling, catLabels, character, accent, dark...
  version (int)
  published_at

character_assets            -- frame del personaggio generati/caricati
  id, tenant_id
  kind                       -- 'rest' | 'point' | 'pointBack' | 'face' | 'logo'
  url

events                      -- analytics (append-only)
  id, tenant_id
  type                       -- 'chat_open' | 'chat_lead' | 'message' | 'service_view'
  service, lang, meta (jsonb)
  created_at

subscriptions
  id, reseller_id, stripe_subscription_id
  plan_id, status, current_period_end, seats

plans
  id, name, price_cents, interval, max_tenants, features (jsonb)
  -- es. feature flags: ai_mode, advanced_analytics, white_label, remove_branding
```

Note:
- **`configs.data` è l'oggetto KF_DATA** che oggi vive nei file `clients/*.json` → diventa una riga JSONB. Zero perdita: il motore lo consuma identico.
- **Row Level Security** su `tenant_id`/`reseller_id`: ogni reseller vede solo i suoi tenant.

---

## 6. Moduli funzionali

### 6.1 Auth & multi-tenancy
- Signup reseller → crea `reseller` + `user(role=reseller_owner)` + trial.
- Inviti membri team. Ruoli e permessi (RLS).
- Switch tra tenant (un reseller gestisce N siti clienti).

### 6.2 Onboarding / Studio (riusa `studio.html` + `scrape.js`)
- Input: URL del cliente → `POST /api/scrape` → ritorna palette, dark/light, settore (archetipo), WhatsApp/telefono, servizi candidati.
- Editor: l'utente rifinisce **servizi** (CRUD, badge "in evidenza", keyword testo-libero), colori, tono, modalità lead/shop.
- **Generazione personaggio**: produce i 3 prompt (rest/point/pointBack) per immagine 3D; carica i frame; allinea/croppa la faccia (logica `alignFrames`/`compositeLogo` esistente).
- "Pubblica" → scrive `configs` (nuova `version`) → invalida cache CDN.
- ⚠️ **Lezione dal prototipo (punto #18):** lo scrape è la **bozza**, non la gabbia. I servizi devono restare 100% editabili e si devono poter **mettere in evidenza** quelli prioritari.

### 6.3 Motore conversazionale (cuore del prodotto)
Estrai da `app.js` in un modulo `engine/` riusabile (TS). Due strati:
- **Rules engine (default, no costo per messaggio):** greeting → nome (con bypass intelligente) → profilazione → testo libero (`matchService`/`isProblem`/`isEmergency`) → raccomandazione/booking → fallback empatico. Tutta la pipeline `handleUser()` già definita.
- **AI mode (upsell, flag `ai_mode`):** proxy `/api/chat` verso Claude. Il system prompt include la config del tenant (servizi, tono, brand) + regole di sicurezza. Stessa UX, risposte più naturali. Rate-limit e budget per tenant.
- Mantieni **emergenza→umano**, **multilingua**, **acks/teaser variabili**.

### 6.4 Widget embed (riusa `widget.js`)
- Una riga: `<script src=".../widget.js" data-tenant="..." data-position data-bottom data-avoid async></script>`.
- Avatar dalla config, teaser, anti-collisione con bottoni flottanti, tracking `chat_open`/`chat_lead`.
- Config via `GET /api/public/config/:tenant` (cache-ato, CORS:*).

### 6.5 Dashboard cliente/reseller
- Lista tenant (siti), stato, piano.
- Per tenant: editor config (lo Studio), anteprima live, snippet d'installazione, toggle lead/shop, gestione personaggio.
- Analytics (vedi 6.6).
- Impostazioni white-label (logo, colori, dominio custom) a livello reseller.

### 6.6 Analytics
- Eventi: aperture chat, lead generati, servizi più richiesti, lingua, tasso conversazione→lead, orari.
- Viste aggregate per tenant e per reseller. Export CSV.
- Sorgente: tabella `events` (l'iframe già emette gli eventi via postMessage; il widget li inoltra; il backend li registra via `POST /api/track`).

### 6.7 Billing (Stripe)
- Piani (§11) come `plans` + prezzi Stripe.
- Checkout per nuovo abbonamento; Customer Portal per gestione.
- **Webhooks**: `checkout.session.completed`, `customer.subscription.updated/deleted` → aggiornano `subscriptions`/`tenants.status`.
- Limiti per piano: numero tenant, feature flag (ai_mode, white_label, remove_branding).
- Trial 14 giorni; sospensione automatica a fine trial/mancato pagamento (bot mostra messaggio neutro o si disattiva).

### 6.8 White-label / reseller
- `resellers.branding`: logo, palette, **dominio custom** (CNAME → es. `chat.agenzia.com`).
- Rimozione del "powered by AI Seller" come feature di piano.
- Sotto-account clienti gestiti dal reseller.

### 6.9 Admin (noi)
- Lista reseller/tenant, MRR, stato sistema.
- Impersonate (debug), sospendi, gestisci piani.

---

## 7. API design (bozza endpoint)

**Pubblici (no auth, cache + CORS:* , read-only):**
- `GET /api/public/config/:tenant` → la config del bot (JSONB). Cache 60s.
- `POST /api/track` → registra evento `{tenant, type, service, lang}`. Rate-limited.
- `POST /api/chat` → (AI mode) `{tenant, messages}` → risposta Claude. Rate-limited per tenant.

**Privati (auth):**
- `POST /api/scrape` → analizza un URL (riusa `scrape.js`).
- `GET/PUT /api/tenants/:id/config` → leggi/pubblica config (nuova version + invalida cache).
- `POST /api/tenants` / `GET /api/tenants` → CRUD tenant.
- `POST /api/character/generate` → prompt + pipeline frame.
- `GET /api/analytics/:tenant` → metriche aggregate.
- `POST /api/billing/checkout` , `POST /api/billing/portal`.
- `POST /api/webhooks/stripe` → eventi Stripe.

---

## 8. Sicurezza, privacy, qualità (requisiti non negoziabili)

- **GDPR**: dati in UE (Supabase EU region). DPA con Stripe/Anthropic. Cookie/consenso minimal; il widget non traccia PII senza consenso. Privacy policy + possibilità di cancellazione dati tenant.
- **Isolamento tenant**: RLS su ogni tabella; mai fidarsi del `tenant_id` dal client per scritture (deriva da sessione/auth).
- **Segreti server-side**: chiavi Stripe/Claude/Blob solo in env Vercel, mai nel bundle widget. Aggiungi `.env*` a `.vercelignore`/`.gitignore`.
- **Rate limiting** su `/api/chat`, `/api/track`, `/api/scrape` (per IP e per tenant).
- **AI mode safety**: il system prompt vincola Claude ai servizi/brand del tenant; niente azioni reali; niente promesse di prezzo non confermate; handoff umano per emergenze.
- **Performance widget**: async, < 15KB, nessun blocco del thread del sito ospite.
- **Versionamento cache-bust**: la pipeline asset (css/js) deve sincronizzare le versioni (problema già visto nel prototipo: CSS e JS a versioni diverse → regole vecchie).

---

## 9. Pricing & packaging (proposta, modificabile)

| Piano | Prezzo/mese | Siti | AI mode | White-label | Analytics |
|---|---|---|---|---|---|
| **Starter** | €29 | 1 | ❌ (solo rules) | ❌ | base |
| **Pro** | €79 | 3 | ✅ con limite messaggi | parziale | avanzate |
| **Agency** (reseller) | €199+ | 10+ | ✅ | ✅ completo + dominio custom | avanzate + export |
| Setup una tantum | €0–300 | — | — | — | onboarding assistito |

Leve di upsell: modalità AI, analytics avanzate, rimozione branding, siti aggiuntivi, generazione personaggio premium.

---

## 10. Roadmap a fasi (consegna incrementale)

**Fase 0 — Fondamenta (1 settimana)**
- Setup Next.js + Supabase + Auth + schema DB + deploy Vercel.
- Porta `engine/` (rules) e `widget.js` come moduli; config da DB invece che da file.
- ✅ DoD: un tenant seed in DB, widget che carica config da `GET /api/public/config/:tenant`, chat funzionante in modalità rules.

**Fase 1 — MVP usabile (1–2 settimane)**
- Dashboard reseller: signup, lista tenant, editor config (Studio), snippet installazione, anteprima live.
- `POST /api/scrape` + generazione personaggio.
- ✅ DoD: un'agenzia crea un tenant da un URL, pubblica, installa il widget su un sito reale e riceve lead via WhatsApp.

**Fase 2 — Monetizzazione (1 settimana)**
- Stripe: piani, checkout, portal, webhooks, limiti per piano, trial.
- ✅ DoD: un reseller si abbona, i limiti del piano vengono applicati.

**Fase 3 — AI mode + Analytics (1–2 settimane)**
- Proxy `/api/chat` su Claude con system prompt per-tenant, rate-limit, budget.
- Dashboard analytics (eventi, conversioni, servizi top).
- ✅ DoD: toggle AI mode per tenant Pro+; dashboard mostra lead e conversioni reali.

**Fase 4 — White-label & scala (1–2 settimane)**
- Branding reseller, dominio custom (CNAME), rimozione "powered by".
- Admin panel, impersonate, MRR.
- ✅ DoD: Black Star rivende a un cliente sotto il proprio brand su dominio custom.

---

## 11. Definition of Done globale (checklist)
- [ ] Un visitatore apre la chat su un sito cliente e genera un lead (rules mode).
- [ ] Un reseller crea un tenant da un URL in < 5 minuti.
- [ ] La config è multilingua (IT/ES/EN) e i servizi sono editabili + "in evidenza".
- [ ] Il personaggio rispecchia il settore (no tuta racing per un'agenzia).
- [ ] Emergenza → handoff umano; nome → bypass intelligente.
- [ ] Billing Stripe funzionante con limiti per piano.
- [ ] AI mode opzionale, sicura, server-side.
- [ ] Analytics per tenant e reseller.
- [ ] White-label completo per reseller.
- [ ] GDPR/sicurezza: RLS, segreti server-side, rate-limit, dati in EU.
- [ ] Widget < 15KB, async, non rallenta il sito ospite.
- [ ] Footer "Made in Italy" 🇮🇹.

---

## 12. Migrazione dei clienti già live (GAS + Black Star)

Due clienti sono già online come **file JSON statici** e non vanno persi nel passaggio al SaaS:
- `clients/gasproject.json` → **GAS Project** (autofficina racing, Comacchio), modalità *lead*, con personaggio completo (oggetto `character` con frame rest/point/pointBack + face), dark, 10 servizi, `askName:true`.
- `clients/blackstar.json` → **Blackstar Digital Studio** (agenzia), modalità *lead*, 7 servizi (3 in evidenza), accent oro `#a68732`.

**Buona notizia:** ogni `clients/*.json` **è già nella forma `KF_DATA`**, cioè esattamente ciò che va in `configs.data` (JSONB). Mappatura **1:1, nessuna trasformazione** del contenuto core.

Procedura di migrazione (script una tantum):
1. Crea il reseller **Blackstar Digital Studio** (`resellers`) + utente owner.
2. Per ogni file in `clients/*.json`:
   - crea un `tenant` (`name`, `host`, `mode` dal JSON);
   - inserisci una riga `configs` con `data` = contenuto del JSON, `version=1`, `published_at=now`;
   - se il JSON ha un oggetto `character` con URL di frame (caso GAS), **scarica le immagini e ricaricale** su Supabase Storage, poi aggiorna gli URL dentro `data.character` (non lasciare URL Blob legacy).
3. Sostituisci lo snippet sul sito del cliente: da `/?widget=1&config=<url-json>` a `widget.js data-tenant="<id>"`.
4. **Parità di comportamento:** apri il bot prima/dopo e verifica che greeting, servizi, personaggio, emergenza e lingua siano identici.

Transizione senza downtime:
- **Mantieni vivi i vecchi URL Blob/`clients/*.json`** finché tutti i widget non puntano al nuovo `data-tenant` (oppure fai puntare il vecchio endpoint config al nuovo `GET /api/public/config/:tenant`). Così i widget già incollati sui siti dei clienti non si rompono durante il passaggio.
- Migra **prima Black Star** (vetrina nostra, rischio zero), poi **GAS** (cliente reale) a freddo, di notte, con verifica.

Pseudo-script:
```
for file in clients/*.json:
    data = readJSON(file)
    tenant = createTenant({ name: data.brand, host: data.host, mode: data.mode, reseller: BLACKSTAR })
    rehostCharacterAssets(data)         # solo se data.character è un oggetto con URL
    insertConfig({ tenant_id: tenant.id, data, version: 1 })
    print("migrato:", data.brand, "→ tenant", tenant.id)
```

---

## 13. Prompt iniziale da incollare nella nuova chat

> Sei un senior full-stack engineer. Devi costruire un SaaS multi-tenant white-label chiamato **"AI Seller"**: un chatbot-venditore che le attività installano sul proprio sito con una riga di codice, si auto-configura leggendo il sito (colori, settore, servizi), genera un personaggio-mascotte coerente col brand e converte i visitatori in lead/clienti in 3 lingue (IT/ES/EN), in modalità *lead* o *shop*.
>
> Esiste già un **prototipo funzionante** (HTML/CSS/JS vanilla su Vercel) con: motore conversazionale rules-based (greeting, profilazione, testo libero, emergenza→umano, gestione nome con bypass), widget embed con anti-collisione e tracking, Studio di onboarding con scraping del sito e generazione prompt-personaggio. **Questa logica va portata e industrializzata, non reinventata.**
>
> Stack: **Next.js + TypeScript + Supabase (Postgres + Auth + RLS) + Stripe + Claude API + Vercel**. Il widget resta vanilla JS < 15KB.
>
> Segui il documento "AI Seller — Blueprint completo per costruire il SaaS" allegato: rispetta architettura (§3), modello dati (§5), moduli (§6), API (§7), sicurezza/GDPR (§8) e consegna **a fasi** (§10) partendo dalla Fase 0. Prima di scrivere codice, conferma il piano della Fase 0 e fai solo le domande bloccanti. Includi "Made in Italy" nel footer.

---

*Blackstar Digital Studio — Non costruiamo siti. Costruiamo strumenti che acquisiscono clienti. 🇮🇹 Made in Italy*
