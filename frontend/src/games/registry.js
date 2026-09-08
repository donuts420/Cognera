import ChimpTest from './ChimpTest.jsx';
import MemoryMatch from './MemoryMatch.jsx';
import SequenceMemory from './SequenceMemory.jsx';
import NumberMemory from './NumberMemory.jsx';
import ReactionTime from './ReactionTime.jsx';
import FindObject from './FindObject.jsx';
import OddOneOut from './OddOneOut.jsx';
import PatternComplete from './PatternComplete.jsx';
import WordRecall from './WordRecall.jsx';
import DailyRoutine from './DailyRoutine.jsx';
import StorySequencing from './StorySequencing.jsx';
import SoundRecognition from './SoundRecognition.jsx';
import MemoryLane from './MemoryLane.jsx';

// slug -> { Component, meta }
// meta.instruction is an i18n key spoken + shown on the intro screen.
export const GAMES = {
  'chimp-test': {
    Component: ChimpTest,
    meta: { icon: 'brain', instruction: 'games.chimp.intro', supportsVoice: true, rounds: 5 },
  },
  'memory-match': {
    Component: MemoryMatch,
    meta: { icon: 'cards', instruction: 'games.match.intro', supportsVoice: true },
  },
  'sequence-memory': {
    Component: SequenceMemory,
    meta: { icon: 'music-notes', instruction: 'games.sequence.intro', supportsVoice: true, rounds: 6 },
  },
  'number-memory': {
    Component: NumberMemory,
    meta: { icon: 'calculator', instruction: 'games.number.intro', supportsVoice: true, rounds: 5 },
  },
  'reaction-time': {
    Component: ReactionTime,
    meta: { icon: 'bolt', instruction: 'games.reaction.intro', supportsVoice: true },
  },
  'find-object': {
    Component: FindObject,
    meta: { icon: 'search', instruction: 'games.find.intro', supportsVoice: true, rounds: 5 },
  },
  'odd-one-out': {
    Component: OddOneOut,
    meta: { icon: 'target', instruction: 'games.odd.intro', supportsVoice: true, rounds: 6 },
  },
  'pattern-complete': {
    Component: PatternComplete,
    meta: { icon: 'loom', instruction: 'games.pattern.intro', supportsVoice: true, rounds: 6 },
  },
  'word-recall': {
    Component: WordRecall,
    meta: { icon: 'speech', instruction: 'games.word.intro', supportsVoice: true },
  },
  'daily-routine': {
    Component: DailyRoutine,
    meta: { icon: 'sunrise', instruction: 'games.routine.intro', supportsVoice: true },
  },
  'story-sequencing': {
    Component: StorySequencing,
    meta: { icon: 'book', instruction: 'games.story.intro', supportsVoice: true },
  },
  'sound-recognition': {
    Component: SoundRecognition,
    meta: { icon: 'bell', instruction: 'games.sound.intro', supportsVoice: true, rounds: 6 },
  },
  'memory-lane': {
    Component: MemoryLane,
    meta: { icon: 'clock-old', instruction: 'games.lane.intro', supportsVoice: true, scored: false },
  },
};

export const DOMAIN_ORDER = [
  'memory',
  'attention',
  'processing_speed',
  'visuospatial',
  'language',
  'executive',
];

// node-postgres returns the custom `cognitive_domain[]` enum column as a raw
// string like "{memory,visuospatial}" rather than a JS array. Normalise both.
export function normalizeDomains(domains) {
  if (Array.isArray(domains)) return domains;
  if (typeof domains === 'string') {
    return domains.replace(/^\{|\}$/g, '').split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
  }
  return [];
}

export function groupByDomain(gameRows) {
  const groups = {};
  for (const g of gameRows) {
    if (!GAMES[g.slug]) continue;
    const domain = normalizeDomains(g.domains)[0] || 'memory';
    (groups[domain] = groups[domain] || []).push(g);
  }
  return DOMAIN_ORDER.filter((d) => groups[d]).map((d) => ({ domain: d, games: groups[d] }));
}
