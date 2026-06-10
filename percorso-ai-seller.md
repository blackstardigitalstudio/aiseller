# Come abbiamo costruito AI Seller — il percorso vero, errori compresi

> *Made in Italy · Blackstar Digital Studio*
> La storia onesta di come nasce un prodotto: non in linea retta, ma trovando problemi, sistemandoli e rendendo tutto più umano e semplice. Ogni "sbaglio" qui sotto è un pezzo di qualità in più.

## L'idea
Partiti da **una semplice demo**: un venditore-chatbot per un negozio. L'intuizione: e se quel venditore diventasse un **prodotto vendibile a chiunque**, che si configura da solo leggendo il sito del cliente? Da lì è iniziato il vero lavoro — e i veri problemi.

---

## I problemi che abbiamo trovato (e come li abbiamo risolti)

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

**21. Il personaggio del cibo usciva con "fili in mano".**
Per una bottega di pasta fresca il generatore non aveva un archetipo dedicato → cadeva sullo "chef" generico e il modello disegnava spaghetti sciolti che sembravano fili/corde in mano. → Aggiunto l'archetipo **"pastaio/bottega"** (pasta fresca, salumi, formaggi, gastronomia italiana) con i props giusti — **vassoio di ravioli o mattarello** — e l'istruzione esplicita di **non mettere fili/corde in mano**. Ogni settore ha il suo personaggio credibile.

**22. "La scelta di Kaya" appariva su ogni cliente.**
Il badge sulla card consigliata mostrava ancora *"La scelta di Kaya"* (eredità della demo originale) anche su un'agenzia o una bottega. → Etichetta resa **neutra e personalizzabile per cliente** ("La mia scelta / Mi elección / My pick"), valida per tutti i clienti presenti e futuri.

**30. Il venditore insisteva troppo (metteva ansia).**
Proporre un abbinamento dopo OGNI aggiunta, con la mascotte che esce ogni volta, dava la sensazione di un venditore addosso. → Abbiamo **abbassato l'insistenza**: il bot propone al massimo un paio di volte, poi si ferma; se il cliente dice "no grazie" **non insiste più**; la mascotte esce **solo la prima volta**; e abbiamo ridotto le animazioni (il carrello non pulsa più di continuo, la pallina fa meno saltelli e richiami). Un buon venditore consiglia, non assilla.

**29. I piatti pronti non dicevano come si scaldano.**
I monoporzione (lasagne, cannelloni, parmigiana…) hanno bisogno di un'istruzione chiara: forno o friggitrice ad aria a 180° per 18 min, togliendo il coperchio di plastica. → Abbiamo aggiunto le **istruzioni di preparazione per prodotto**: quando il cliente mette nel carrello un piatto pronto, il bot gli spiega **subito come scaldarlo**. E per i piatti pronti l'abbinamento diventa **vino/dolce** (non un sugo da aggiungere): un piatto finito si accompagna, non si condisce.

**28. Consigliava il pesto sui cappellacci di zucca (errore da cucina).**
Il cross-sell prendeva "la prima salsa del reparto" → suggeriva il pesto anche dove non c'entra nulla. → Abbiamo dato al bot una **skill di abbinamenti** basata sulla tradizione italiana: per ogni prodotto conosce il complemento **giusto** in ordine di priorità (zucca → burro/salvia/parmigiano/ragù, mai pesto; ravioli di carne → ragù; ricotta e spinaci → pomodoro leggero; tagliatelle → ragù/funghi/tartufo; trofie → pesto…). L'engine poi cerca il complemento corretto **disponibile in catalogo** e lo propone **spiegando il perché** ("il dolce della zucca chiede burro e salvia, mai il pesto"). Non più una salsa a caso: il complemento giusto, da vero esperto.

**27. Il carrello era nascosto e la mascotte copriva il testo.**
Nel flusso "costruisci il pasto" il tasto per ordinare si perdeva tra i messaggi (servivano 2-3 click) e la mascotte che indicava copriva un po' il testo. → Ora c'è una **barra carrello fissa in primo piano** ("🛒 Invia il mio ordine (N)") sempre visibile sopra la tastiera: un tap e parte la lista completa su WhatsApp. E la **mascotte è più piccola**, indica il piatto solo per un attimo e torna al suo posto, senza coprire i messaggi. Veloce e pulito.

**26. La pallina era troppo "ferma": nessuno la apriva.**
Chiusa e silenziosa, il widget non comunicava di essere cliccabile. → L'abbiamo reso **vivo**: un **alone pulsante** dietro la pallina (motion "sono attivo"), entrata con un **pop**, un **saltello** periodico per farsi notare, il **badge "1"** e una **nuvoletta-richiamo** che spunta presto ("🍝 Pasta fresca fatta oggi?", "👋 Ti aiuto?"). Il tutto si ferma appena apri la chat e quando la scheda non è in primo piano (niente sprechi/fastidi). Risultato: la pallina dice *"Ehi, sono qui, aprimi!"*.

**25. All'apertura lampeggiava il primo personaggio (Kaya).**
Aprendo il bot di un cliente, per un istante compariva la mascotte della demo originale (Kaya), perché l'iframe parte con le immagini di default e solo dopo carica quelle del cliente. → All'avvio in modalità widget **svuotiamo subito** le immagini del personaggio (prima ancora di scaricare la config), così durante il caricamento non lampeggia nessuno; poi si mette quella giusta. Apertura pulita, ogni cliente vede solo il suo personaggio.

**24. Vendere di più: il venditore che compone il pasto.**
Un buon venditore non porta un prodotto, porta una soluzione completa. → Abbiamo aggiunto un **cross-sell guidato (neuromarketing)**: scegli i ravioli → *"per il piatto perfetto, ci mettiamo un sugo?"* → aggiungi → *"e come antipasto? un tagliere di salumi"* → e così via (pasta → salsa → antipasto → formaggi → vino → dolce). Il bot costruisce con te il pasto, tiene una **lista** e a fine giro la manda **tutta su WhatsApp** in un colpo solo. Gli abbinamenti sono configurabili per cliente; per gli altri settori (officina, agenzia) resta il flusso classico.

**23. Il catalogo cambia ogni giorno: la config a mano non bastava.**
Una bottega aggiunge e toglie prodotti di continuo — una lista scritta a mano sarebbe sempre vecchia (il bot consiglierebbe cose finite). → Abbiamo collegato il bot **direttamente al database del cliente**: un endpoint legge il catalogo **dal vivo** (solo i prodotti disponibili e non esauriti), costruisce reparti, prodotti e foto, e li unisce alla parte fissa (tema, tono, contatti). Cache breve, con una **lista di riserva** se il database non risponde, così non si rompe mai. **Aggiungi o togli un prodotto sul gestionale → il bot lo sa da solo in pochi minuti.** Zero manutenzione.

---

## La filosofia dietro
Tre principi, ripetuti a ogni passo:
1. **Trova il problema** — meglio noi su un sito di prova che il cliente dal vivo.
2. **Sistemalo alla radice** — non una pezza sul singolo caso, ma una regola che vale per tutti i clienti futuri.
3. **Rendilo più umano e semplice** — meno robot, più persona; meno passaggi, più "funziona e basta".

## Dove siamo
Il venditore oggi: si **configura leggendo il sito**, sceglie il **personaggio e il tono giusti per il settore**, parla in modo **umano** (in italiano, spagnolo e inglese), **richiama** il visitatore quando è inattivo, e si installa con **una sola riga di codice** — su qualsiasi sito, senza dare fastidio a ciò che c'è già.

> Non costruiamo siti. Costruiamo strumenti che acquisiscono clienti. — *Blackstar Digital Studio* 🇮🇹
