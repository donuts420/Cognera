// Culturally-grounded placeholder assets for the Cognera game collection.
//
// The production build swaps these for the commissioned NER asset pack in
// public/images/ner (see DOCUMENTATION.md section 5). Until then we use large,
// instantly-recognisable emoji so the games stay fully offline and the
// recognition mechanic still works on a cheap tablet with no network.

export const NER_OBJECTS = [
  { key: 'gamosa', glyph: '🧣', label: { en: 'Gamosa', as: 'গামোছা', hi: 'गमोसा' } },
  { key: 'japi', glyph: '👒', label: { en: 'Japi', as: 'জাপি', hi: 'जापी' } },
  { key: 'dhol', glyph: '🥁', label: { en: 'Dhol', as: 'ঢোল', hi: 'ढोल' } },
  { key: 'hornbill', glyph: '🦜', label: { en: 'Hornbill', as: 'ধনেশ', hi: 'धनेश' } },
  { key: 'rhino', glyph: '🦏', label: { en: 'Rhino', as: 'গঁড়', hi: 'गैंडा' } },
  { key: 'bamboo', glyph: '🎋', label: { en: 'Bamboo', as: 'বাঁহ', hi: 'बाँस' } },
  { key: 'orange', glyph: '🍊', label: { en: 'Orange', as: 'কমলা', hi: 'संतरा' } },
  { key: 'tea', glyph: '🍵', label: { en: 'Tea', as: 'চাহ', hi: 'चाय' } },
  { key: 'fish', glyph: '🐟', label: { en: 'Fish', as: 'মাছ', hi: 'मछली' } },
  { key: 'boat', glyph: '🛶', label: { en: 'Boat', as: 'নাও', hi: 'नाव' } },
  { key: 'rice', glyph: '🍚', label: { en: 'Rice', as: 'ভাত', hi: 'चावल' } },
  { key: 'flower', glyph: '🌺', label: { en: 'Flower', as: 'ফুল', hi: 'फूल' } },
  { key: 'coconut', glyph: '🥥', label: { en: 'Coconut', as: 'নাৰিকল', hi: 'नारियल' } },
  { key: 'banana', glyph: '🍌', label: { en: 'Banana', as: 'কল', hi: 'केला' } },
  { key: 'elephant', glyph: '🐘', label: { en: 'Elephant', as: 'হাতী', hi: 'हाथी' } },
  { key: 'lamp', glyph: '🪔', label: { en: 'Lamp', as: 'চাকি', hi: 'दीया' } },
  { key: 'umbrella', glyph: '☂️', label: { en: 'Umbrella', as: 'ছাতি', hi: 'छाता' } },
  { key: 'basket', glyph: '🧺', label: { en: 'Basket', as: 'পাচি', hi: 'टोकरी' } },
];

export const CATEGORIES = {
  fruit: {
    label: { en: 'Fruits', as: 'ফল', hi: 'फल' },
    items: ['🍊', '🍌', '🥭', '🍎', '🍇', '🍈', '🍐'],
  },
  instrument: {
    label: { en: 'Instruments', as: 'বাদ্যযন্ত্ৰ', hi: 'वाद्ययंत्र' },
    items: ['🥁', '🎻', '🪕', '🎺', '🪈', '🎷'],
  },
  animal: {
    label: { en: 'Animals', as: 'জন্তু', hi: 'जानवर' },
    items: ['🦏', '🐘', '🐟', '🦜', '🐄', '🐐', '🐈'],
  },
  household: {
    label: { en: 'Household things', as: 'ঘৰুৱা বস্তু', hi: 'घरेलू सामान' },
    items: ['🪔', '🧺', '☂️', '🍵', '🪥', '🥄'],
  },
  vehicle: {
    label: { en: 'Vehicles', as: 'বাহন', hi: 'वाहन' },
    items: ['🛶', '🚲', '🚌', '🛺', '🚜'],
  },
  plant: {
    label: { en: 'Plants', as: 'গছ-গছনি', hi: 'पौधे' },
    items: ['🎋', '🌺', '🌴', '🌾', '🌻', '🍃'],
  },
  clothing: {
    label: { en: 'Clothing', as: 'কাপোৰ', hi: 'कपड़े' },
    items: ['🧣', '👒', '👗', '🧦', '👚'],
  },
};

export const SEQUENCE_PADS = [
  { key: 'green', color: '#6B8E23', label: { en: 'Green', as: 'সেউজীয়া', hi: 'हरा' }, tone: 330 },
  { key: 'amber', color: '#C97A1E', label: { en: 'Amber', as: 'হালধীয়া', hi: 'पीला' }, tone: 392 },
  { key: 'teal', color: '#0F6E6E', label: { en: 'Teal', as: 'নীলা', hi: 'नीला' }, tone: 262 },
  { key: 'clay', color: '#AD4222', label: { en: 'Red', as: 'ৰঙা', hi: 'लाल' }, tone: 220 },
];

// Simple daily routines (culturally local, emotionally neutral).
export const ROUTINES = [
  {
    key: 'morning',
    label: { en: 'Morning', as: 'ৰাতিপুৱা', hi: 'सुबह' },
    steps: [
      { glyph: '🌅', label: { en: 'Wake up', as: 'সাৰ পোৱা', hi: 'उठना' } },
      { glyph: '🪥', label: { en: 'Brush teeth', as: 'দাঁত ব্ৰাছ কৰা', hi: 'दाँत साफ़ करना' } },
      { glyph: '🛁', label: { en: 'Take a bath', as: 'গা ধোৱা', hi: 'नहाना' } },
      { glyph: '🍵', label: { en: 'Drink tea', as: 'চাহ খোৱা', hi: 'चाय पीना' } },
      { glyph: '🍚', label: { en: 'Eat breakfast', as: 'জলপান খোৱা', hi: 'नाश्ता करना' } },
      { glyph: '💊', label: { en: 'Take medicine', as: 'ঔষধ খোৱা', hi: 'दवा लेना' } },
      { glyph: '🪔', label: { en: 'Light the lamp', as: 'চাকি জ্বলোৱা', hi: 'दीया जलाना' } },
      { glyph: '🚶', label: { en: 'Go for a walk', as: 'খোজ কঢ়া', hi: 'टहलने जाना' } },
    ],
  },
  {
    key: 'meal',
    label: { en: 'Cooking rice', as: 'ভাত ৰন্ধা', hi: 'चावल पकाना' },
    steps: [
      { glyph: '🧺', label: { en: 'Bring the rice', as: 'চাউল অনা', hi: 'चावल लाना' } },
      { glyph: '💧', label: { en: 'Wash the rice', as: 'চাউল ধোৱা', hi: 'चावल धोना' } },
      { glyph: '🍲', label: { en: 'Put it in the pot', as: 'পাত্ৰত দিয়া', hi: 'बर्तन में डालना' } },
      { glyph: '🔥', label: { en: 'Cook on the fire', as: 'জুইত সিজোৱা', hi: 'आग पर पकाना' } },
      { glyph: '🍚', label: { en: 'Serve the rice', as: 'ভাত বাঢ়া', hi: 'चावल परोसना' } },
      { glyph: '🍽️', label: { en: 'Eat together', as: 'একেলগে খোৱা', hi: 'साथ खाना' } },
    ],
  },
];

// Short, positive picture stories.
export const STORIES = [
  {
    key: 'market',
    label: { en: 'A trip to the market', as: 'বজাৰলৈ যোৱা', hi: 'बाज़ार की सैर' },
    panels: [
      { glyph: '🚶‍♀️', label: { en: 'She walks to the market', as: 'তেওঁ বজাৰলৈ যায়', hi: 'वह बाज़ार जाती है' } },
      { glyph: '🥬', label: { en: 'She buys vegetables', as: 'তেওঁ শাক-পাচলি কিনে', hi: 'वह सब्ज़ी खरीदती है' } },
      { glyph: '🏡', label: { en: 'She comes back home', as: 'তেওঁ ঘৰলৈ উভতি আহে', hi: 'वह घर लौटती है' } },
      { glyph: '🍲', label: { en: 'She cooks a meal', as: 'তেওঁ ৰন্ধা-বঢ়া কৰে', hi: 'वह खाना बनाती है' } },
      { glyph: '😊', label: { en: 'The family eats happily', as: 'পৰিয়ালে সুখেৰে খায়', hi: 'परिवार खुशी से खाता है' } },
    ],
  },
  {
    key: 'garden',
    label: { en: 'Growing a plant', as: 'গছ ৰোৱা', hi: 'पौधा उगाना' },
    panels: [
      { glyph: '🌱', label: { en: 'He plants a seed', as: 'তেওঁ বীজ ৰোৱে', hi: 'वह बीज बोता है' } },
      { glyph: '💧', label: { en: 'He waters it', as: 'তেওঁ পানী দিয়ে', hi: 'वह पानी देता है' } },
      { glyph: '🌿', label: { en: 'A small plant grows', as: 'সৰু গছ ওলায়', hi: 'छोटा पौधा उगता है' } },
      { glyph: '🌳', label: { en: 'It becomes a big tree', as: 'ডাঙৰ গছ হয়', hi: 'बड़ा पेड़ बनता है' } },
      { glyph: '🍎', label: { en: 'It gives fruit', as: 'ফল ধৰে', hi: 'फल देता है' } },
    ],
  },
];

// Familiar words for the recognition-memory game.
export const FAMILIAR_WORDS = {
  en: ['River', 'Lamp', 'Rice', 'Mother', 'Garden', 'Song', 'Boat', 'Rain', 'Market', 'Tea', 'Cow', 'Door', 'Moon', 'Fire', 'Flower', 'Bird'],
  as: ['নৈ', 'চাকি', 'ভাত', 'মা', 'বাৰী', 'গান', 'নাও', 'বৰষুণ', 'বজাৰ', 'চাহ', 'গৰু', 'দুৱাৰ', 'জোন', 'জুই', 'ফুল', 'চৰাই'],
  hi: ['नदी', 'दीया', 'चावल', 'माँ', 'बगीचा', 'गीत', 'नाव', 'बारिश', 'बाज़ार', 'चाय', 'गाय', 'दरवाज़ा', 'चाँद', 'आग', 'फूल', 'पंछी'],
};

// "Sounds" for Sound Recognition — described + beeped, never audio-only.
export const SOUNDS = [
  { key: 'dhol', glyph: '🥁', pattern: [180, 90, 180, 90, 360], freq: 150, label: { en: 'A drum', as: 'ঢোল', hi: 'ढोल' } },
  { key: 'bird', glyph: '🐦', pattern: [80, 60, 80, 60, 80], freq: 900, label: { en: 'A bird call', as: 'চৰাইৰ মাত', hi: 'पंछी की बोली' } },
  { key: 'bell', glyph: '🔔', pattern: [400, 200, 400], freq: 660, label: { en: 'A temple bell', as: 'ঘণ্টা', hi: 'घंटी' } },
  { key: 'flute', glyph: '🪈', pattern: [500, 120, 700], freq: 520, label: { en: 'A flute', as: 'বাঁহী', hi: 'बाँसुरी' } },
  { key: 'water', glyph: '💧', pattern: [60, 40, 60, 40, 60, 40, 60], freq: 300, label: { en: 'Running water', as: 'বৈ থকা পানী', hi: 'बहता पानी' } },
  { key: 'clock', glyph: '⏰', pattern: [70, 300, 70, 300, 70], freq: 440, label: { en: 'A ringing clock', as: 'ঘড়ীৰ শব্দ', hi: 'घड़ी की घंटी' } },
];

export function pick(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

export function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function label(obj, locale) {
  if (!obj) return '';
  return obj[locale] || obj.en || '';
}
