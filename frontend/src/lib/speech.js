const preloadedCache = {};

export async function speak(key, locale = 'en') {
  const mp3Path = `/audio/${locale}/${key}.mp3`;
  if (preloadedCache[mp3Path]) {
    preloadedCache[mp3Path].currentTime = 0;
    preloadedCache[mp3Path].play().catch(() => {});
    return;
  }
  try {
    const audio = new Audio(mp3Path);
    preloadedCache[mp3Path] = audio;
    await audio.play();
    return;
  } catch {}
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(key);
    utterance.lang = locale === 'as' ? 'bn-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN';
    speechSynthesis.speak(utterance);
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

export function listen(onResult, locale = 'en') {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = locale === 'as' ? 'bn-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    onResult(transcript);
  };
  return recognition;
}
