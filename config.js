/* ============================================================
   KAYAMAN'S FARM — CONFIGURAZIONE CHATBOT
   ============================================================
   La demo funziona AL 100% senza chiave (motore intelligente a
   regole con neuromarketing). Per attivare l'AI completa di Claude,
   incolla qui una API key Anthropic e metti useClaude: true.

   ⚠️  Non esiste una API key gratuita: Claude API è a consumo
       (https://console.anthropic.com). Per la demo lascia pure
       useClaude: false — il budtender funziona comunque benissimo.

   ⚠️  Sicurezza: in una demo la chiave nel browser è esposta.
       In produzione va messa dietro un piccolo backend/proxy.
   ============================================================ */
window.KF_CONFIG = {
  useClaude: false,                 // metti true quando hai una chiave
  apiKey: "",                       // "sk-ant-..."
  model: "claude-opus-4-8",
  // Comportamento re-engagement "spietato"
  idleSeconds: 18,                  // secondi di inattività prima del nudge
  minimizedNudgeSeconds: 12,        // secondi dopo il minimize prima del segnale
  exitIntentEnabled: false,         // popup "Aspetta!" disattivato
  vibrate: true,                    // navigator.vibrate su mobile
  sound: true                       // micro-beep WebAudio
};
