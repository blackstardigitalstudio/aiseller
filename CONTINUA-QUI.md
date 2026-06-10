# ▶ CONTINUA QUI — Prompt di ripartenza (AI Seller / prototipo live)
> *Blackstar Digital Studio · 🇮🇹 Made in Italy*
> Se la chat va in tilt: apri una chat nuova, incolla **tutto** il blocco qui sotto e riparti senza perdere niente.
> Tienilo aggiornato dopo ogni cambiamento importante. Ultimo aggiornamento: stato dopo config Black Star + fix personaggio.

---

## ⧉ PROMPT DA INCOLLARE (copia da qui in giù)

Stai continuando lo sviluppo di **AI Seller**, un chatbot-venditore white-label già **online e funzionante**. Lavori sul prototipo reale, non su una versione nuova. Prima di agire, leggi questo stato e rispetta i vincoli.

### Cos'è
Chatbot-venditore che si installa su un sito con una riga di codice, si auto-configura leggendo il sito (colori, tema dark/light, settore, servizi), genera un personaggio-mascotte coerente col brand e converte i visitatori in lead, in 3 lingue (IT/ES/EN). Due modalità: **lead** (servizi → WhatsApp/prenotazione) e **shop** (e-commerce). Brand-madre e reseller: **Blackstar Digital Studio**.

### Dove sono i file (cartella `D:\chatbot`)
- `index.html` + `app.js` + `styles.css` → l'app chat (l'iframe). Motore data-driven via `window.KF_DATA`; `mergeTenant(p)` applica gli override del cliente.
- `widget.js` → widget embed (bolla → iframe `/?widget=1&config=<url>&accent=<color>`); avatar, teaser, tracking, anti-collisione.
- `studio.html` → Studio onboarding: URL → scrape → colori/tema/settore/servizi → genera prompt personaggio → pubblica config LIVE. Contiene `buildCharacterPrompts`, `ARCHETYPES`, `alignFrames`, `compositeLogo`.
- `api/scrape.js` → estrae palette/dark/settore/WhatsApp dal sito (`brandColors`).
- `api/save.js` → pubblica config su Vercel Blob.
- `clients/gasproject.json` → cliente live GAS Project (officina, ~1.4MB, personaggio con 3 frame).
- `clients/blackstar.json` → cliente live Black Star (agenzia, 7 servizi, 3 in evidenza).
- `percorso-ai-seller.md` → report problemi/soluzioni (18 punti).
- `SAAS-BLUEPRINT.md` → piano per trasformarlo in SaaS (documento separato).
- `start.html` → hub di lancio (link Studio/Istruzioni/GAS/Black Star). `installa.html` → guida installazione.

### URL live
- App/hub: `https://aiseller-blackstar.vercel.app/start.html`
- Studio: `https://aiseller-blackstar.vercel.app/studio.html`
- Config clienti: `…/clients/gasproject.json` e `…/clients/blackstar.json`
- Domini alias attivi (DUE): `kayamansfarm-demo.vercel.app` E `aiseller-blackstar.vercel.app`

### Come si fa il deploy (procedura OBBLIGATORIA, sempre entrambi gli alias)
```
cd /d/chatbot
DEP=$(npx --yes vercel@latest deploy --prod --yes --scope kayaman-s-projects | grep -oE 'https://kayamansfarm-demo-[a-z0-9]+-kayaman-s-projects\.vercel\.app' | head -1)
D=${DEP#https://}
npx --yes vercel@latest alias set $D kayamansfarm-demo.vercel.app --scope kayaman-s-projects
npx --yes vercel@latest alias set $D aiseller-blackstar.vercel.app --scope kayaman-s-projects
```
CLI loggata come `stellinoxx-6172`, scope `kayaman-s-projects`. Vercel Blob: store `aiseller`, env `BLOB_READ_WRITE_TOKEN` (Production/Preview/Development).

### ⚠️ CONFIG LIVE DI BLACK STAR — LEGGI QUESTO
Il widget su **blackstardigitalstudio.com legge la config dal BLOB**, NON dal file nel repo:
- File che conta (LIVE): `https://wqcxmt3ryikvxvek.public.blob.vercel-storage.com/clients/blackstardigital.json`
- L'embed sul sito ha `data-config` = quel Blob URL (nome file **`blackstardigital`**, non `blackstar`).
- **Per aggiornare il bot di Black Star:** modifica `D:\chatbot\clients\blackstar.json` poi lancia **`python3 publish-blackstar.py`** (fa POST a `/api/save` con `id=blackstardigital` → sovrascrive il Blob, cache ~60s). Modificare solo il file nel repo Vercel **NON** aggiorna il sito.
- Black Star ha un **personaggio 3D** (character oggetto) + tema dark (bg #0a1628). Il file repo è allineato al Blob.
- GAS invece usa `clients/gasproject.json` servito dal deploy Vercel (non Blob).

### VINCOLI da non rompere mai
1. **"Made in Italy" 🇮🇹** in ogni README/skill/app/documento.
2. Motore **rules-based** (niente API key per ora). La modalità AI (Claude) è una feature futura.
3. **Non rompere la demo Kayaman/Kaya** (è la vetrina live e-commerce).
4. **Cache-bust:** la versione `?v=NN` deve essere **identica** nei 4 punti di `index.html` (link a `styles.css` + 3 script). **Versione attuale: `v=79`.** Se tocchi css/js, bumpa tutti e 4 insieme. ⚠️ La preview headless a volte serve un `app.js` in cache: per testare codice nuovo bumpa la versione (cambia l'URL dello script) e ricarica.
5. Segreti (token Blob/OIDC) **mai esposti**; `.env*` è in `.vercelignore`.
6. Ogni fix importante va aggiunto come punto numerato in `percorso-ai-seller.md`.
7. Preferisci testare in preview headless (limiti noti: rAF congelato, screenshot vanno in timeout, `document.hidden=true`, innerHeight può essere 0 → fai resize prima, fetch di config grosse fallisce in locale).

### Stato attuale (cosa è già FATTO)
- Auto-pubblicazione config dallo Studio (`/api/save` + Vercel Blob), CORS:*.
- Motore testo libero umano: `matchService`, `isProblem`, `isEmergency`→handoff umano (📞/💬), `primaryService`, `leadBookReply`.
- Gestione nome con bypass intelligente (nome vs messaggio, senza perdere la prima frase).
- Mascotte che indica il servizio: posizionata sopra i bottoni (coord. reali), bottoni nascosti durante il puntamento.
- Tema dark della chat + watermark logo.
- **Fix personaggio (#17):** il tono dark non forza più la tuta racing; la tuta/piping racing scatta **solo** per officine/sportivi (regex su `a.name` in `buildCharacterPrompts`). Tipo personaggio = archetipo.
- **Accessori per settore:** archetipi arricchiti (tech→occhiali+cuffie, beauty→forbici/pettine, immobiliare→chiavi, ecc.) + regola generale "vesti nel mondo del brand". 
- **Black Star — servizi allineati al sito reale (giugno):** la config riflette ora i 7 servizi/prodotti VERI del sito (letti dal vivo): **Venditore AI** 🤖 → /venditore-ai, **Registro Marca** ®️ → /registrar-marca, **Skill AI di Claude** 🧠 → /#prodotti (i 3 con link diretto), + i 4 servizi reali **AI Workflows** ⚙️, **Product Optimization** 🚀, **Siti & Landing** 💻, **Ecosistemi digitali** 🧩. Posizionamento "Trasformiamo prodotti in ecosistemi". Personaggio 3D + dark preservati. Verificato dal vivo sul sito con agent-browser (saluto, 7 servizi, link marchio). I vecchi servizi inventati (Instagram/Branding/SEO a sé) erano sbagliati e sono stati rimossi.
- **Bottoni-link diretti (#19):** un servizio/opzione con campo `link` apre DIRETTO la sua pagina (helper `openLink`/`optionLink`, traccia il lead) invece di WhatsApp; i servizi senza link tengono WhatsApp. Card prodotto: se `p.link` → CTA "Scopri di più →"/`linkLabel`. Black Star: i 3 prodotti chiave aprono pagine reali (`/registrar-marca`, `/budtender-ai`, `/#skill`).
- **Il Raviolo Bottega (3º cliente, live) — CATALOGO DINAMICO:** bottega pasta fresca/salumi a Las Palmas (`ilraviolo.es/bottega`). Il catalogo cambia di continuo → la config NON è statica ma **generata dal vivo** dall'endpoint **`/api/ilraviolo.js`** che legge il database **Supabase** del cliente (tabella `bottega_products`, ~100 prodotti) e costruisce reparti+prodotti+foto, unendoli alla parte fissa (tema/saluti/WhatsApp dentro la route). Cache 10 min (`s-maxage=600`), CORS aperto, fallback statico se Supabase è giù. Mostra solo prodotti `visible=true` e non `agotado`. Chiave Supabase anon in env var Vercel **`ILRAVIOLO_SUPABASE_KEY`** (cifrata, NON nel codice). Tema dark navy `#0a1f35`+oro `#e8b84f`, logo filigrana, ES/IT/EN, WhatsApp 34671085862, `character:false` (manca il Raviolino mascotte da generare). **Embed:** `data-config="https://aiseller-blackstar.vercel.app/api/ilraviolo"` `data-color="#e8b84f"`, SOLO su /bottega. (Il vecchio `clients/ilraviolo.json` statico è superato dall'endpoint.)
  - Per cambiare reparti/emoji/ordine o la parte fissa: modifica `api/ilraviolo.js` (mappa `META` + `baseConfig()`) e ridistribuisci. La chiave Supabase si reimposta con `vercel env add ILRAVIOLO_SUPABASE_KEY`.
- **Skill abbinamenti culinari (#28):** in `app.js` la costante `FOOD_PAIRINGS` (mappa: regex sul nome prodotto → lista ordinata di parole-complemento della tradizione italiana) + `pairEntry/bestComplement/buildPairPitch`. `suggestNext(p)` ora riceve il PRODOTTO (non la categoria), trova il complemento giusto disponibile in catalogo (`nameHit` sui nomi/keys) e lo propone spiegando il perché (`why`). Verificato: cappellacci di zucca→Parmigiano (mai pesto), ricotta&spinaci→pomodoro. Fallback alla regola di categoria `D.crossSell` se nessun complemento culinario è in catalogo. È una skill GENERICA (vale per ogni cliente food).
- **Istruzioni di cottura piatti pronti (#29):** `D.prepInstructions` (config, propagata da `mergeTenant`) = `[{match, text{es,it,en}}]`. `prepFor(p)` in `app.js`; `addToLista` mostra l'istruzione dopo "Aggiunto". Per Il Raviolo: lasagne/cannelloni/parmigiana (forno o friggitrice ad aria 180°/18min, togli il coperchio di plastica). Nota: questi prodotti sono in categoria **"Horno"** su Supabase (menu "Forno 🥖"), non "Plato preparado". L'entry `FOOD_PAIRINGS` per lasagn/cannellon/parmigiana/preparado ha un campo `combo` = [[parole vino],[parole dolce]]: `suggestNext` propone VINO + DOLCE insieme (due card) via `bestFromKeywords`/`buildComboPitch`. Verificato: Lasagna → istruzioni + Vino tinto + Tiramisú.
- **Cross-sell "costruisci il pasto" (#24):** in modalità lead, se la config ha `D.crossSell` (mappa categoria→{suggest, pitch}) + `D.ctaAdd`, il bot mostra i prodotti del reparto con "➕ Aggiungi" (`browseCategory`), poi a ogni aggiunta propone l'abbinamento (`suggestNext`) e tiene una `state.lista`; "🛒 Ordina (N)" manda tutta la lista su WhatsApp (`listaCheckout`). Funzioni in app.js: `hasCrossSell/browseCategory/addToLista/suggestNext/bestProductOf/offerCheckout/listaCheckout`. `mergeTenant` propaga `crossSell`+`ctaAdd`. Il Raviolo: catena pasta→salsa→antipasto→formaggi→vino→dolce, definita in `api/ilraviolo.js`. Altri clienti (GAS/Black Star) NON hanno crossSell → flusso prenotazione classico invariato.
- **Personaggio Raviolino (FATTO):** mascotte raviolo che saluta (foulard rosso, badge "il R"), ospitata dal cliente su `https://ilraviolo.es/assets/il-raviolino.webp` (webp ~924KB, 1024×1536; la vecchia .png 2.4MB è stata sostituita). In `api/ilraviolo.js` `character` = oggetto con `rest/point/pointBack/face` tutti = quell'URL + `w:1024,h:1536`. Per cambiare la mascotte: sostituire il file su `/assets/` (stesso nome) → il bot si aggiorna da solo. `suggestNext` chiama `spotlightPick` → in cross-sell la mascotte ESCE e INDICA il piatto abbinato con nuvoletta. Verificato dal vivo. (Img 2.4MB: in futuro ottimizzare a webp per la pallina.)
- **Pubblicazione config (qualsiasi cliente):** POST a `/api/save` con `{id, config}` → scrive `clients/<id>.json` sul Blob. Es. `publish-blackstar.py` (id=blackstardigital). Per Il Raviolo: id=ilraviolo. Black Star e Il Raviolo vivono sul Blob; GAS sul deploy Vercel.
- **Archetipo "pastaio/bottega" (#21):** aggiunto in `studio.html` per pasta fresca/salumi/gastronomia (vassoio ravioli o mattarello, NIENTE fili in mano). Lo "chef" resta per ristoranti/pizzerie.
- **Fix badge "La scelta di Kaya" (#22):** in `mergeTenant` l'etichetta della card consigliata è ora neutra/per-cliente (`KF_DATA.seller.pick`, default "La mia scelta / Mi elección / My pick", override via `p.pick`). Valeva per TUTTI i clienti.
- **Tono per settore (#20):** nuove chiavi config propagate da `mergeTenant` → `emergency:false` (disattiva il flusso panne/chiamata), `askHint` (esempi del fallback su misura), `problemEmpathy` (empatia senza 🔧), `emoji`{categoria→icona} + `itemEmoji` (icona segnaposto schede, no 🔧 di default). GAS invariato; Black Star ha `emergency:false`, empatia/hint da agenzia, icone 🤖🚀⭐💻📸🎨🔍.

### Cosa è IN SOSPESO (prossimi passi, in ordine)
1. **Modalità AI** (Claude): proxy `/api/chat`, system prompt per-cliente, serve API key come env var su Vercel. Mantieni rules come default.
2. **Dashboard analytics** nostra (serve storage/DB).
3. Pagina `/percorso.html` stilizzata (case study dei 18 punti, oggi è solo il `.md`).
4. (Strategico) Trasformazione in **SaaS** → vedi `SAAS-BLUEPRINT.md`.

### Come muoverti
Conferma in una riga che hai letto lo stato, poi chiedimi su quale punto vuoi lavorare (o riprendi quello che ti indico). Per modifiche al motore/UI testa in preview headless e fai deploy con la procedura sopra (entrambi gli alias). Niente refactor non richiesti: il valore è nella logica già validata.

## ⧉ FINE PROMPT

---

*Blackstar Digital Studio — Non costruiamo siti. Costruiamo strumenti che acquisiscono clienti. 🇮🇹 Made in Italy*
