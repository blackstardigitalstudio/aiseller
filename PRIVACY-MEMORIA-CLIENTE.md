# Nota privacy — Memoria del cliente (AI Seller)

Testo pronto da incollare nella **privacy policy** del sito, perché il chatbot ora
salva alcune informazioni sul dispositivo del visitatore (localStorage) per
riconoscerlo e personalizzare i consigli.

**Niente da configurare lato server**: i dati restano nel browser del cliente, non
vengono inviati da nessuna parte. Il cliente può cancellarli in qualsiasi momento
con il pulsante **"Non sono io"** nella chat, o svuotando i dati del browser.

---

## 🇪🇸 Español (testo principale per Las Palmas)

### Asistente y personalización

Nuestro asistente de chat guarda algunos datos **en tu propio dispositivo**
(almacenamiento local del navegador, *localStorage*) para reconocerte cuando
vuelves y personalizar sus recomendaciones. En concreto puede guardar: tu **nombre**,
el **idioma** preferido, los **productos** que has visto, añadido o pedido, y el
**número de visitas**.

Estos datos **no se envían a ningún servidor** ni se comparten con terceros:
permanecen únicamente en tu navegador. Puedes borrarlos cuando quieras pulsando
**"No soy yo"** en el chat o eliminando los datos de navegación. La personalización
es opcional y no es necesaria para comprar.

---

## 🇮🇹 Italiano

### Assistente e personalizzazione

Il nostro assistente di chat salva alcuni dati **sul tuo dispositivo**
(memoria locale del browser, *localStorage*) per riconoscerti quando torni e
personalizzare i suoi consigli. In particolare può memorizzare: il tuo **nome**,
la **lingua** preferita, i **prodotti** che hai visto, aggiunto o ordinato e il
**numero di visite**.

Questi dati **non vengono inviati a nessun server** né condivisi con terzi:
restano solo nel tuo browser. Puoi cancellarli quando vuoi premendo **"Non sono io"**
nella chat o svuotando i dati di navigazione. La personalizzazione è facoltativa
e non è necessaria per acquistare.

---

## 🇬🇧 English

### Assistant & personalization

Our chat assistant stores some data **on your own device** (your browser's local
storage, *localStorage*) to recognize you when you return and personalize its
recommendations. Specifically it may store: your **name**, preferred **language**,
the **products** you have viewed, added or ordered, and your **number of visits**.

This data **is never sent to any server** and is not shared with third parties — it
stays only in your browser. You can delete it at any time by tapping **"Not me"** in
the chat or by clearing your browsing data. Personalization is optional and not
required to make a purchase.

---

## Versione breve (banner cookie / riga unica)

- **ES:** Este sitio usa el almacenamiento local del navegador para que el asistente
  recuerde tu nombre y tus preferencias. No se envía nada a servidores externos.
- **IT:** Questo sito usa la memoria locale del browser perché l'assistente ricordi
  il tuo nome e le tue preferenze. Niente viene inviato a server esterni.
- **EN:** This site uses your browser's local storage so the assistant can remember
  your name and preferences. Nothing is sent to external servers.

---

### Note tecniche (per chi gestisce il sito)
- Chiave salvata: `aiseller_mem_<brand>` (es. `aiseller_mem_il_raviolo_bottega`).
- Disattivabile del tutto con `remember: false` nella config del cliente.
- È *localStorage di prima parte*, non un cookie di tracciamento di terze parti:
  nessun trasferimento dati, nessuna finalità pubblicitaria.

Made in Italy 🇮🇹
