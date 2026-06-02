/**
 * @file graphRandom.js
 * @description Генератори випадкових графів для лабораторних 24–30.
 */

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function matrixToText(matrix) {
  return matrix.map((row) => row.join(' ')).join('\n');
}

/** Випадковий DAG (орієнтований ациклічний граф) у форматі «u v». */
export function randomDagEdges(n = 7, edgeProb = 0.38) {
  const lines = [];
  for (let u = 0; u < n; u++) {
    for (let v = u + 1; v < n; v++) {
      if (Math.random() < edgeProb) lines.push(`${u} ${v}`);
    }
  }
  if (!lines.length && n > 1) lines.push(`0 ${n - 1}`);
  return lines.join('\n');
}

/** DAG + одне зворотне ребро (цикл). */
export function randomCyclicDirectedEdges(n = 7, edgeProb = 0.35) {
  let text = randomDagEdges(n, edgeProb);
  if (n >= 3) text += `\n${n - 1} ${randInt(0, Math.max(0, n - 3))}`;
  return text;
}

/** Зв’язний неорієнтований зважений граф (матриця). */
export function randomUndirectedWeightedMatrix(n = 6, minW = 1, maxW = 99, extraProb = 0.35) {
  const m = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 1; i < n; i++) {
    const j = randInt(0, i - 1);
    const w = randInt(minW, maxW);
    m[i][j] = m[j][i] = w;
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!m[i][j] && Math.random() < extraProb) {
        const w = randInt(minW, maxW);
        m[i][j] = m[j][i] = w;
      }
    }
  }
  return m;
}

/** Орієнтовані зважені ребра «u v w». */
export function randomDirectedWeightedEdges(n = 6, minW = 1, maxW = 50, allowNegative = false) {
  const lines = [];
  const seen = new Set();
  for (let i = 1; i < n; i++) {
    const from = randInt(0, i - 1);
    let w = randInt(minW, maxW);
    if (allowNegative && Math.random() < 0.15) w = -randInt(1, 15);
    lines.push(`${from} ${i} ${w}`);
    seen.add(`${from}-${i}`);
  }
  const extra = randInt(0, n);
  let attempts = 0;
  while (lines.length < n + extra && attempts < 200) {
    attempts++;
    const u = randInt(0, n - 1);
    const v = randInt(0, n - 1);
    if (u === v || seen.has(`${u}-${v}`)) continue;
    let w = randInt(minW, maxW);
    if (allowNegative && Math.random() < 0.12) w = -randInt(1, 12);
    lines.push(`${u} ${v} ${w}`);
    seen.add(`${u}-${v}`);
  }
  return lines.join('\n');
}

/** Евристика h для A*: орієнтовна «відстань» до цілі. */
export function randomHeuristic(n, goal) {
  return Array.from({ length: n }, (_, i) => {
    if (i === goal) return 0;
    return randInt(0, Math.abs(goal - i) * 4 + 3);
  });
}

export function heuristicToText(h) {
  return h.join(' ');
}
