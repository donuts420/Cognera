/*
 * Approximate reference values for the benchmark-style games, so a player can
 * see roughly where a result sits. These are general figures from public
 * cognitive-performance research and aggregate testing data, treated as
 * rough guides, not clinical norms, and always labelled as such in the UI.
 */

function rtForAge(age) {
  if (!age || age < 1) return null;
  if (age <= 25) return 250;
  if (age <= 65) return Math.round(250 + (age - 25) * 1.5);
  return Math.round(310 + (age - 65) * 3);
}

function digitSpanForAge(age) {
  if (!age || age < 1) return 7;
  return Math.round((7 - Math.max(0, (age - 55) * 0.03)) * 10) / 10;
}

/**
 * @returns null, or {
 *   label, unit, lowerBetter,
 *   typical,            // a single "most people" value
 *   forAge?,            // value adjusted for the player's age (if known)
 *   scaleMax,           // for drawing bars
 *   note               // one-line caveat
 * }
 */
export function getBenchmark(slug, { age } = {}) {
  switch (slug) {
    case 'reaction-time':
      return {
        label: 'Reaction time',
        unit: 'ms',
        lowerBetter: true,
        typical: 273,
        forAge: rtForAge(age),
        scaleMax: 600,
        note: 'Typical simple visual reaction time. It naturally slows a little with age.',
      };
    case 'number-memory':
      return {
        label: 'Number span',
        unit: 'digits',
        lowerBetter: false,
        typical: 7,
        forAge: digitSpanForAge(age),
        scaleMax: 14,
        note: 'Most people remember about 7 digits (the classic “seven, plus or minus two”).',
      };
    case 'chimp-test':
      return {
        label: 'Chimp span',
        unit: 'numbers',
        lowerBetter: false,
        typical: 7,
        forAge: null,
        scaleMax: 15,
        note: 'Most people manage around 7; getting past 9 is uncommon.',
      };
    case 'sequence-memory':
      return {
        label: 'Sequence length',
        unit: 'steps',
        lowerBetter: false,
        typical: 5,
        forAge: null,
        scaleMax: 14,
        note: 'A typical result is around 5 steps.',
      };
    default:
      return null;
  }
}

/** Human-readable current value for a game's headline metric. */
export function formatMetric(metric, value) {
  if (value == null) return '–';
  if (metric === 'latency') return `${Math.round(value)} ms`;
  if (metric === 'accuracy') return `${Math.round(value * 100)}%`;
  if (metric === 'span') return String(Math.round(value));
  return String(value);
}

export const METRIC_LABEL = {
  latency: 'Response time',
  accuracy: 'Accuracy',
  span: 'Best reached',
};
