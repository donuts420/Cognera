import React from 'react';

/*
  Cognera icon set — inline SVG, no emoji anywhere in the product.
  Every icon draws on a 24×24 grid and inherits `currentColor`.
  UI icons are stroked (1.75); object / pictograph icons mix stroke + fill
  so the recognition games stay legible at large sizes.
*/

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' };
const F = { fill: 'currentColor', stroke: 'none' };

const ICONS = {
  // ── arrows / chevrons ──────────────────────────────────────────
  'arrow-left': <path {...S} d="M15 5l-7 7 7 7M8 12h11" />,
  'arrow-right': <path {...S} d="M9 5l7 7-7 7M16 12H5" />,
  'arrow-up': <path {...S} d="M5 15l7-7 7 7M12 8v11" />,
  'arrow-down': <path {...S} d="M5 9l7 7 7-7M12 16V5" />,
  'chevron-right': <path {...S} d="M9 5l7 7-7 7" />,
  'chevron-left': <path {...S} d="M15 5l-7 7 7 7" />,

  // ── controls ───────────────────────────────────────────────────
  check: <path {...S} d="M5 13l4 4L19 7" />,
  close: <path {...S} d="M6 6l12 12M18 6L6 18" />,
  pause: <g {...S}><line x1="9" y1="5" x2="9" y2="19" /><line x1="15" y1="5" x2="15" y2="19" /></g>,
  play: <path {...F} d="M8 5v14l11-7z" />,
  replay: <path {...S} d="M4 12a8 8 0 108-8M4 12V6M4 12h6" />,
  question: <path {...S} d="M9 9a3 3 0 114 2.8c-.9.5-1.5 1.2-1.5 2.2M12 17.5h.01" />,
  bulb: <g><path {...S} d="M9 18h6M10 21h4" /><path {...S} d="M12 3a6 6 0 00-4 10.5c.7.6 1 1.3 1 2.5h6c0-1.2.3-1.9 1-2.5A6 6 0 0012 3z" /></g>,
  'sound-on': <g {...S}><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16 9a3 3 0 010 6M18.5 7a6 6 0 010 10" /></g>,
  'sound-off': <g {...S}><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16 10l4 4M20 10l-4 4" /></g>,
  heart: <path {...S} d="M12 20s-7-4.4-9.2-8.4C1 8.5 2.5 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.5 0 5 3.5 3.2 6.6C19 15.6 12 20 12 20z" />,
  'heart-fill': <path {...F} d="M12 20s-7-4.4-9.2-8.4C1 8.5 2.5 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.5 0 5 3.5 3.2 6.6C19 15.6 12 20 12 20z" />,
  plus: <path {...S} d="M12 6v12M6 12h12" />,
  minus: <path {...S} d="M6 12h12" />,
  'thumb-up': <path {...S} d="M7 11v9H4v-9h3zm0 0l4-7c1.3 0 2 .9 2 2v3h4.5c1.2 0 2 1 1.7 2.2l-1.5 6c-.2 1-1 1.6-2 1.6H7" />,
  wave: <path {...S} d="M6 12l1.5-1.5M8 8.5L14 3M10.5 11l6-6M13.5 13.5l4.5-4.5M8 8.5c-2 2-2 6 1 9s7 3 9 1l3-3" />,
  lock: <g {...S}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></g>,

  // ── nav ────────────────────────────────────────────────────────
  home: <path {...S} d="M4 11l8-7 8 7M6 10v9h4v-5h4v5h4v-9" />,
  grid: <g {...S}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></g>,
  sun: <g {...S}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.5 1.5M17 17l1.5 1.5M18.5 5.5L17 7M7 17l-1.5 1.5" /></g>,
  user: <g {...S}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5" /></g>,
  stethoscope: <g {...S}><path d="M6 4v5a4 4 0 008 0V4M6 4H4M6 4h1M12 17a4 4 0 004-4" /><circle cx="17.5" cy="10.5" r="2" /></g>,
  calendar: <g {...S}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 9h16M8 3v4M16 3v4" /></g>,
  medal: <g {...S}><circle cx="12" cy="14" r="5" /><path d="M9 9L6 3M15 9l3-6M10.5 5.5L9 3h6l-1.5 2.5" /></g>,
  trophy: <g {...S}><path d="M8 4h8v5a4 4 0 01-8 0V4z" /><path d="M8 6H5v2a3 3 0 003 3M16 6h3v2a3 3 0 01-3 3M10 15h4M9 20h6M12 17v3" /></g>,
  compass: <g {...S}><circle cx="12" cy="12" r="8" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></g>,
  map: <path {...S} d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2zM9 4v14M15 6v14" />,
  hundred: <g {...S}><path d="M4 8v8M4 8h2v8M9 8h4v8H9zM9 12h4" /><path d="M17 8h4v8h-4zM17 12h4" /></g>,
  target: <g {...S}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" {...F} /></g>,
  dice: <g {...S}><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r="0.8" {...F} /><circle cx="15" cy="15" r="0.8" {...F} /><circle cx="12" cy="12" r="0.8" {...F} /></g>,
  sparkle: <path {...F} d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  sprout: <g {...S}><path d="M12 21v-8" /><path d="M12 13c0-3-2-5-5-5-0 3 2 5 5 5zM12 11c0-3 2-4.5 4.5-4.5 0 3-1.5 4.5-4.5 4.5z" /></g>,
  leaf: <path {...S} d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19c3-6 6-9 11-11" />,
  cup: <g {...S}><path d="M5 8h12v6a4 4 0 01-4 4H9a4 4 0 01-4-4V8z" /><path d="M17 9h1.5a2.5 2.5 0 010 5H17M8 3c0 1-1 1.5-1 2.5M12 3c0 1-1 1.5-1 2.5" /></g>,

  // ── game tiles ─────────────────────────────────────────────────
  brain: <path {...S} d="M9 6a3 3 0 00-3 3 3 3 0 00-1 5 3 3 0 003 4h1V6H9zM15 6a3 3 0 013 3 3 3 0 011 5 3 3 0 01-3 4h-1V6h1zM12 6v12" />,
  cards: <g {...S}><rect x="4" y="7" width="11" height="14" rx="2" /><path d="M9 3l9 2.5-3 12" /></g>,
  'music-notes': <g {...S}><circle cx="7" cy="17" r="2.5" /><circle cx="17" cy="15" r="2.5" /><path d="M9.5 17V6l10-2.5V15" /></g>,
  calculator: <g {...S}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h4" /></g>,
  bolt: <path {...S} d="M13 3L5 14h6l-1 7 8-11h-6z" />,
  search: <g {...S}><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></g>,
  loom: <g {...S}><path d="M4 5h16M4 12h16M4 19h16" /><path d="M8 5c0 3-4 4-4 7s4 4 4 7M16 5c0 3 4 4 4 7s-4 4-4 7" /></g>,
  speech: <path {...S} d="M4 5h16v11H9l-4 4v-4H4z" />,
  sunrise: <g {...S}><path d="M3 18h18M6 18a6 6 0 0112 0M12 8V4M6 10L4.5 8.5M18 10l1.5-1.5" /></g>,
  book: <path {...S} d="M5 4h9a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM17 4h2v13M5 17h12" />,
  'clock-old': <g {...S}><circle cx="12" cy="13" r="7" /><path d="M12 9.5V13l2.5 2M8 4L5 6M16 4l3 2M9 21h6" /></g>,

  // ── shapes (Pattern Complete) ──────────────────────────────────
  'shape-triangle': <path fill="var(--accent)" stroke="none" d="M12 4l9 16H3z" />,
  'shape-square': <rect x="4" y="4" width="16" height="16" rx="2" fill="var(--info)" stroke="none" />,
  'shape-circle': <circle cx="12" cy="12" r="9" fill="var(--success)" stroke="none" />,
  'shape-diamond': <path fill="var(--caution)" stroke="none" d="M12 3l9 9-9 9-9-9z" />,
  'shape-slab': <rect x="4" y="4" width="16" height="16" rx="2" fill="var(--brand-ink)" stroke="none" />,
  'shape-star': <path fill="var(--accent)" stroke="none" d="M12 3l2.6 6.3L21 10l-5 4.3L17.5 21 12 17.2 6.5 21 8 14.3 3 10l6.4-.7z" />,
  'shape-ring': <circle cx="12" cy="12" r="7.5" fill="none" stroke="var(--brand-subtle-ink)" strokeWidth="4" />,

  // ── sounds ─────────────────────────────────────────────────────
  drum: <g {...S}><ellipse cx="12" cy="8" rx="7" ry="3" /><path d="M5 8v6c0 1.7 3.1 3 7 3s7-1.3 7-3V8" /><path d="M5 10l14 4M19 10L5 14" /></g>,
  bird: <path {...S} d="M4 14c4 0 6-2 6-6 2 3 5 3 8 1-1 4-4 7-8 7-3 0-5 1-6 3M10 8L7 6" />,
  bell: <g {...S}><path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" /><path d="M10 20a2 2 0 004 0" /></g>,
  flute: <g {...S}><path d="M4 15L18 5c1 .8 1.5 2 1 3L6 18z" /><circle cx="9" cy="12" r="0.6" {...F} /><circle cx="12" cy="10" r="0.6" {...F} /><circle cx="15" cy="8" r="0.6" {...F} /></g>,
  'water-drop': <path {...S} d="M12 4c3 4 6 7 6 10a6 6 0 01-12 0c0-3 3-6 6-10z" />,
  alarm: <g {...S}><circle cx="12" cy="13" r="7" /><path d="M12 10v3l2 2M5 5L2.5 7.5M19 5l2.5 2.5M6 21l-1.5 1.5M18 21l1.5 1.5" /></g>,

  // ── NER objects ────────────────────────────────────────────────
  gamosa: <g {...S}><rect x="6" y="4" width="12" height="16" rx="1" /><path d="M6 8h12M6 16h12M9 4v16M15 4v16" /></g>,
  japi: <g {...S}><path d="M3 17h18L12 5z" /><path d="M7 17c0 2 2.2 3 5 3s5-1 5-3" /><path d="M12 5v-1" /></g>,
  hornbill: <path {...S} d="M6 15c3 0 5-2 5-6 2 2 4 2 6 0v3l3-1-3 4c-1 2-4 4-7 4-2 0-4 1-5 2M11 9L3 8l4 3" />,
  rhino: <g {...S}><path d="M4 16c0-3 2-6 6-6h4c3 0 5 2 5 5v3h-3v-2H8v2H5z" /><path d="M18 10l3-2-1 3M9 10V7" /></g>,
  bamboo: <g {...S}><path d="M10 21V3M14 21V3" /><path d="M10 8h4M10 13h4M10 18h4M14 6c2-1 4 0 5 2M10 11c-2 1-4 0-5-2" /></g>,
  orange: <g {...S}><circle cx="12" cy="13" r="7" /><path d="M12 6c0-2 1.5-3 3.5-3M12 13v0" /></g>,
  tea: <g {...S}><path d="M5 10h11v5a4 4 0 01-4 4H9a4 4 0 01-4-4v-5z" /><path d="M16 11h1.5a2.5 2.5 0 010 5H16M9 4c0 1.5-1 2-1 3.5M12 4c0 1.5-1 2-1 3.5" /></g>,
  fish: <path {...S} d="M3 12c3-4 8-5 12-3 2 1 4 3 6 3-2 0-4 2-6 3-4 2-9 1-12-3zM19 12h.01M3 12l-1 3M3 12l-1-3" />,
  boat: <g {...S}><path d="M3 14h18l-2 5H5z" /><path d="M12 14V4l6 6" /></g>,
  rice: <g {...S}><path d="M4 12h16a8 8 0 01-16 0z" /><path d="M8 9c0-1 .5-2 1-3M12 8c0-1 .5-2 1-3M16 9c0-1 .5-2 1-3M3 21h18" /></g>,
  flower: <g {...S}><circle cx="12" cy="10" r="2.5" /><path d="M12 7.5c1-2 4-2 4 .5s-3 3.5-4 2M12 12.5c-1 2-4 2-4-.5s3-3.5 4-2M14.5 10c2-1 4 1 2 3s-4 0-4-1M9.5 10c-2-1-4 1-2 3s4 0 4-1M12 21v-8" /></g>,
  coconut: <g {...S}><circle cx="12" cy="13" r="7" /><path d="M9 11h.01M15 11h.01M12 14h.01" /></g>,
  banana: <path {...S} d="M6 6c0 8 4 12 12 12 0-1-1-2-2-2 3-1 4-4 3-5-2 2-9 1-11-5 0 0-1-1-2 0z" />,
  elephant: <path {...S} d="M4 18v-4a6 6 0 016-6h3a5 5 0 015 5v5h-3v-3M7 18v-2M13 18v-3M13 10c1-1 3-1 4 0M9 8V6" />,
  lamp: <g {...S}><path d="M4 15c0-1 3-2 8-2s8 1 8 2-3 2-8 2-8-1-8-2z" /><path d="M12 13c0-2-4-2-4-2M12 6c0 2 1.5 2.5 1.5 4" /><path d="M14 6c0-1.5 2-1.5 2 0s-2 2-2 0z" fill="var(--accent)" stroke="none" /></g>,
  umbrella: <g {...S}><path d="M3 12a9 9 0 0118 0zM12 3v0M12 12v6a2 2 0 004 0" /></g>,
  basket: <g {...S}><path d="M4 9h16l-1.5 10H5.5zM4 9l3-4M20 9l-3-4M9 12v4M15 12v4M12 12v4" /></g>,

  // ── extra category items ───────────────────────────────────────
  mango: <path {...S} d="M15 6c3 2 4 6 2 9s-8 4-10 1S8 4 15 6zM13 6l2-2" />,
  apple: <g {...S}><path d="M12 8c-2-2-6-1-6 3s3 8 6 8 6-4 6-8-4-5-6-3z" /><path d="M12 8V5c0-1 1-2 2-2" /></g>,
  grapes: <g {...S}><circle cx="9" cy="12" r="2" /><circle cx="13" cy="12" r="2" /><circle cx="11" cy="16" r="2" /><path d="M11 8V4M11 4c2 0 3-1 3-1" /></g>,
  melon: <g {...S}><circle cx="12" cy="12" r="8" /><path d="M8 5c1 3 1 11 0 14M12 4v16M16 5c-1 3-1 11 0 14" /></g>,
  pear: <path {...S} d="M12 9c-3 0-5 3-5 6s2 6 5 6 5-3 5-6-2-5-4-6c0-2 1-3 2-4" />,
  violin: <g {...S}><path d="M9 20c-2 0-3-2-2-4l1-2c-2-1-2-4 0-5s5 0 6 2l1-2c1-2 4-2 4 1s-3 4-3 4l-4 6c-1 1.5-2 2-3 2z" /><path d="M17 4l2 2" /></g>,
  banjo: <g {...S}><circle cx="9" cy="15" r="5" /><path d="M12.5 11.5l7-7M18 3l3 3-2 2" /></g>,
  trumpet: <g {...S}><path d="M3 12h9l6-4v8l-6-4M3 10v4M18 8l3-1v10l-3-1" /></g>,
  sax: <path {...S} d="M13 3v9a5 5 0 01-5 5c-3 0-4-3-2-5M13 3h2M8 21h4M8 21v-2" />,
  cow: <path {...S} d="M4 10c0-2 2-3 3-1M20 10c0-2-2-3-3-1M6 9c1 4 3 6 6 6s5-2 6-6M9 13v4M15 13v4M9 21h6M9 8V6M15 8V6" />,
  goat: <path {...S} d="M6 8c-1-3 0-5 0-5M18 8c1-3 0-5 0-5M6 8c1 4 3 6 6 6s5-2 6-6M10 14v4M14 14v4M9 21h6M12 14v-2" />,
  cat: <path {...S} d="M5 8L4 4l4 2M19 8l1-4-4 2M6 8c0 5 3 9 6 9s6-4 6-9M12 21v-4M9 12h.01M15 12h.01" />,
  toothbrush: <g {...S}><path d="M6 18l7-7M13 11l3-3c1-1 3-1 4 0s1 3 0 4l-3 3z" /><path d="M4 20l3-3M4 17l2 2M6 15l2 2" /></g>,
  spoon: <g {...S}><path d="M12 13v8" /><ellipse cx="12" cy="8" rx="3.5" ry="5" /></g>,
  bicycle: <g {...S}><circle cx="6" cy="16" r="3.5" /><circle cx="18" cy="16" r="3.5" /><path d="M6 16l4-7h5l3 7M10 9l-1-3H7M15 9l-2 7" /></g>,
  bus: <g {...S}><rect x="3" y="6" width="18" height="11" rx="2" /><path d="M3 12h18M8 6v6M14 6v6" /><circle cx="7" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></g>,
  auto: <g {...S}><path d="M4 15V11a5 5 0 015-5h3l4 5h2v4M4 15h15" /><circle cx="7" cy="17" r="1.5" /><circle cx="16" cy="17" r="1.5" /></g>,
  tractor: <g {...S}><circle cx="8" cy="16" r="4" /><circle cx="18" cy="17" r="2.5" /><path d="M8 12V8h4l2 4h4v3M4 10h4" /></g>,
  palm: <path {...S} d="M12 21v-9M12 12c-4-4-8-3-9-2 3-3 7-2 9 0M12 12c4-4 8-3 9-2-3-3-7-2-9 0M12 12c0-4-2-7-3-8 3 1 4 4 3 8" />,
  sunflower: <g {...S}><circle cx="12" cy="10" r="3" /><path d="M12 3v3M12 14v3M5 10h3M16 10h3M7 5l2 2M17 5l-2 2M7 15l2-2M17 15l-2-2M12 17v4" /></g>,
  wheat: <path {...S} d="M12 21V8M12 8c-1-2-1-4 0-5 1 1 1 3 0 5zM12 11c-2-1-3-3-3-4 2 0 3 2 3 4zM12 11c2-1 3-3 3-4-2 0-3 2-3 4zM12 15c-2-1-3-3-3-4 2 0 3 2 3 4zM12 15c2-1 3-3 3-4-2 0-3 2-3 4z" />,
  sock: <path {...S} d="M9 3v9l-3 4a4 4 0 006 3l4-3-4-4V3z" />,
  dress: <path {...S} d="M9 3l3 3 3-3 1 4-2 2 3 9H7l3-9-2-2z" />,
  blouse: <path {...S} d="M8 4l-4 3 2 3 2-1v9h8v-9l2 1 2-3-4-3-2 2-2-2z" />,

  // ── routine / story pictographs ────────────────────────────────
  bath: <g {...S}><path d="M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3z" /><path d="M6 12V6a2 2 0 014 0M9 6h2M5 21l1-2M19 21l-1-2" /></g>,
  pill: <g {...S}><rect x="4" y="8" width="16" height="8" rx="4" transform="rotate(-20 12 12)" /><path d="M8.5 8.5l4 11" transform="rotate(0 12 12)" /></g>,
  'person-walk': <path {...S} d="M13 4a1.5 1.5 0 100 0M11 8l3 2 2 3M14 10l-2 5 2 5M12 15l-3 5M7 9l4-1" />,
  vegetables: <g {...S}><path d="M8 20c-3 0-5-3-4-6s5-3 6-1c1-3 5-3 6 0s0 7-4 7z" /><path d="M11 13V9c0-2-2-3-3-3M14 12c0-2 1-4 3-4" /></g>,
  pot: <g {...S}><path d="M4 10h16v4a5 5 0 01-5 5H9a5 5 0 01-5-5v-4z" /><path d="M4 10h-1M20 10h1M9 7c0-2 6-2 6 0" /></g>,
  fire: <path {...S} d="M12 21c-4 0-6-3-6-6 0-3 3-4 3-8 2 2 3 3 3 5 1-1 2-2 2-4 2 2 4 4 4 7s-2 6-6 6z" />,
  smile: <g {...S}><circle cx="12" cy="12" r="8" /><path d="M9 10h.01M15 10h.01M8 14c1 1.5 2.5 2.5 4 2.5s3-1 4-2.5" /></g>,
  seed: <path {...S} d="M12 21v-6M12 15c-3 0-5-2-5-5 3 0 5 2 5 5zM12 12c1-3 4-4 6-3-1 3-4 4-6 3z" />,
  tree: <g {...S}><path d="M12 21v-7" /><path d="M12 14a5 5 0 01-4-8 5 5 0 019-1 4 4 0 01-1 8h-4z" /></g>,
  house: <path {...S} d="M4 11l8-7 8 7M6 10v9h12v-9M10 19v-5h4v5" />,
  'plate-utensils': <g {...S}><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2.5" /><path d="M3 4v6M3 4v0M21 4v16M21 12c0-2-1.5-3-1.5-3S18 10 18 12s3 2 3 0" /></g>,
};

export default function Icon({ name, size = 24, className = '', title, style, ...rest }) {
  const glyph = ICONS[name] || ICONS.dice;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`icon icon-${name} ${className}`}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ display: 'inline-block', flex: 'none', ...style }}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {glyph}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(ICONS);
