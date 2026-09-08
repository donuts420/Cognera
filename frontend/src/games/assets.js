// Culturally-grounded assets for the Cognera game collection.
//
// Items reference names in <Icon> (src/components/Icon.jsx), inline SVG, no
// emoji anywhere. The production build can swap these for a commissioned NER
// illustration pack; the game logic only needs the `icon` + `label` fields.

export const NER_OBJECTS = [
  { key: 'gamosa', icon: 'gamosa', label: { en: 'Gamosa', as: 'গামোছা', hi: 'गमोसा' } },
  { key: 'japi', icon: 'japi', label: { en: 'Japi', as: 'জাপি', hi: 'जापी' } },
  { key: 'dhol', icon: 'drum', label: { en: 'Dhol', as: 'ঢোল', hi: 'ढोल' } },
  { key: 'hornbill', icon: 'hornbill', label: { en: 'Hornbill', as: 'ধনেশ', hi: 'धनेश' } },
  { key: 'rhino', icon: 'rhino', label: { en: 'Rhino', as: 'গঁড়', hi: 'गैंडा' } },
  { key: 'bamboo', icon: 'bamboo', label: { en: 'Bamboo', as: 'বাঁহ', hi: 'बाँस' } },
  { key: 'orange', icon: 'orange', label: { en: 'Orange', as: 'কমলা', hi: 'संतरा' } },
  { key: 'tea', icon: 'tea', label: { en: 'Tea', as: 'চাহ', hi: 'चाय' } },
  { key: 'fish', icon: 'fish', label: { en: 'Fish', as: 'মাছ', hi: 'मछली' } },
  { key: 'boat', icon: 'boat', label: { en: 'Boat', as: 'নাও', hi: 'नाव' } },
  { key: 'rice', icon: 'rice', label: { en: 'Rice', as: 'ভাত', hi: 'चावल' } },
  { key: 'flower', icon: 'flower', label: { en: 'Flower', as: 'ফুল', hi: 'फूल' } },
  { key: 'coconut', icon: 'coconut', label: { en: 'Coconut', as: 'নাৰিকল', hi: 'नारियल' } },
  { key: 'banana', icon: 'banana', label: { en: 'Banana', as: 'কল', hi: 'केला' } },
  { key: 'elephant', icon: 'elephant', label: { en: 'Elephant', as: 'হাতী', hi: 'हाथी' } },
  { key: 'lamp', icon: 'lamp', label: { en: 'Lamp', as: 'চাকি', hi: 'दीया' } },
  { key: 'umbrella', icon: 'umbrella', label: { en: 'Umbrella', as: 'ছাতি', hi: 'छाता' } },
  { key: 'basket', icon: 'basket', label: { en: 'Basket', as: 'পাচি', hi: 'टोकरी' } },
];

export const CATEGORIES = {
  fruit: {
    label: { en: 'Fruits', as: 'ফল', hi: 'फल' },
    items: ['orange', 'banana', 'mango', 'apple', 'grapes', 'melon', 'pear'],
  },
  instrument: {
    label: { en: 'Instruments', as: 'বাদ্যযন্ত্ৰ', hi: 'वाद्ययंत्र' },
    items: ['drum', 'violin', 'banjo', 'trumpet', 'flute', 'sax'],
  },
  animal: {
    label: { en: 'Animals', as: 'জন্তু', hi: 'जानवर' },
    items: ['rhino', 'elephant', 'fish', 'hornbill', 'cow', 'goat', 'cat'],
  },
  household: {
    label: { en: 'Household things', as: 'ঘৰুৱা বস্তু', hi: 'घरेलू सामान' },
    items: ['lamp', 'basket', 'umbrella', 'tea', 'toothbrush', 'spoon'],
  },
  vehicle: {
    label: { en: 'Vehicles', as: 'বাহন', hi: 'वाहन' },
    items: ['boat', 'bicycle', 'bus', 'auto', 'tractor'],
  },
  plant: {
    label: { en: 'Plants', as: 'গছ-গছনি', hi: 'पौधे' },
    items: ['bamboo', 'flower', 'palm', 'wheat', 'sunflower', 'leaf'],
  },
  clothing: {
    label: { en: 'Clothing', as: 'কাপোৰ', hi: 'कपड़े' },
    items: ['gamosa', 'japi', 'dress', 'sock', 'blouse'],
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
      { icon: 'sunrise', label: { en: 'Wake up', as: 'সাৰ পোৱা', hi: 'उठना' } },
      { icon: 'toothbrush', label: { en: 'Brush teeth', as: 'দাঁত ব্ৰাছ কৰা', hi: 'दाँत साफ़ करना' } },
      { icon: 'bath', label: { en: 'Take a bath', as: 'গা ধোৱা', hi: 'नहाना' } },
      { icon: 'tea', label: { en: 'Drink tea', as: 'চাহ খোৱা', hi: 'चाय पीना' } },
      { icon: 'rice', label: { en: 'Eat breakfast', as: 'জলপান খোৱা', hi: 'नाश्ता करना' } },
      { icon: 'pill', label: { en: 'Take medicine', as: 'ঔষধ খোৱা', hi: 'दवा लेना' } },
      { icon: 'lamp', label: { en: 'Light the lamp', as: 'চাকি জ্বলোৱা', hi: 'दीया जलाना' } },
      { icon: 'person-walk', label: { en: 'Go for a walk', as: 'খোজ কঢ়া', hi: 'टहलने जाना' } },
    ],
  },
  {
    key: 'meal',
    label: { en: 'Cooking rice', as: 'ভাত ৰন্ধা', hi: 'चावल पकाना' },
    steps: [
      { icon: 'basket', label: { en: 'Bring the rice', as: 'চাউল অনা', hi: 'चावल लाना' } },
      { icon: 'water-drop', label: { en: 'Wash the rice', as: 'চাউল ধোৱা', hi: 'चावल धोना' } },
      { icon: 'pot', label: { en: 'Put it in the pot', as: 'পাত্ৰত দিয়া', hi: 'बर्तन में डालना' } },
      { icon: 'fire', label: { en: 'Cook on the fire', as: 'জুইত সিজোৱা', hi: 'आग पर पकाना' } },
      { icon: 'rice', label: { en: 'Serve the rice', as: 'ভাত বাঢ়া', hi: 'चावल परोसना' } },
      { icon: 'plate-utensils', label: { en: 'Eat together', as: 'একেলগে খোৱা', hi: 'साथ खाना' } },
    ],
  },
];

// Short, positive picture stories.
export const STORIES = [
  {
    key: 'market',
    label: { en: 'A trip to the market', as: 'বজাৰলৈ যোৱা', hi: 'बाज़ार की सैर' },
    panels: [
      { icon: 'person-walk', label: { en: 'She walks to the market', as: 'তেওঁ বজাৰলৈ যায়', hi: 'वह बाज़ार जाती है' } },
      { icon: 'vegetables', label: { en: 'She buys vegetables', as: 'তেওঁ শাক-পাচলি কিনে', hi: 'वह सब्ज़ी खरीदती है' } },
      { icon: 'house', label: { en: 'She comes back home', as: 'তেওঁ ঘৰলৈ উভতি আহে', hi: 'वह घर लौटती है' } },
      { icon: 'pot', label: { en: 'She cooks a meal', as: 'তেওঁ ৰন্ধা-বঢ়া কৰে', hi: 'वह खाना बनाती है' } },
      { icon: 'smile', label: { en: 'The family eats happily', as: 'পৰিয়ালে সুখেৰে খায়', hi: 'परिवार खुशी से खाता है' } },
    ],
  },
  {
    key: 'garden',
    label: { en: 'Growing a plant', as: 'গছ ৰোৱা', hi: 'पौधा उगाना' },
    panels: [
      { icon: 'seed', label: { en: 'He plants a seed', as: 'তেওঁ বীজ ৰোৱে', hi: 'वह बीज बोता है' } },
      { icon: 'water-drop', label: { en: 'He waters it', as: 'তেওঁ পানী দিয়ে', hi: 'वह पानी देता है' } },
      { icon: 'sprout', label: { en: 'A small plant grows', as: 'সৰু গছ ওলায়', hi: 'छोटा पौधा उगता है' } },
      { icon: 'tree', label: { en: 'It becomes a big tree', as: 'ডাঙৰ গছ হয়', hi: 'बड़ा पेड़ बनता है' } },
      { icon: 'apple', label: { en: 'It gives fruit', as: 'ফল ধৰে', hi: 'फल देता है' } },
    ],
  },
];

// Familiar words for the recognition-memory game.
export const FAMILIAR_WORDS = {
  en: ['River', 'Lamp', 'Rice', 'Mother', 'Garden', 'Song', 'Boat', 'Rain', 'Market', 'Tea', 'Cow', 'Door', 'Moon', 'Fire', 'Flower', 'Bird'],
  as: ['নৈ', 'চাকি', 'ভাত', 'মা', 'বাৰী', 'গান', 'নাও', 'বৰষুণ', 'বজাৰ', 'চাহ', 'গৰু', 'দুৱাৰ', 'জোন', 'জুই', 'ফুল', 'চৰাই'],
  hi: ['नदी', 'दीया', 'चावल', 'माँ', 'बगीचा', 'गीत', 'नाव', 'बारिश', 'बाज़ार', 'चाय', 'गाय', 'दरवाज़ा', 'चाँद', 'आग', 'फूल', 'पंछी'],
};

// "Sounds" for Sound Recognition, described + beeped, never audio-only.
export const SOUNDS = [
  { key: 'dhol', icon: 'drum', pattern: [180, 90, 180, 90, 360], freq: 150, label: { en: 'A drum', as: 'ঢোল', hi: 'ढोल' } },
  { key: 'bird', icon: 'bird', pattern: [80, 60, 80, 60, 80], freq: 900, label: { en: 'A bird call', as: 'চৰাইৰ মাত', hi: 'पंछी की बोली' } },
  { key: 'bell', icon: 'bell', pattern: [400, 200, 400], freq: 660, label: { en: 'A temple bell', as: 'ঘণ্টা', hi: 'घंटी' } },
  { key: 'flute', icon: 'flute', pattern: [500, 120, 700], freq: 520, label: { en: 'A flute', as: 'বাঁহী', hi: 'बाँसुरी' } },
  { key: 'water', icon: 'water-drop', pattern: [60, 40, 60, 40, 60, 40, 60], freq: 300, label: { en: 'Running water', as: 'বৈ থকা পানী', hi: 'बहता पानी' } },
  { key: 'clock', icon: 'alarm', pattern: [70, 300, 70, 300, 70], freq: 440, label: { en: 'A ringing clock', as: 'ঘড়ীৰ শব্দ', hi: 'घड़ी की घंटी' } },
];

// Shapes for Pattern Complete, icon names, distinct colour + form.
export const PATTERN_SHAPES = [
  'shape-triangle', 'shape-square', 'shape-circle', 'shape-diamond',
  'shape-slab', 'shape-star', 'shape-ring',
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
