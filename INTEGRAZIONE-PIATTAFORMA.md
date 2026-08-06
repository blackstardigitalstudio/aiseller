# Contratto d'integrazione — Bot AI Seller ⇄ Plataforma

> Come i due mondi si parlano. Documento gemello: una copia vive nel cervello del bot
> (`D:\chatbot`) e una nel cervello della Plataforma. Fonte verificata sul codice reale
> di entrambi i progetti (agosto 2026). Blackstar Digital Studio · **Made in Italy** 🇮🇹

---

## 0. Il principio (già deciso nei due codici)

I due software **non si sovrappongono**: si completano. È scritto nel Worker della
Plataforma (`src/worker.mjs:626`): *"CHATBOT: gestito dall'AI Seller, NON qui."*

| | **Bot AI Seller** (`D:\chatbot`) | **Plataforma** (`.../plataforma`) |
|---|---|---|
| Cos'è | Il widget venditore sul sito cliente | Il pannello SaaS + cervello dati |
| Gira su | `aiseller.pages.dev` (widget.js) | `plataforma.blackstardigitalstudio.workers.dev` (Worker + D1) |
| Possiede | Conversazione, neuromarketing, cross-sell, memoria, UI | Config tenant (D1), eventi, prenotazioni, statistiche, login |
| Motore | `app.js` data-driven, vestito da `clients/<tenant>.json` | `worker.mjs` + tabella `tenants(config JSON)` |

La colla è la **SCHEDA-CLIENTE UNICA**: un'unica scheda per cliente il cui blocco
`chat` = la config che il bot applica con `mergeTenant`.

---

## 1. Filo A — Config: Plataforma → Bot

- La config di ogni negozio sta in D1, colonna `tenants.config` (JSON). La sezione
  **`config.chat`** è esattamente ciò che il bot legge (`mergeTenant`): `enabled, mode,
  itemEmoji, askName, remember, emergency, persona{name,role}, greeting, lead{cta},
  crossSell, prepInstructions`.
- Generata da `functions/_lib/assemble-scheda.mjs` (dal "concept" AI di `concept-prompt.mjs`).
- **Oggi nessun endpoint la modifica**: la config operativa del bot vive nell'AI Seller
  (file `clients/<tenant>.json`). Il pannello (`public/app.js:1154`, modulo "Chatbot")
  mostra solo un link all'AI Seller + lo snippet.
- **Puzzle da chiudere:** allineare i nomi campo (già identici) e decidere la fonte unica.
  Fase 1 = restano due copie allineate a mano. Fase 2 = il bot legge `config.chat` dalla
  Plataforma (o la Plataforma esporta `clients/<tenant>.json`).

**Snippet di installazione** (pannello → modulo Chatbot, `public/app.js:1169`, oggi hardcoded):
```html
<script src="https://aiseller.pages.dev/widget.js" defer></script>
```
Miglioria proposta: iniettare `data-tenant="<id>"` così il widget sa subito chi è
(oltre all'auto-riconoscimento dal dominio in `HOSTMAP`).

---

## 2. Filo B — Eventi: Bot → Plataforma  (il filo che oggi MANCA)

Endpoint **`POST /api/events`** — pubblico, CORS aperto (riflette l'Origin del sito
cliente), rate-limit 60/60s per IP, nessun login. Corpo:
```json
{ "tenant": "<id>", "type": "<tipo>", "label": "<opzionale, max 80 char>" }
```

**Tipi ammessi (whitelist rigida)** e a cosa servono nella dashboard "Resultados":

| `type` | Quando lo spara il bot | Metrica pannello |
|---|---|---|
| `chat_open` | all'apertura della chat | **Aperture** (cima del funnel) |
| `product_view` | mostra una card prodotto (`label` = nome) | **Prodotti più guardati** |
| `cart_add` | aggiunge al carrello | funnel shop |
| `checkout` | va al checkout | funnel shop |
| `click_whatsapp` | apre WhatsApp | **Clic WhatsApp** (conversione lead) |
| `click_book` | clic "📅 Prenota online" | funnel prenotazioni |

> ⚠️ Non esiste il type `lead`. Un **contatto** (nome + WhatsApp/email, con consenso)
> si crea con `POST /api/public/subscribe` (pubblico) → finisce in **Pannello → Contatti**.
> `visit`, `book_view`, `book_done` li sparano già `track.js` e `book.js` sulle pagine
> della Plataforma: il bot NON deve duplicarli.

**Perché oggi manca:** il bot spara `postMessage({aiseller:"lead"})` alla pagina
ospite, non a `/api/events`. Quindi le conversioni non arrivano al pannello.

**Wiring (lato bot, `app.js`):**
1. Config: blocco `platform: { "base": "https://plataforma.blackstardigitalstudio.workers.dev", "tenant": "<id>" }` in `clients/<tenant>.json` + supporto in `mergeTenant`.
2. Helper `pfEvent(type,label)` → `fetch(base+"/api/events", {method:"POST", keepalive:true, body:{tenant,type,label}})`, **solo se** il blocco `platform` esiste (così gli altri bot restano invariati).
3. Chiamarlo su: apertura chat (`chat_open`), render card (`product_view`+nome), carrello (`cart_add`), checkout (`checkout`), apertura WhatsApp (`click_whatsapp`), clic prenota (`click_book`).

---

## 3. Filo C — Prenotazioni: Bot → Plataforma

- Pagina **`GET /book/:tenant`** — esiste se `config.appointments.enabled`. È l'URL che
  il bot apre da "📅 Prenota online" (già impostato per GAS via `lead.url`).
- API pubbliche dietro la pagina: `GET /api/public/appointments?tenant=&day=` (slot liberi),
  `POST /api/public/appointments` (prenota: `customer,phone,consent,service,day,time,...`
  → tabella `appointments`, stato `nuovo`, push al titolare).
- Emergenze: il bot **non** manda al booking → telefono/WhatsApp diretti.

---

## 4. Piani e attivazione

- Il **chatbot è incluso in tutti i piani** (basico/pro/premium — `worker.mjs:1602`).
- I moduli attivi per cliente stanno in `config.features` (`chatbot, catalogo, social,
  conexiones, resultados, magazzino, appuntamenti`). "Resultados" (le statistiche del bot)
  richiede piano pro/premium.

---

## 5. Riepilogo operativo — cosa manca per chiudere il puzzle

1. **[Bot]** sparare gli eventi a `/api/events` (Filo B) → il pannello si popola da solo. ← massimo valore, minimo rischio
2. **[Plataforma]** nel modulo Chatbot iniettare `data-tenant` nello snippet (`app.js:1169`).
3. **[Bot]** capturare i contatti con consenso → `POST /api/public/subscribe` (Contatti).
4. **[Fase 2]** fonte unica della config `chat` (oggi due copie allineate a mano).
5. **[Consigliato]** validare il tenant su `/api/events` (un `SELECT id FROM tenants`) per
   scartare eventi spuri — come già fa `/api/public/subscribe`.

---

*Documento gemello Bot ⇄ Plataforma — Blackstar Digital Studio · Made in Italy 🇮🇹*
