# Attivare l'auto-post su Instagram e Facebook — runbook

Stato: il codice del "prodotto del giorno" pubblica già su IG/FB (storie + post). Manca solo
sbloccare i **permessi Meta**. Questo documento spiega cosa fare, passo per passo.

*Made in Italy — Blackstar Digital Studio*

---

## 1. Perché ora Instagram dà errore (diagnosi reale)
Il test ha dato `code 2` ("unexpected error") su `POST /{ig_user_id}/media`. **Non è App Review**:
il permesso `instagram_content_publish` per il *tuo* account funziona già in modalità sviluppo.
La causa quasi certa è la **catena IG → Pagina Facebook**:

- Per pubblicare su Instagram via API, l'account IG Business deve essere **collegato a una Pagina Facebook**,
  e il token deve avere accesso a quella Pagina (`pages_read_engagement` / `pages_show_list`).
- L'app **"Raviolo bottega" non espone i permessi Pages** (quando ho generato il token, `pages_*` non erano disponibili),
  e l'utente di sistema **raviolo-bot non ha la Pagina assegnata**.
- Senza questa catena, il flusso di pubblicazione IG fallisce con l'errore generico `code 2`.

Cosa invece è già OK: account `@ilraviolobottega` accessibile, `instagram_content_publish` attivo
(`content_publishing_limit` risponde), immagini pubbliche su Vercel Blob, `IG_USER_ID` impostato.

---

## 2. Cosa sblocca tutto (in ordine)

### Passo A — Collega l'account Instagram a una Pagina Facebook
WhatsApp/Commerce a parte, serve una **Pagina Facebook** della bottega collegata all'IG `@ilraviolobottega`.
- App **Instagram** → Impostazioni → **Account collegati / Cuenta** → collega/condividi con una **Pagina Facebook**.
- Verifica che l'IG sia di tipo **Business** (non Creator/personale): Instagram → Impostazioni → Tipo di account.

### Passo B — Aggiungi i permessi Pages all'app Meta
`developers.facebook.com` → app **Raviolo bottega** (ID `929821073277407`) → **Casi d'uso / Use cases**:
- Aggiungi/abilita il caso d'uso che include: `pages_show_list`, `pages_read_engagement`,
  `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`, `business_management`.
- (Per il *tuo* account, in modalità Sviluppo, questi permessi funzionano con **Standard Access**, senza review.)

### Passo C — Assegna la Pagina all'utente di sistema
`business.facebook.com` → Impostazioni → **Utenti di sistema** → **raviolo-bot** → **Aggiungi risorse** →
**Pagine** → seleziona la Pagina della bottega → **Controllo completo**.

### Passo D — Rigenera il token (questo lo faccio io)
Quando A–C sono fatti, rigenero il token System User con gli scope completi
(`catalog_management, business_management, instagram_basic, instagram_content_publish,
pages_show_list, pages_read_engagement, pages_manage_posts`), aggiorno il secret
`META_ACCESS_TOKEN`, ricavo `FB_PAGE_ID` e lo imposto, poi lancio una prova reale.

---

## 3. Quando serve DAVVERO l'App Review
Solo se vuoi che l'app pubblichi **su account NON tuoi** o passare l'app in modalità **Live** pubblica.
Per pubblicare sul **tuo** account in modalità Sviluppo NON serve. Se in futuro servisse, l'App Review richiede:
1. **Screencast** che mostra la funzione che pubblica (registrazione video).
2. Descrizione d'uso di ogni permesso.
3. Eventuale **verifica del business** (documenti dell'azienda).
4. Revisione umana di Meta (giorni/settimane).
Questi passi (video, documenti aziendali) **devono farli persone**, non sono automatizzabili.

---

## 4. Intanto: già pronto e funzionante
- **WhatsApp Stato**: ogni mattina l'immagine è pronta al link fisso
  `https://hziutulpistrgear.public.blob.vercel-storage.com/historias/historia-hoy.jpg`
  → aprilo sul telefono → condividi su Stato (1 tap).
- **IG/FB manuale (2 tap)**: stessa immagine → salva → pubblica su storia/post.
- **Catalogo**: prodotto del giorno in evidenza, automatico.

Appena fai i Passi A–C (o mi dici di provarci quando il browser collabora), completo io B/D e accendo l'auto-post.
