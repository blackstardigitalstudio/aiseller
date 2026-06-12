# Ponte social Make.com — pubblicare su IG/FB bypassando l'app Meta bloccata

Idea: Make.com ha **già l'app Meta approvata**. Tu colleghi IG+FB sul sito di Make (non sul pannello
sviluppatori Meta, niente App Review). Il nostro automatismo manda l'immagine ogni mattina a un
**webhook** di Make, e Make pubblica su Instagram e Facebook. Costo: **gratis** (1000 operazioni/mese,
a noi ne servono ~120).

*Made in Italy — Blackstar Digital Studio*

---

## Cosa fai tu (una volta sola, ~10 minuti)

### 1. Crea l'account
Vai su **make.com** → registrati (gratis).

### 2. Crea lo scenario col webhook
- **Create a new scenario**.
- Primo modulo: cerca **Webhooks** → **Custom webhook** → **Add** → dai un nome (es. "raviolo") → **Save**.
- Make ti dà un **URL** tipo `https://hook.eu2.make.com/xxxxxxxx`. **Copialo** (mi serve questo).
- Premi **Run once** (resta in ascolto: serve per "imparare" i dati al primo invio — vedi punto 5).

### 3. Aggiungi Instagram (post in bacheca)
- Aggiungi un modulo: **Instagram for Business** → **Create a Post** (o "Create a Photo Post").
- **Connessione**: collega il tuo account **Instagram** (qui fai il login Instagram/Facebook — è il punto chiave,
  usa l'app Meta di Make già approvata).
- **Photo URL** → mappa il campo `feedUrl` (arriva dal webhook).
- **Caption** → mappa il campo `caption`.

### 4. Aggiungi Facebook (post sulla Pagina)
- Aggiungi un modulo: **Facebook Pages** → **Create a Post**.
- **Connessione**: collega la tua **Pagina Facebook**.
- **Photo URL** → `feedUrl` · **Message** → `caption`.

*(Opzionale, se disponibile nel tuo Make: aggiungi anche **Instagram → Create a Story** e
**Facebook → Create a Story** mappando `storyUrl` per le storie.)*

### 5. "Insegna" i dati al webhook
- Tieni lo scenario in **Run once** (punto 2) e scrivimi **"webhook pronto" + l'URL**: io lancio un invio di prova,
  così Make registra i campi (`feedUrl`, `caption`, ecc.) e puoi mapparli nei moduli.

### 6. Accendi
- Mappati i campi, **salva** e metti lo scenario su **ON** (scheduling: *Immediately*, è attivato dal webhook).

---

## Cosa faccio io
- Imposto il secret `SOCIAL_WEBHOOK_URL` con l'URL che mi dai.
- Lancio la prova reale: l'immagine del giorno parte al webhook → Make pubblica su IG e FB.
- Da lì in poi: ogni mattina, in automatico, senza toccare niente.

## Dati che il nostro automatismo manda al webhook (JSON)
```json
{
  "productName": "...", "price": "3,00 €", "category": "Embutidos", "theme": "blue",
  "caption": "testo + hashtag", "storyUrl": "https://.../historia-hoy.jpg",
  "feedUrl": "https://.../post-hoy.jpg", "date": "2026-06-12"
}
```
- `feedUrl` = immagine 4:5 per i **post**. `storyUrl` = 9:16 per le **storie**.
