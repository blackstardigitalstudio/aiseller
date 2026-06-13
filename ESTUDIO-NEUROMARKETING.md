# Estudio de neuromarketing + marketing de sector — el "cerebro" del motor

Base científica que guía qué, cómo y cuándo publica el motor. Pensado para comida artesanal italiana en Instagram/Facebook (Il Raviolo Bottega · Las Palmas), pero **reutilizable**: los principios valen para cualquier cliente del motor.

*Made in Italy — Blackstar Digital Studio*

---

## 1. Principios de neuromarketing aplicados a comida (y cómo los aplica el motor)

| Principio (por qué funciona en el cerebro) | Cómo lo aplica el motor |
|---|---|
| **Apetito visual / "food porn"**: el cerebro reacciona a textura, primer plano, vapor, "recién hecho" → activa salivación y deseo. | Imagen **inmersiva a pantalla completa** de la foto del producto (ya implementado). |
| **Anclaje de precio + unidad**: ver el precio con su unidad (/kg, /ud, /100g) da referencia y reduce la fricción de "¿cuánto será?". | Precio grande + **unidad real** sacada del catálogo (ya implementado). |
| **Escasez / urgencia** ("hecho hoy", "hasta agotar", "solo el finde"): el miedo a perderlo acelera la decisión. | Frases tipo "recién hecho" en las captions; pilar "Plan de finde". |
| **Prueba social**: reseñas y clientes reales reducen el riesgo percibido. | Pilar UGC/reseñas (recomendado en el plan 12 meses). |
| **Reciprocidad**: dar valor (receta, truco) crea deuda social → compra. | Pilar educativo ("cómo se prepara…", maridajes). |
| **Una sola CTA**: el cerebro evita decisiones múltiples. Un solo camino = más conversión. | **CTA único**: "Pídelo por WhatsApp" en cada pieza. |
| **Color**: azul navy = confianza/premium; oro = calidad/calidez/apetito. | Paleta de marca navy+oro (config `brand.colors`). |
| **Regla pico-final + simplicidad**: se recuerda el momento más intenso y el final. Diseño limpio, jerarquía clara. | Tipografía fuerte, jerarquía categoría→nombre→precio, footer constante. |

---

## 2. ¿Cuándo publicar? (el "momento justo")
Horarios **best-practice** para food/local (a validar con TUS datos vía los reportes — ver §4). Zona Canarias (WET/WEST).

| Contenido | Mejor franja | Por qué |
|---|---|---|
| **Stories** | **08:00–10:00** y **14:00–16:00** | Despertar (¿qué desayuno/almuerzo?) y media tarde (antojo / planificar cena). |
| **Post (feed)** | **13:00–14:00** y **20:00–21:30** | Pausa de comida y noche (se decide la cena / compra de mañana). |
| **Reels** | **tardes/noche (19:00–22:00)** | Mayor consumo de vídeo y alcance. |
| **Días fuertes** | **jueves a domingo** | Planificación de finde y comidas sociales. |

→ Codificado en `clients/raviolo.config.json` → `schedule` (story/post/reel). El motor publica cada formato en su franja.

---

## 3. Fórmulas de copy y hashtags (psicología del lenguaje)
- **Estructura**: Hook sensorial (1ª línea) → deseo/beneficio → **CTA WhatsApp**. Corto, concreto, con 1–2 emojis.
- **Palabras que activan**: "recién hecho", "artesanal", "hoy", "de verdad", "como en Italia".
- **Hashtags (8–15, en rotación)**: marca (#IlRavioloBottega) + local (#LasPalmas #GranCanaria) + nicho (producto) + generales. Rotación diaria para no ser penalizado por bloques idénticos. (Ya implementado.)

---

## 4. Reportes para decidir con datos (no opiniones)
El neuromarketing da la **hipótesis**; tus números dan la **verdad**. Por eso el sistema tendrá:
- **Reporte diario**: qué se publicó (formato, producto, hora) y, cuando conectemos métricas, alcance/guardados/mensajes.
- **Reporte mensual**: tendencia, mejores horas/días/productos reales → el motor ajusta la semana siguiente.
- *Verdad honesta*: las métricas reales de IG necesitan conectar **Metricool (gratis)** o permiso de insights. Hasta entonces el reporte registra la **actividad** (lo publicado) y queda listo para recibir los números.

---

## 5. Mapa: principio → dónde vive en el motor
- Apetito visual + jerarquía → `scripts/lib/story-image.mjs` (estilo inmersivo).
- Precio+unidad, escasez, CTA, hashtags → `scripts/daily-stories.mjs` + `weekly-plan.mjs` + config.
- Momento justo → config `schedule` + crons de los workflows.
- Pilares (educación, finde, UGC) → config `pillars`.
- Datos → reportes (próximo) + Metricool.

Este documento es la **guía** que el motor ejecuta: por eso "sabe lo que hace".
