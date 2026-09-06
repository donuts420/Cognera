export function computePerformance(trials, baselineLatencyMs) {
  if (!trials || !trials.length) return 0;
  const accuracy = trials.filter((t) => t.correct).length / trials.length;
  const latencies = trials.filter((t) => t.latency_ms != null).map((t) => t.latency_ms);
  let speed = 1;
  if (latencies.length && baselineLatencyMs) {
    const median = latencies.sort((a, b) => a - b)[Math.floor(latencies.length / 2)];
    speed = Math.min(1, baselineLatencyMs / median);
  }
  const completed = trials.some((t) => t.kind === 'session_complete') ? 1 : 0.8;
  return 0.65 * accuracy + 0.25 * speed + 0.10 * completed;
}

export function updateTheta(theta, uncertainty, difficulty, performance) {
  const expected = 1 / (1 + Math.pow(10, (difficulty - theta) / 25));
  const k = 12 + 18 * uncertainty;
  const newTheta = theta + k * (performance - expected);
  const newUncertainty = Math.max(0.15, uncertainty * 0.92);
  return { theta: newTheta, uncertainty: newUncertainty };
}

export function selectLevel(theta, levels, consecutiveAbove, consecutiveBelow) {
  if (!levels || !levels.length) return { level: 0, difficulty: 50 };
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < levels.length; i++) {
    const target = theta * 0.85;
    const dist = Math.abs((levels[i].difficulty || 50) - target);
    if (dist < bestDist) { bestDist = dist; bestIdx = i; }
  }
  if (consecutiveBelow >= 1 && bestIdx > 0) {
    bestIdx = Math.max(0, bestIdx - 1);
  }
  if (consecutiveAbove >= 2 && bestIdx < levels.length - 1) {
    bestIdx = Math.min(levels.length - 1, bestIdx + 1);
  }
  return { level: bestIdx, difficulty: levels[bestIdx].difficulty || 50 };
}

export function detectOutlier(performance, recentPerformances) {
  if (!recentPerformances || recentPerformances.length < 5) return false;
  const mean = recentPerformances.reduce((a, b) => a + b, 0) / recentPerformances.length;
  const variance = recentPerformances.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentPerformances.length;
  const sd = Math.sqrt(variance);
  return performance < mean - 2 * sd;
}

export function detectFatigue(trials) {
  if (!trials || trials.length < 6) return false;
  const third = Math.floor(trials.length / 3);
  const lastThird = trials.slice(-third);
  let declines = 0;
  for (let i = 1; i < lastThird.length; i++) {
    if (lastThird[i].correct && !lastThird[i - 1].correct) declines++;
    else if (lastThird[i].latency_ms && lastThird[i - 1].latency_ms && lastThird[i].latency_ms > lastThird[i - 1].latency_ms) declines++;
  }
  return declines >= lastThird.length - 1;
}

export function computeCWI(domainIndices, weights) {
  if (!domainIndices || !Object.keys(domainIndices).length) return null;
  const w = weights || {};
  let totalWeight = 0, totalValue = 0;
  for (const [domain, value] of Object.entries(domainIndices)) {
    const weight = w[domain] || 1;
    totalValue += value * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? Math.round(totalValue / totalWeight * 100) / 100 : null;
}

export function theilSenTrend(values) {
  if (!values || values.length < 4) return { slope: 0, direction: 'insufficient_data', ci_low: 0, ci_high: 0 };
  const slopes = [];
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      slopes.push((values[j] - values[i]) / (j - i));
    }
  }
  slopes.sort((a, b) => a - b);
  const medianIdx = Math.floor(slopes.length / 2);
  const slope = slopes.length % 2 === 0 ? (slopes[medianIdx - 1] + slopes[medianIdx]) / 2 : slopes[medianIdx];
  const q1 = slopes[Math.floor(slopes.length * 0.25)];
  const q3 = slopes[Math.floor(slopes.length * 0.75)];
  let direction = 'stable';
  if (slope > 0.5 && q1 > 0) direction = 'improving';
  else if (slope < -0.5 && q3 < 0) direction = 'declining';
  return { slope, direction, ci_low: q1, ci_high: q3 };
}
