/**
 * @file graphViz.js
 * @description Спільні SVG-візуалізації графів для лабораторних 24–30.
 */

import { circleLayout } from '../../core/algorithms/graph.js';

/**
 * @param {HTMLElement} el
 * @param {object} opts
 * @param {number} opts.n
 * @param {(i:number,j:number)=>boolean} opts.hasEdge
 * @param {(i:number,j:number)=>string|number} [opts.edgeLabel]
 * @param {boolean} [opts.directed]
 * @param {number[]} [opts.highlightNodes]
 * @param {{from:number,to:number}[]} [opts.highlightEdges]
 * @param {{from:number,to:number}} [opts.activeEdge]
 */
export function renderGraphSvg(el, opts) {
  const {
    n,
    hasEdge,
    edgeLabel,
    directed: directedOpt,
    highlightNodes = [],
    highlightEdges = [],
    activeEdge = null,
    mstEdges = [],
    pathEdges = [],
  } = opts;

  if (!n) {
    el.innerHTML = '<p class="text-zinc-500 p-4">Граф порожній.</p>';
    return;
  }

  const width = 600;
  const height = 460;
  const positions = circleLayout(n, { cx: width / 2, cy: height / 2, radius: Math.min(width, height) / 2 - 40 });
  const directed = directedOpt ?? true;
  const hiSet = new Set(highlightNodes);
  const mstSet = new Set(mstEdges.map((e) => `${Math.min(e.start ?? e.from, e.end ?? e.to)}-${Math.max(e.start ?? e.from, e.end ?? e.to)}`));
  const pathSet = new Set(pathEdges.map((e) => `${e.from}-${e.to}`));

  const isHiEdge = (i, j) => {
    if (activeEdge && activeEdge.from === i && activeEdge.to === j) return 'active';
    if (pathSet.has(`${i}-${j}`)) return 'path';
    const key = directed ? `${i}-${j}` : `${Math.min(i, j)}-${Math.max(i, j)}`;
    if (mstSet.has(`${Math.min(i, j)}-${Math.max(i, j)}`) || mstSet.has(key)) return 'mst';
    return highlightEdges.some((e) => e.from === i && e.to === j) ? 'hi' : '';
  };

  const arrowDef = directed ? `
    <defs>
      <marker id="g-arrow" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,-5L10,0L0,5" class="fill-purple-500 dark:fill-purple-300"></path>
      </marker>
    </defs>` : '';

  const drawn = new Set();
  const edgesSvg = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (!hasEdge(i, j) || i === j) continue;
      if (!directed) {
        const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
        if (drawn.has(key)) continue;
        drawn.add(key);
      }
      const a = positions[i];
      const b = positions[j];
      const kind = isHiEdge(i, j);
      const cls = kind === 'active' ? 'stroke-amber-500'
        : kind === 'path' ? 'stroke-emerald-500'
          : kind === 'mst' ? 'stroke-emerald-600'
            : kind === 'hi' ? 'stroke-rose-500'
              : 'stroke-purple-400 dark:stroke-purple-500';
      const w = kind ? 3 : 2;
      const label = edgeLabel ? edgeLabel(i, j) : '';
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const labelSvg = label !== '' && label !== undefined
        ? `<text x="${midX}" y="${midY - 6}" text-anchor="middle" class="fill-zinc-600 dark:fill-zinc-300 text-[10px] font-mono">${label}</text>`
        : '';
      edgesSvg.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${cls}" stroke-width="${w}" ${directed ? 'marker-end="url(#g-arrow)"' : ''}/>${labelSvg}`);
    }
  }

  const nodesSvg = positions.map((p, i) => {
    let cls = 'fill-white dark:fill-zinc-900 stroke-purple-500';
    if (hiSet.has(i)) cls = 'fill-amber-200 dark:fill-amber-900/60 stroke-amber-500';
    return `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="20" class="${cls}" stroke-width="2"></circle>
        <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" class="fill-zinc-800 dark:fill-zinc-100 text-xs font-mono font-semibold">${i + 1}</text>
      </g>`;
  }).join('');

  el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="xMidYMid meet" class="block">${arrowDef}${edgesSvg.join('')}${nodesSvg}</svg>`;
}

export function matrixHasEdge(matrix, i, j, directed) {
  if (!matrix[i]?.[j]) return false;
  if (!directed && j < i) return false;
  return matrix[i][j] !== 0;
}

export function matrixEdgeLabel(matrix, i, j) {
  const w = matrix[i][j];
  return w === 0 ? '' : w;
}

export function wireStepPlayback({ getMaxStep, onStep, onRun, speedEl, speedValEl, btnStep, btnAuto, btnRun, btnReset }) {
  let stepIndex = 0;
  let autoTimer = null;
  let autoDelay = Number(speedEl?.value ?? 700);

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
      btnAuto.textContent = 'Авто';
    }
  }

  function render() { onStep(stepIndex); }

  btnStep?.addEventListener('click', () => {
    stopAuto();
    if (stepIndex < getMaxStep()) stepIndex++;
    render();
  });

  btnRun?.addEventListener('click', () => {
    stopAuto();
    stepIndex = getMaxStep();
    onRun?.();
    render();
  });

  btnReset?.addEventListener('click', () => {
    stopAuto();
    stepIndex = 0;
    render();
  });

  btnAuto?.addEventListener('click', () => {
    if (autoTimer) { stopAuto(); return; }
    btnAuto.textContent = 'Стоп';
    autoTimer = setInterval(() => {
      if (stepIndex < getMaxStep()) { stepIndex++; render(); }
      else stopAuto();
    }, autoDelay);
  });

  speedEl?.addEventListener('input', (e) => {
    autoDelay = Number(e.target.value);
    if (speedValEl) speedValEl.textContent = `${autoDelay} мс`;
  });

  return {
    getStep: () => stepIndex,
    setStep: (i) => { stepIndex = i; },
    reset: () => { stopAuto(); stepIndex = 0; render(); },
    stopAuto,
    render,
  };
}
