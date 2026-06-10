# Brief per Codex — Pagina "Case Study / Dietro le quinte" (AI Seller)
> *Blackstar Digital Studio · 🇮🇹 Made in Italy*
> Documento di consegna per Codex. Obiettivo: costruire una pagina che racconta **come abbiamo costruito AI Seller**, mostrando i 20 problemi trovati e risolti — per far risaltare nel profilo la cura e il metodo di lavoro.
> Tutto il contenuto (verbatim) è incluso in sezione 4. Non serve inventare nulla.

---

## 0. Cosa devi fare (in una riga)
Creare una **nuova pagina/route** su `blackstardigitalstudio.com` che presenta il "dietro le quinte" della costruzione del prodotto AI Seller: l'idea, i **20 problemi trovati e risolti** (formato Problema → Soluzione), la filosofia e una CTA finale. Stile coerente col sito (dark, premium). Contenuto pronto in sezione 4.

## 1. Perché questa pagina (obiettivo)
Non è una pagina di vendita: è una pagina di **credibilità e personal brand**. Mostra il **metodo** e l'**onestà** di Blackstar: un prodotto non nasce in linea retta, ma trovando problemi e sistemandoli alla radice. Ogni "errore" raccontato qui è **qualità in più**. Serve a far dire al visitatore: *"questi sanno il fatto loro, voglio lavorare con loro."*

## 2. Dove inserirla (placement)
Il sito usa **route dedicate** per le pagine di dettaglio (es. `/budtender-ai`, `/registrar-marca`, `/cv/`) e anchor (#prodotti, #servizi, #contatti) per le sezioni della home. La sezione **CV (`/cv/`) è già il "Portfolio 🛰️" con "case study reali"**: questa pagina è un suo naturale completamento.

- **Route consigliata:** `/case-study-venditore-ai` (alternativa: `/dietro-le-quinte`).
- **Linkala da:**
  1. la pagina **CV / Portfolio** (`/cv/`) → come case study in evidenza: *"Dietro le quinte: 20 problemi risolti →"*;
  2. la **scheda prodotto AI Seller** / pagina `/budtender-ai` → bottone *"Guarda come l'abbiamo costruito →"*;
  3. (se esisterà) la **landing `/venditore-ai`** → sezione "riprova sociale" con link qui.
- **Menu:** non è obbligatorio metterla nel menu principale; il link dal Portfolio e dalla scheda prodotto basta. (Opzionale: una voce "Dietro le quinte".)

## 3. Struttura della pagina (sezioni in ordine)

1. **HERO**
   - Occhiello: `CASE STUDY · AI SELLER`
   - Titolo (H1): `Come abbiamo costruito AI Seller`
   - Sottotitolo: `Il percorso vero, errori compresi. Non una linea retta: trovare problemi, sistemarli alla radice, rendere tutto più umano. Ogni "sbaglio" qui sotto è un pezzo di qualità in più.`
   - **Contatore d'impatto:** un numero grande → `20` con etichetta `problemi trovati e risolti`. (Bello se animato/contatore che sale.)

2. **L'IDEA** (testo introduttivo) — vedi sezione 4.

3. **I 20 PROBLEMI (e come li abbiamo risolti)** — il cuore della pagina.
   - Renderli come **timeline verticale** o **griglia di card numerate** (1→20).
   - Ogni card: **numero grande** (in oro), **titolo** del problema in grassetto, poi due blocchi distinti:
     - **❌ Problema** (la parte di testo *prima* della freccia `→`) — accento rosso/ambra.
     - **✅ Soluzione** (la parte *dopo* la freccia `→`) — accento verde.
   - Su mobile: una colonna; su desktop: timeline o 2 colonne.

4. **LA FILOSOFIA** — 3 principi (vedi sezione 4).

5. **DOVE SIAMO** — paragrafo di chiusura sullo stato del prodotto (vedi sezione 4).

6. **CTA FINALE**
   - Titolo: `Questa è la cura che mettiamo in ogni progetto.`
   - Testo: `Vuoi un prodotto seguito così, fino all'ultimo dettaglio? Parliamone.`
   - Bottone: `Richiedi una demo / Contattaci →` → WhatsApp `https://wa.me/34644332485?text=Ciao%20Black%20Star!%20Ho%20visto%20il%20case%20study%20di%20AI%20Seller`
   - Footer micro: `Blackstar Digital Studio · Made in Italy 🇮🇹`

---

## 4. CONTENUTO COMPLETO (verbatim — usa questo testo)

> **Istruzione di resa per i 20 punti:** in ogni voce, il testo **prima** del simbolo `→` è il **Problema**; il testo **dopo** `→` è la **Soluzione**. Rendili visivamente distinti (❌ rosso / ✅ verde). Il grassetto iniziale è il titolo della card.

### Intro — L'idea
Partiti da **una semplice demo**: un venditore-chatbot per un negozio. L'intuizione: e se quel venditore diventasse un **prodotto vendibile a chiunque**, che si configura da solo leggendo il sito del cliente? Da lì è iniziato il vero lavoro — e i veri problemi.

### I 20 problemi

**1. Sembrava un robot freddo.**
Il personaggio dava consigli ma senza calore. → Abbiamo aggiunto uno **strato umano**: reazioni empatiche dopo ogni scelta, frasi mai uguali, e la richiesta del **nome** che il venditore poi usa ("Allora Marco, …"). Differenza enorme nella vicinanza.

**2. La nuvoletta non appariva su Android.**
Sul cellulare il consiglio "Secondo me scegli questo" spariva prima di leggerlo: il semplice scroll col dito chiudeva l'indicazione. → Abbiamo **protetto la nuvoletta per 2 secondi** prima che qualsiasi gesto la chiuda.

**3. Se scrivevi libero, andava in tilt.**
Digitando "CBD" non succedeva nulla, oppure usciva roba a caso. → Principio dell'**imbuto**: qualunque cosa scriva l'utente, l'interfaccia lo **guida sempre** con una domanda e dei bottoni. Mai un vicolo cieco.

**4. La voce di un cliente "sbavava" su un altro.**
I richiami pensati per il negozio CBD comparivano nella chat dell'autofficina. → Ogni contenuto di marca è ora **isolato per cliente**: zero contaminazioni.

**5. Lo stile si rompeva dopo gli aggiornamenti.**
Avevamo il CSS a una versione e il codice a un'altra → il widget caricava regole vecchie. → Regola ferrea: **tutte le versioni si aggiornano insieme**.

**6. Il personaggio in piedi veniva tagliato.**
La mascotte era disegnata per una posa "sdraiata"; una in piedi usciva fuori dallo schermo. → Abbiamo reso l'area del personaggio **adattiva a qualsiasi proporzione**, ancorata ai piedi: ora entra sempre intera, su desktop e mobile. *Responsive come parola d'ordine.*

**7. Indicava dalla parte sbagliata.**
Il personaggio caricato puntava al contrario perché lo specchiavamo a forza (era tarato sul primo disegno). → Verso dell'indicazione **configurabile**, con un interruttore "inverti" a prova di errore.

**8. I bottoni dei servizi non avevano senso.**
Per un'officina uscivano frasi-slogan prese dal sito ("Hai questo problema?"). → Abbiamo creato una **tassonomia per settore**: "è un meccanico → ecco le sue categorie reali" (Diagnosi, Tagliando, Gomme, ADAS…). Bottoni sempre sensati. Poi lo stesso per ristoranti, immobiliari, studi medici, hotel.

**9. Domande fuori contesto.**
In un'officina compariva "Il CBD è legale?". → I bottoni si **adattano alla modalità** (negozio vs servizi): mai più domande estranee.

**10. La pallina non compariva.**
Un piccolo errore d'ordine nel codice impediva al widget di montarsi. → Trovato e blindato con dei controlli di sicurezza.

**11. "Agenzia Immobiliare" scambiata per agenzia tech.**
Il riconoscitore di settore era troppo generico su una parola. → **Riordinati i settori specifici prima di quelli generici**: ora ogni attività viene capita giusta.

**12. E se il sito ha già WhatsApp e Chiamata flottanti?**
Rischio: due bottoni che si coprono a vicenda. → La nostra pallina **rileva i bottoni già presenti e si sposta sopra da sola**, senza cannibalizzarli. (E si può anche mettere manualmente sull'altro lato.)

**13. Capiva solo il "linguaggio" del primo cliente.**
Scrivendo a parole libere a un meccanico (es. *"la macchina non parte"*) rispondeva con bottoni a caso. → Ora **capisce il testo libero guidato dai servizi del cliente**: riconosce il servizio nominato, intercetta i **problemi** ("non parte", "fa rumore", "perde") con **empatia → diagnosi**, gestisce prezzo e prenotazione, e ha un **fallback umano** invece di bottoni secchi.

**14. Chiede il nome, ma l'utente parte col problema.**
Alla domanda "come ti chiami?", se l'utente scriveva subito *"la macchina non parte"* il sistema prendeva "La" come nome e **perdeva la frase**. → Ora **distingue un nome da un messaggio**: se è un nome lo usa, se è una frase **bypassa il nome e gestisce il messaggio** senza perdere nulla.

**15. In emergenza, nessuno vuole mille domande.**
Se uno è bloccato per strada o ha un'urgenza, l'ultima cosa che vuole è una chat lunga. → Abbiamo aggiunto il **rilevamento "emergenza/panico"** (*"non parte", "non si accende", "in panne", "urgente", "incidente"…*): il bot **salta tutto** e fa **contattare subito un umano** (📞 chiama / 💬 WhatsApp). L'utente arriva dritto al punto e capisce che il bot ha **colto la gravità** — invece di tenerlo lì a perdere tempo.

**16. Il personaggio che indica copriva i pulsanti.**
Quando la mascotte usciva per dire "il servizio migliore è questo", stava troppo in basso e **schiacciava i tasti**. → Ora si posiziona **appena sopra la zona dei pulsanti** (calcolata dalle coordinate reali) e, durante il puntamento, **i tasti si tolgono di mezzo** e riappaiono subito dopo. Il personaggio ha la scena, niente più sovrapposizioni.

**17. Tutti vestiti da pilota da corsa.**
Per un sito "dark" (scuro) il generatore del personaggio metteva **sempre una tuta racing** — assurdo per un'agenzia digitale, un ristorante o uno studio medico. → Ora il **tono dark resta** (abbigliamento scuro, bagliori nei colori del brand, luce cinematografica) ma il **tipo di personaggio lo decide il settore**: la tuta/piping racing scatta **solo** per officine e attività sportive. Un'agenzia tech ottiene un assistente moderno e premium, non un pilota.

**18. I servizi rilevati non erano quelli giusti.**
Configurando la nostra stessa agenzia, la lettura automatica del sito pescava servizi generici (SEO, "ottimizzazione prodotto") e perdeva quelli su cui vogliamo davvero puntare. Normale: il sistema legge ciò che è **scritto** sul sito, non ciò che hai in testa. → I servizi sono **completamente modificabili per ogni cliente**: si imposta la lista reale e si possono **mettere in evidenza** quelli prioritari con un badge (es. ⭐ Consigliato, 🤖 Punta di diamante), così la chat li spinge per primi. La lettura automatica è il **punto di partenza**, non la gabbia.

**19. Alcuni servizi devono portare DIRITTO a una pagina, non in chat.**
Per i prodotti ad alta intenzione (registrare il marchio, comprare il chatbot, le skill AI) far passare tutto dal messaggio WhatsApp allungava la strada. → Ora un servizio (o un'opzione del menu) può avere un **link diretto**: cliccandolo si **apre la sua pagina dedicata** (e l'evento viene tracciato come lead). I servizi senza link tengono il flusso WhatsApp. Su Black Star i tre prodotti chiave aprono le pagine reali del sito (registrazione marchio, chatbot AI, skill di Claude).

**20. La chat "sapeva di officina" anche su un'agenzia.**
Alcune frasi pensate generiche erano in realtà tarate sul meccanico e trapelavano: l'empatia con la 🔧, gli esempi "perde olio / fa un rumore strano", il flusso "emergenza/panne → chiamata immediata" e perfino l'icona 🔧 sulle schede. Su un'agenzia digitale stonavano. → Ora **il tono è per settore**: l'emergenza si può **disattivare**, l'empatia, gli esempi e le **icone delle schede** sono **personalizzabili per cliente**. GAS resta com'era (officina vera); Black Star parla da agenzia. Ogni mondo ha la sua voce.

### La filosofia dietro
Tre principi, ripetuti a ogni passo:
1. **Trova il problema** — meglio noi su un sito di prova che il cliente dal vivo.
2. **Sistemalo alla radice** — non una pezza sul singolo caso, ma una regola che vale per tutti i clienti futuri.
3. **Rendilo più umano e semplice** — meno robot, più persona; meno passaggi, più "funziona e basta".

### Dove siamo
Il venditore oggi: si **configura leggendo il sito**, sceglie il **personaggio e il tono giusti per il settore**, parla in modo **umano** (in italiano, spagnolo e inglese), **richiama** il visitatore quando è inattivo, e si installa con **una sola riga di codice** — su qualsiasi sito, senza dare fastidio a ciò che c'è già.

> Non costruiamo siti. Costruiamo strumenti che acquisiscono clienti. — *Blackstar Digital Studio* 🇮🇹

---

## 5. Design & brand
- **Stile:** dark, premium, coerente col resto del sito Blackstar. (Riferimenti dark/oro già usati nel progetto: `start.html`, `installa.html`.)
- **Colori:**
  - Sfondo scuro: `#0f0c1d` / gradiente `#13102a → #1c1840`
  - **Accento oro: `#a68732`** (numeri, titoli, bottoni, linea della timeline)
  - Problema: rosso/ambra `#e0573a` (icona ❌, etichetta "Problema")
  - Soluzione: verde `#2ec1a0` (icona ✅, etichetta "Soluzione")
  - Testo: bianco / `#cfc8ec` per i secondari
- **Tipografia:** sans-serif moderna e pulita; numeri delle card grandi e marcati.
- **Micro-animazioni (gradite, non obbligatorie):** contatore "20" che sale; card che entrano in fade allo scroll; linea della timeline che si "riempie".
- **Mobile-first:** una colonna, leggibile col pollice; CTA finale ben visibile.
- **Footer:** sempre **"Made in Italy 🇮🇹"** + Blackstar Digital Studio.

## 6. SEO
- **Slug:** `/case-study-venditore-ai`
- **Title:** `Come abbiamo costruito AI Seller — 20 errori e correzioni | Blackstar`
- **Meta description:** `Il dietro le quinte onesto di come nasce un prodotto: 20 problemi trovati e risolti alla radice. La cura e il metodo che Blackstar mette in ogni progetto.`
- **H1 unico:** quello dell'hero. Ogni problema può essere un `<h3>`.
- **Open Graph:** immagine con "AI Seller · 20 problemi risolti" per le condivisioni.
- Aggiungi la pagina alla **sitemap** e linkala dal Portfolio/CV.

## 7. Checklist di consegna
- [ ] Pagina online su `/case-study-venditore-ai`, responsive (test su mobile vero)
- [ ] Hero con contatore "20"
- [ ] I 20 punti resi come timeline/card, con Problema (❌) e Soluzione (✅) distinti
- [ ] Sezioni "L'idea", "Filosofia", "Dove siamo", CTA finale
- [ ] Link in entrata dal CV/Portfolio e dalla scheda prodotto AI Seller
- [ ] Brand rispettato (dark/oro), "Made in Italy" nel footer
- [ ] SEO (title/meta/slug/OG) + sitemap
- [ ] Testo verbatim dalla sezione 4 (nessuna modifica al contenuto senza ok di Blackstar)

## 8. Note
- Il **contenuto è definitivo** (sezione 4): non riscriverlo né riassumerlo, al massimo migliora la resa visiva. Se vuoi proporre tagli/aggiunte, segnalali a Blackstar prima.
- Se in futuro aggiungiamo nuovi problemi risolti (#21, #22…), basterà appendere altre card con lo stesso schema.

---

*Blackstar Digital Studio — Non costruiamo siti. Costruiamo strumenti che acquisiscono clienti. 🇮🇹 Made in Italy*
