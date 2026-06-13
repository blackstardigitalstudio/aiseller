# Motore Social AI — Roadmap & architettura (riutilizzabile / white-label)

**Visione:** un **motore** che, dato un cliente (un file di configurazione con link + account + brand), gestisce in automatico tutta la presenza social: catalogo → WhatsApp, immagini brandizzate d'impatto, post/storie su Instagram e Facebook, calendario annuale editabile, rigenerazione settimanale con AI, analisi dei risultati.
**Riusabile:** per un nuovo cliente → nuovo file config + collega gli account → il motore fa tutto. Rivendibile.

*Made in Italy — Blackstar Digital Studio*

---

## Architettura (multi-cliente, config-driven)
Tutto ciò che è specifico di un cliente vive in **un solo file**: `clients/<cliente>.config.json`.

```jsonc
{
  "id": "raviolo",
  "brand": { "nombre": "Il Raviolo Bottega", "ciudad": "Las Palmas de Gran Canaria",
             "web": "ilraviolo.es/bottega", "whatsapp": "671 085 862",
             "logo": "https://ilraviolo.es/assets/logo.webp",
             "colores": { "primario": "#0c2440", "acento": "#e8b84f" } },
  "catalogo": { "tipo": "supabase", "url": "...", "tabla": "bottega_products" },
  "social":   { "ig_user_id": "...", "fb_page_id": "", "webhook_make": "..." },
  "wa_catalog_id": "1337190845012352",
  "pilares": [ ...calendario editoriale... ],
  "hashtags": { "brand": [...], "local": [...], "general": [...], "cat": {...} }
}
```
Gli script (sync, immagini, posting, piano) e le dashboard leggono **la config** → nessun valore fisso. Onboarding nuovo cliente = compilare la config + collegare account.

---

## Scaletta (in ordine). Stato a oggi:

### ✅ Fase 0 — Fondamenta (FATTO)
- Catalogo WhatsApp auto-aggiornato da Supabase + collezioni per categoria.
- Generatore immagini brandizzato (formati story/post, temi azzurro/oro, motivo logo).
- **Editor stile Canva** (`creador.html`): sfondo/colori/font/foto editabili, download PNG.
- **Calendario annuale editabile** (`plan.html`): ogni giorno pre-creato, modificabile, cambi il post di un giorno.
- **Dashboard** (`panel.html`).
- **Ponte Make** → Instagram automatico (bypassa i limiti dell'app Meta). Storia WhatsApp pronta ogni mattina.
- Hashtag + tono corretti su **Las Palmas de Gran Canaria**.

### 🔜 Fase 1 — Refactor "Engine" (riusabilità)
Estraggo `clients/raviolo.config.json`; script e dashboard leggono `?cliente=raviolo`. Così il motore serve N clienti.
*(Autonomo, lo faccio io.)*

### 🔜 Fase 2 — Studio competitor + piano 12 mesi (Las Palmas)
Ricerca vera sui competitor (italiani/gastronomie/delicatessen a Las Palmas + su IG), posizionamento, e **piano d'azione mensile per 1 anno**.
*(Autonomo, ricerca — in corso ora.)*

### 🔜 Fase 3 — Sync cloud del piano (Supabase)
Tabella `content_plan` (data, contenuto, stato). Le modifiche al calendario si salvano in cloud → sincronizzate PC↔cellulare, e leggibili dal motore.
*(Serve: creare 1 tabella su Supabase — ti do l'SQL esatto.)*

### 🔜 Fase 4 — Immagini automatiche in stile "editor d'impatto"
Il generatore giornaliero usa lo stile inmersivo dell'editor (non il vecchio).
*(Autonomo.)*

### 🔜 Fase 5 — Motore settimanale (GRATIS, a regole)
Workflow domenicale che rigenera la settimana seguendo la "guida generale" codificata (pilastri, regole di varietà, best-practice dello studio) + eventuali dati di performance. **Nessuna AI a pagamento, nessun costo, nessuna dipendenza.** AI gratuita (Gemini/Groq/Cloudflare) opzionale e attivabile come "extra" per testi più freschi.

### 🔜 Fase 6 — Analisi risultati ("cosa funziona")
Metriche reali IG (reach/like/salvataggi) in dashboard.
*(Serve: collegare insights — Metricool gratis o permesso IG.)*

### 🔜 Fase 7 — Hub unico + Onboarding white-label
Un pannello che lega tutto (calendario, editor, risultati, config) + procedura/template per agganciare un nuovo cliente in pochi minuti.
*(Autonomo.)*

---

## Cosa posso fare da solo vs cosa serve da te (una volta)
- **Da solo:** Fasi 1, 2, 4, 7 e il codice di 3/5/6.
- **Un'azione tua (una volta):** tabella Supabase (Fase 3), chiave API AI (Fase 5), collegamento Metricool (Fase 6).

Procedo in ordine e ti consegno fase per fase. Quando arrivo a una fase che richiede una tua azione, te lo dico con i passi esatti e intanto vado avanti col resto.
