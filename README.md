# 🌿 Kayaman's Farm — Chatbot Venditore (Demo)

Demo di un **chatbot venditore con neuromarketing** per [kayamansfarm.com](https://kayamansfarm.com),
smoke shop & CBD boutique di Las Palmas (Gran Canaria). Il bot capisce chi ha davanti,
profila il cliente e vende/offre i prodotti con tecniche di persuasione etiche.

**Made in Italy 🇮🇹 · Solo +18**

---

## ▶️ Come avviare la demo

Apri semplicemente **`index.html`** con un doppio clic (funziona offline, senza server).
Per le immagini reali dei prodotti serve la connessione internet.

> Consigliato Chrome/Edge/Firefox aggiornati.

---

## ✨ Cosa fa

| Funzione | Dettaglio |
|---|---|
| **Age-gate 18+** | Verifica età obbligatoria (settore regolamentato), memorizzata localmente |
| **Multilingua ES/EN/IT** | Rilevamento automatico + switch manuale. Tutto il bot è trilingue |
| **Design del brand** | Palette **fedele ai colori reali** del sito (tema Flatsome): rosso `#ab2e31` · oro `#fbb102` · verde `#839669`/`#00a901` · olive `#5d5020` — la triade rosso-oro-verde rasta |
| **Made in Italy 🇮🇹** | Bandiera tricolore (SVG) in header, age-gate e footer |
| **Mascotte "Kaya"** | Elfo stile Bob Marley (SVG vettoriale in `assets/mascot.svg`) |
| **Profilazione cliente** | Domande mirate: esperienza, regalo/per sé, categoria, budget |
| **Neuromarketing** | Riprova sociale, scarsità, autorità, anchoring, reciprocità, loss-aversion, linguaggio sensoriale |
| **Cross-sell / upsell** | Se compri cartine → propone grinder, ecc. |
| **Gestione obiezioni** | Prezzo, legalità CBD, spedizione, "troppe opzioni" |
| **Catalogo reale** | 20 prodotti estratti da kayamansfarm.com (prezzi €) |
| **Carrello + checkout** | Carrello completo con checkout simulato |

### 🧲 Neuromarketing sullo storefront (skill *marketing-psychology*)
- **Barra promo** con countdown di urgenza (`−10% KAYA10`, spedizione gratis +60€)
- **Anchoring**: prezzo precedente sbarrato + badge "RISPARMI X€" sulle offerte
- **Social proof** a rotazione (discreto): "X persone lo stanno guardando", "ultimo ordine N min fa"
- **Barra "ti mancano X€ alla spedizione gratis"** nel carrello (commitment + loss-aversion)
- **Progress "Domanda 1 di 4"** nella profilazione (commitment & consistency)

### 😈 Motore di re-engagement "spietato"
- **Inattività (idle)** → vibrazione + beep + la bolla sobbalza, Kaya manda un messaggio con offerta
- **Widget minimizzato** → badge lampeggiante "1 nuovo messaggio" + vibrazione dopo pochi secondi
- **Exit-intent** (mouse verso l'uscita) → popup last-minute con codice sconto **KAYA10** e countdown
- **Cambio scheda** → il titolo della tab lampeggia per richiamare l'utente

---

## 🤖 Attivare l'AI di Claude (opzionale)

La demo gira **al 100% senza chiave** grazie a un motore intelligente a regole.
Per l'AI completa, apri **`config.js`**:

```js
window.KF_CONFIG = {
  useClaude: true,            // attiva
  apiKey: "sk-ant-...",       // la tua chiave Anthropic
  model: "claude-opus-4-8",
  ...
};
```

> ⚠️ **Non esiste una API key Anthropic gratuita** (Claude API è a consumo:
> [console.anthropic.com](https://console.anthropic.com)). Per la demo lascia
> `useClaude: false`.
> ⚠️ In produzione la chiave non va messa nel browser: serve un piccolo
> backend/proxy che la nasconda.

---

## 📁 Struttura

```
chatbot/
├── index.html        # pagina + struttura widget
├── styles.css        # stile (palette del brand)
├── app.js            # motore bot, carrello, re-engagement
├── config.js         # configurazione + Claude API key
├── assets/
│   ├── mascot.svg       # mascotte elfo Bob Marley
│   └── italy-flag.svg   # bandiera tricolore Made in Italy
├── data/
│   └── data.js       # catalogo reale + strategia neuromarketing + copy
└── README.md
```

---

## ⚖️ Note legali

Demo a scopo dimostrativo. Prodotti per **maggiori di 18 anni**. Il CBD è
proposto con framing di benessere/lifestyle, **senza claim medici**. In
produzione verificare la normativa locale su pubblicità di prodotti per fumatori/CBD.

Made in Italy 🇮🇹
