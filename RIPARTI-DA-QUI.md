# ▶ RIPARTI DA QUI — AI Seller (stato completo, fonte di verità)
> *Blackstar Digital Studio · 🇮🇹 Made in Italy*
> Questo file è il MASTER aggiornato. **Supera e sostituisce `CONTINUA-QUI.md`** (vecchio, parlava di Vercel/Blob che ora NON si usano più).
> Incollalo in una chat nuova per riprendere il lavoro sapendo già tutto.

---

## 0. Come usare questo file (istruzioni per la chat che riceve)
Stai continuando lo sviluppo di **AI Seller**, un chatbot-venditore white-label **già online e funzionante**, ospitato su **Cloudflare Pages**, codice in un **repo GitHub privato**, aggiornabile "da dietro" con un `git push`. Leggi tutto prima di agire. Non rifare cose già fatte. Non rompere quello che gira.

---

## 1. Cos'è (visione)
Chatbot-venditore che un'attività installa sul proprio sito con **una riga di codice**. Si auto-configura per cliente (colori, settore, servizi, personaggio), parla **IT/ES/EN**, e trasforma i visitatori in clienti (lead → WhatsApp, o shop e-commerce). Brand/rivenditore: **Blackstar Digital Studio**. Clienti live: Black Star (vetrina), GAS Project (officina), Il Raviolo Bottega (bottega pasta fresca, Las Palmas), Mario Wine.

---

## 2. ⚠️ ARCHITETTURA ATTUALE (è CAMBIATA — leggi bene)
**Tutto è su GitHub + Cloudflare. Niente più Vercel/Blob.**

- **Codice (privato):** repo GitHub **`blackstardigitalstudio/aiseller`** (PRIVATO). Account GitHub: `blackstardigitalstudio` (gh CLI autenticato).
- **Sviluppo locale:** `D:\chatbot` (è un repo git, `origin` = il repo GitHub sopra).
- **Hosting (pubblico):** **Cloudflare Pages** → **`https://aiseller.pages.dev`** (CDN globale, CORS aperto, non cade). Serve: `widget.js`, l'app iframe (`index.html`+`app.js`+`styles.css`+`config.js`+`data/`+`assets/`), le config (`clients/*.json`), il pannello (`pannello.html`), il file `aiseller-htaccess.txt`.
- **Automazioni (GitHub Actions):**
  - `.github/workflows/deploy-cloudflare.yml` → ad ogni **push su main**, ricostruisce `dist/` e fa **deploy su Cloudflare** (via `cloudflare/wrangler-action`).
  - `.github/workflows/sync-ilraviolo.yml` → **ogni 3 ore** (e a mano) rilegge il catalogo di Il Raviolo da Supabase, rigenera `clients/ilraviolo.json`, committa → fa partire il deploy.
- **Segreti (GitHub Secrets, cifrati — NON nei file):** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (= `705505aad1360eb4d6150c9209c4f3cc`), `ILRAVIOLO_SUPABASE_KEY` (anon public).
- **Vercel = DEPRECATO.** Il vecchio deploy `aiseller-blackstar.vercel.app` esiste ancora (serviva i vecchi embed) ma va **spento** quando tutti i siti puntano a Cloudflare. Il **Vercel Blob è morto** (ha buttato giù i bot — da NON riusare). La cartella `api/` (scrape.js/save.js/ilraviolo.js) era roba Vercel: su Cloudflare non gira (statico) ed è legacy.

---

## 3. Come aggiorno tutto "DA DIETRO" (deploy)
**Flusso normale:** modifico file in `D:\chatbot` → `git add` + `git commit` + `git push origin main` → la GitHub Action **deploya su Cloudflare da sola** (~1 min). **Nessuna credenziale serve in locale.**

**Se la Action si impianta** (è capitato 1 volta, transitorio) → **deploy manuale** (serve il Cloudflare API token, che è del cliente: chiediglielo o usalo se te lo dà):
```bash
cd /d/chatbot
rm -rf dist; mkdir -p dist
cp widget.js index.html app.js styles.css config.js _headers pannello.html aiseller-htaccess.txt dist/
cp -r clients assets data dist/
export CLOUDFLARE_API_TOKEN="<token cliente>"; export CLOUDFLARE_ACCOUNT_ID="705505aad1360eb4d6150c9209c4f3cc"
npx --yes wrangler@latest pages deploy dist --project-name=aiseller --branch=main --commit-dirty=true
```
**Cache-bust verifica live (Cloudflare blocca i bot-UA → usa uno User-Agent da browser nei test python/curl, altrimenti dà 403).**

---

## 4. I CLIENTI (config)
Le config sono file JSON in `clients/`, servite su `https://aiseller.pages.dev/clients/<id>.json`:
- `blackstar.json` — Black Star (agenzia, lead, personaggio 3D in **base64 dentro il JSON**, oro #a68732, 7 servizi con link diretti a pagine).
- `gasproject.json` — GAS Project (officina, lead, personaggio 3D base64, teal #0099b8, emergenza→chiamata attiva).
- `ilraviolo.json` — Il Raviolo (bottega, lead, navy #0a1f35+oro #e8b84f, personaggio = `il-raviolino.webp`, catalogo da Supabase, cross-sell + abbinamenti + istruzioni cottura). **Generata dall'automazione (vedi §9).**
- `mariowine.json` — Mario Wine.
La parte fissa è curata a mano; per Il Raviolo il catalogo è dinamico.

---

## 5. LO SNIPPET UNIVERSALE + INSTALLAZIONE (questa è la svolta)
**Una sola riga, UGUALE per tutti i siti, che NON cambia mai più:**
```html
<script src="https://aiseller.pages.dev/widget.js" defer></script>
```
Niente `data-config`/`data-color`: il widget rileva il cliente dal **dominio** e prende config+colore da solo.

**Installazione su Hostinger (dove il cliente carica index.html):** un file **`.htaccess`** in `public_html` che inietta lo snippet su TUTTE le pagine (mod_substitute):
```apache
<IfModule mod_substitute.c>
  AddOutputFilterByType SUBSTITUTE text/html
  Substitute "s|</body>|<script src='https://aiseller.pages.dev/widget.js' defer></script></body>|i"
</IfModule>
```
File pronto da scaricare: **`https://aiseller.pages.dev/aiseller-htaccess.txt`**. (Procedura dettagliata Hostinger: hPanel → Gestore file → public_html → mostra file nascosti → crea/modifica `.htaccess` → incolla → salva → prova in incognito.)
**Nuovo cliente** = aggiungo una riga in `widget.js` (dominio→config) e il cliente mette lo **stesso** snippet/.htaccess.

---

## 6. IL WIDGET (`widget.js`)
- Carica una pallina leggera; al click crea un iframe isolato (`aiseller.pages.dev/?widget=1&config=...&accent=...`).
- **AUTO-RILEVAMENTO cliente dal dominio:** array `HOSTMAP = [[match_dominio, id_config, colore, regex_percorso|null], ...]`. Es. `["ilraviolo","ilraviolo","#e8b84f",/\/bottega/i]` → Il Raviolo **solo su /bottega**.
- `base` = cartella di widget.js (robusta per Cloudflare/sottocartelle).
- Motion di richiamo: alone pulsante, saltello (max 3, ogni 20s), nuvoletta-teaser (max 2), badge "1". Anti-flash personaggio.
- Anti-collisione coi bottoni flottanti del sito. Tracking eventi (gtag/dataLayer/fbq). Messaggi accettati **solo dal proprio iframe** (anti-spoofing).

---

## 7. IL MOTORE (`app.js`) — funzionalità
Motore **a regole** (no API key), data-driven via `window.KF_DATA`; `mergeTenant(p)` applica la config del cliente (whitelist di chiavi — se aggiungi un campo config NUOVO, ricordati di propagarlo in `mergeTenant`!). Modi: **lead** (servizi→WhatsApp) e **shop** (e-commerce). Funzioni chiave:
- **Testo libero**: `matchService`, `isProblem`, `isEmergency`→`emergencyHandoff` (disattivabile con `emergency:false`), `primaryService`, `leadBookReply`.
- **Nome**: `captureName` (distingue nome da messaggio, bypass intelligente).
- **Mascotte che indica**: `showPointer`/`spotlightPick` (piccola, breve, non copre il testo, sta sopra il footer).
- **Cross-sell "costruisci il pasto"** (se `D.crossSell`): `browseCategory` (prodotti con "Aggiungi") → `addToLista` → `suggestNext` → barra carrello fissa `updateCartBar` ("🛒 Invia ordine (N)") → `listaCheckout` (lista su WhatsApp). **Anti-insistenza**: max 2 proposte (`state.suggestCount`), si ferma su "No grazie" (`state.noMorePush`), mascotte solo 1ª volta.
- **Skill abbinamenti culinari**: `FOOD_PAIRINGS` (regex nome prodotto → complementi giusti in ordine; mai pesto sui cappellacci di zucca), `bestComplement`, `buildPairPitch`. Combo "vino+dolce" per i piatti pronti.
- **Istruzioni cottura** (`D.prepInstructions`): `prepFor` → mostra come scaldare i piatti pronti.
- **Per-settore**: `emergency/askHint/problemEmpathy/emoji/itemEmoji/pick/crossSell/ctaAdd/prepInstructions` (tutti propagati da `mergeTenant`).
- **SICUREZZA**: `esc()` (escape HTML anti-XSS) e `safeImg()` (valida URL immagini) applicati in `productCard`, `cardHTML`, `applyWatermark`. I messaggi (`botMsg`/`userMsg`) usano `textContent` (già sicuri).
- **Tema/personaggio**: `applyChatTheme`, `applyCharacter`, `applyWatermark`.
- **Cache-bust**: `?v=NN` deve essere **identico nei 4 punti di `index.html`** (link `styles.css` + 3 script). **ATTUALE: `v=80`.** Se tocchi css/js, bumpa tutti e 4.

---

## 8. IL PANNELLO DI CONTROLLO
**`https://aiseller.pages.dev/pannello.html`** — gestione di tutti i clienti:
- Stato online/down di ogni cliente, anteprima mascotte, mode, n. voci.
- **Modifica**: cambi la **mascotte** (URL immagine) e il **ragionamento** (config JSON completa: saluti, servizi, abbinamenti, istruzioni).
- **Salva** → commit su GitHub via API → deploy automatico (~1 min).
- Per salvare serve un **token GitHub fine-grained** (repo `aiseller`, Contents: Read and write) che il cliente incolla una volta (resta in `localStorage`). Frame-buster anti-clickjacking attivo.

---

## 9. IL RAVIOLO — caso speciale (Supabase + solo /bottega)
- **Solo /bottega**: gestito in `widget.js` (HOSTMAP path regex). Il cliente mette lo stesso `.htaccess` su tutto `ilraviolo.es`, la pallina esce solo nella bottega.
- **Catalogo dinamico da Supabase**: progetto `rllxrcitzofompzuipxh`, tabella **`bottega_products`** (colonne: categoria, nombre, descripcion, precio, imagen_url, destacado, visible, agotado, orden, promo_*). Filtra `visible=true` e `!agotado`.
- **Auto-sync senza Vercel**: `scripts/build-ilraviolo.mjs` (riusa la parte fissa dello snapshot + rigenera catalogo da Supabase; `META` = mappa 15 categorie→emoji/label/ordine). Lanciato da `sync-ilraviolo.yml` ogni 3h → commit → deploy. Chiave Supabase = secret `ILRAVIOLO_SUPABASE_KEY` (anon public; **non** in chiaro nei file). Personaggio: `https://ilraviolo.es/assets/il-raviolino.webp` (sul dominio del cliente). WhatsApp 34671085862.

---

## 10. SICUREZZA (fatto)
XSS chiuso (escape su nomi/badge/descrizioni prodotto + brand nel pannello → protegge il token GitHub); URL immagini validati (`safeImg`, anti CSS-injection); header `X-Content-Type-Options: nosniff` + `Referrer-Policy` (via `_headers`); frame-buster sul pannello; messaggi widget firmati (solo dal proprio iframe); **nessun segreto nei file** (solo nei GitHub Secrets). Raccomandazione aperta: spegnere il vecchio deploy Vercel (rimuove `api/scrape.js`, superficie SSRF) quando tutti i siti sono su Cloudflare.

---

## 11. FILE CHIAVE (mappa, in `D:\chatbot`)
- `widget.js` — pallina + auto-detect cliente + motion.
- `index.html`+`app.js`+`styles.css`+`config.js`+`data/data.js`+`assets/` — l'app chat (iframe).
- `clients/*.json` — le config dei clienti.
- `pannello.html` — pannello di controllo.
- `_headers` — header Cloudflare (CORS + sicurezza).
- `aiseller-htaccess.txt` — file pronto per i clienti.
- `scripts/build-ilraviolo.mjs` — rigenera catalogo Il Raviolo da Supabase.
- `.github/workflows/deploy-cloudflare.yml` — deploy automatico.
- `.github/workflows/sync-ilraviolo.yml` — sync catalogo ogni 3h.
- `studio.html` — generatore di config/personaggi (lo Studio; NON deployato su Cloudflare di default).
- `installa.html`, `start.html`, `informe*.html`, `percorso-ai-seller.md` — guide/case study.
- `.gitignore` — esclude `.env*`, `.vercel`, `.claude/`, `dist/`, `node_modules/`.
- **Documenti**: `percorso-ai-seller.md` (i 30 problemi risolti — la storia), `SAAS-BLUEPRINT.md` (piano SaaS), `BRIEF-LANDING-VENDITORE-AI.md` + `BRIEF-PAGINA-CASE-STUDY.md` (brief per Codex).

---

## 12. VINCOLI (non rompere mai)
1. **"Made in Italy" 🇮🇹** in ogni README/skill/app/documento.
2. Motore **a regole** (niente API key per ora; la modalità AI Claude è futura).
3. **Non rompere la demo Kayaman/Kaya** (è la base dell'app).
4. **Cache-bust** `?v=NN` identico nei 4 punti di `index.html` (attuale **v=80**).
5. **Segreti mai nei file** (solo GitHub Secrets). Repo privato.
6. Ogni fix di prodotto importante → aggiungilo come punto in `percorso-ai-seller.md`.

---

## 13. PAGINE LIVE (link rapidi)
- **Pannello di controllo:** https://aiseller.pages.dev/pannello.html
- **Demo bot (Kayaman):** https://aiseller.pages.dev/
- **Prova un cliente:** https://aiseller.pages.dev/?widget=1&config=https://aiseller.pages.dev/clients/blackstar.json&accent=%23a68732 (cambia `blackstar`→`gasproject`/`ilraviolo`/`mariowine`)
- **File .htaccess:** https://aiseller.pages.dev/aiseller-htaccess.txt
- **Repo:** https://github.com/blackstardigitalstudio/aiseller (privato)
- *(Da migrare a Cloudflare se servono pubbliche: `studio.html`, `installa.html`, `start.html`, il case study — al momento NON nel deploy Cloudflare; erano sul vecchio Vercel.)*

---

## 14. STORIA + ALTRI DOCUMENTI
30 problemi trovati e risolti: vedi `percorso-ai-seller.md` (dalla mascotte fredda al cross-sell, abbinamenti culinari, anti-insistenza, ecc.). Piano per il SaaS vendibile: `SAAS-BLUEPRINT.md`. Brief pronti per Codex: landing `/venditore-ai` e pagina case-study.

---

## 15. IN SOSPESO / prossimi passi
- **Spegnere il vecchio deploy Vercel** quando tutti i siti puntano a Cloudflare (rimuove `api/` legacy).
- **Migrare su Cloudflare** anche `studio.html` (creazione config), `installa.html`, `start.html`, la pagina case-study — e linkarle tra loro (il cliente voleva navigarci veloce).
- **Modalità AI (Claude)**: proxy per risposte naturali (serve API key come secret).
- **Dashboard analytics** nostra.
- **Landing `/venditore-ai`** e **pagina case-study**: brief già pronti (`BRIEF-*.md`) da passare a Codex.

---

## 16. CREDENZIALI (dove stanno — NON in questo file)
- **Cloudflare API token**: ce l'ha il cliente (l'ha creato scoped "Pages: Edit"). È nei GitHub Secrets per l'Action. Per un deploy manuale, richiederlo al cliente.
- **Cloudflare Account ID**: `705505aad1360eb4d6150c9209c4f3cc`.
- **Supabase anon key** (Il Raviolo): GitHub Secret `ILRAVIOLO_SUPABASE_KEY`. È pubblica (client-side) ma trattala come credenziale: non scriverla nei file.
- **GitHub**: `gh` CLI già autenticato come `blackstardigitalstudio`.

---

## 17. PROMPT PER RIPARTIRE (incolla in chat nuova, + questo file)
> Sto continuando **AI Seller**, un chatbot-venditore white-label di Blackstar Digital Studio, **già live**. Codice in `D:\chatbot` (repo git → GitHub privato `blackstardigitalstudio/aiseller`), hosting su **Cloudflare Pages** (`aiseller.pages.dev`), deploy automatico via GitHub Action ad ogni `git push`. NON si usa più Vercel/Blob. Snippet universale (`<script src="https://aiseller.pages.dev/widget.js" defer></script>`), il widget rileva il cliente dal dominio. C'è un pannello di controllo (`aiseller.pages.dev/pannello.html`). Leggi il file `RIPARTI-DA-QUI.md` per lo stato completo e rispetta i vincoli (Made in Italy, motore a regole, cache-bust v=80, segreti solo nei Secret). Conferma in una riga che hai capito lo stato, poi dimmi su quale punto lavoriamo.

---
*Blackstar Digital Studio — Non costruiamo siti. Costruiamo strumenti che acquisiscono clienti. 🇮🇹 Made in Italy*
