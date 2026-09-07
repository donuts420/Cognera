import { speak as speakAsset, stopSpeaking } from '../lib/speech.js';

// Narrate a plain sentence. Tries a recorded clip by key first (handled in
// lib/speech), then falls back to the browser voice. Safe to call when the
// device has no speech support at all.
export function narrate(text, locale = 'en') {
  if (!text) return;
  if ('speechSynthesis' in window) {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = locale === 'as' ? 'bn-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN';
      u.rate = 0.92;
      speechSynthesis.speak(u);
      return;
    } catch {}
  }
  speakAsset(text, locale);
}

export { stopSpeaking };
