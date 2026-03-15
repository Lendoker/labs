/**
 * @file Lab7Page.js
 * @description Сторінка лабораторної роботи №7 — шейкерне сортування.
 */

import { shakerSort } from '../../core/algorithms/shakerSort.js';
import { parseArrayInput, generateRandomArrayAdvanced } from '../../utils/parseArray.js';
import { playSortTick, playSortComplete } from '../../utils/sound.js';

const PSEUDOCODE = `left = 0; right = n - 1
swapped = true
while swapped and left < right:
    swapped = false
    for i = left to right - 1:
        if arr[i] > arr[i + 1]:
            swap arr[i], arr[i + 1]
            swapped = true
    right = right - 1
    for i = right downto left + 1:
        if arr[i - 1] > arr[i]:
            swap arr[i - 1], arr[i]
            swapped = true
    left = left + 1`;

export const Lab7Page = {
  mount(container) {
    let steps = [];
    let stepIndex = 0;
    let speedMs = 400;
    let lastResult = null;

    const html = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header class="animate-fade-in-up" style="animation-delay: 0.05s; animation-fill-mode: both;">
          <h1 class="text-2xl font-bold transition-all duration-500 hover:scale-[1.01]">
            Лабораторна робота №7 — Шейкерне сортування
          </h1>
        </header>

        <section class="prose dark:prose-invert max-w-none animate-fade-in-up" style="animation-delay: 0.1s; animation-fill-mode: both;">
          <h2 class="text-xl font-semibold">Теоретичний блок</h2>
          <p>Шейкерне сортування (Cocktail Shaker Sort) — двонапрямлена версія бульбашкового сортування. Алгоритм проходить масив уперед і назад, поступово звужуючи межі невідсортованої частини.</p>
          <p><strong>Складність:</strong> середня/найгірша O(n²), найкраща O(n) для майже відсортованих масивів.</p>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg font-mono text-sm overflow-x-auto transition-all duration-300 hover:shadow-lg"><code>${PSEUDOCODE.trim()}</code></pre>
        </section>

        <section class="space-y-4 animate-fade-in-up" style="animation-delay: 0.15s; animation-fill-mode: both;">
          <h2 class="text-xl font-semibold">Інтерактивний блок</h2>
          <div class="flex flex-wrap gap-2 items-end">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-sm font-medium mb-1">Масив (через кому або пробіл)</label>
              <input type="text" id="array-input" placeholder="9, 1, 7, 3, 5, 2, 6, 4"
                class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 focus:scale-[1.01]">
            </div>
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 hover:shadow-md">Випадковий масив</button>
            <button id="btn-sort" class="btn-animated px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">Сортувати</button>
            <button id="btn-step" class="btn-animated px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white" disabled>Крок</button>
            <button id="btn-auto" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white" disabled>Авто-режим</button>
            <button id="btn-reset" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 hover:bg-zinc-600 text-white">Скинути</button>
          </div>
          <div class="flex flex-wrap items-center gap-2 w-full">
            <div class="flex items-center gap-2 w-full max-w-xs">
              <label class="text-sm shrink-0">Швидкість (мс):</label>
              <input type="range" id="speed-slider" min="1" max="1000" value="400" step="1" class="flex-1 accent-purple-500">
              <input type="number" id="speed-input" min="1" max="1000" value="400" step="1" class="w-20 px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm font-mono">
            </div>
            <span id="direction-badge" class="text-xs px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">напрям: —</span>
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 0.2s; animation-fill-mode: both;">
          <h2 class="text-xl font-semibold mb-4">Візуалізація</h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Синій — порівняння, фіолетовий — друга позиція пари, блакитний — завершено</p>
          <div id="visualization" class="h-64 flex items-end justify-center gap-1 p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl min-h-[200px] border-2 border-dashed border-purple-200 dark:border-purple-900/60"></div>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 0.25s; animation-fill-mode: both;">
          <h2 class="text-xl font-semibold mb-2">Аналітика</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div id="stat-card-1" class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Порівнянь</div><div id="stat-comparisons" class="font-mono text-lg">—</div></div>
            <div id="stat-card-2" class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Перестановок</div><div id="stat-swaps" class="font-mono text-lg">—</div></div>
            <div id="stat-card-3" class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Час (мс)</div><div id="stat-time" class="font-mono text-lg">—</div></div>
            <div id="stat-card-4" class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Складність</div><div id="stat-complexity" class="font-mono text-lg font-bold">O(n²)</div></div>
          </div>
        </section>
      </div>
    `;

    container.innerHTML = html;
    const viz = document.getElementById('visualization');
    const inputEl = document.getElementById('array-input');
    const errorEl = document.getElementById('error-msg');
    const dirBadge = document.getElementById('direction-badge');
    const statComparisons = document.getElementById('stat-comparisons');
    const statSwaps = document.getElementById('stat-swaps');
    const statTime = document.getElementById('stat-time');

    function showError(msg) {
      errorEl.textContent = msg || '';
      errorEl.classList.toggle('hidden', !msg);
    }

    function updateStats(data) {
      if (!data) return;
      if (data.comparisons !== undefined) statComparisons.textContent = data.comparisons;
      if (data.swaps !== undefined) statSwaps.textContent = data.swaps;
      if (data.executionTimeMs !== undefined) statTime.textContent = data.executionTimeMs.toFixed(2);
    }

    function renderBars(arr, state = {}, playSound = false) {
      if (!arr?.length) {
        viz.innerHTML = '<p class="text-zinc-500">Введіть масив та натисніть «Сортувати»</p>';
        dirBadge.textContent = 'напрям: —';
        return;
      }
      if (state.comparisons !== undefined || state.swaps !== undefined) {
        updateStats({
          comparisons: state.comparisons,
          swaps: state.swaps,
          executionTimeMs: lastResult?.executionTimeMs,
        });
      }
      const directionMap = {
        forward: 'напрям: зліва → направо',
        backward: 'напрям: справа → наліво',
        none: 'напрям: —',
      };
      dirBadge.textContent = directionMap[state.direction] || 'напрям: —';

      const max = Math.max(...arr);
      const isComplete = state.action === 'complete';
      if (playSound && isComplete) playSortComplete();
      else if (playSound) playSortTick();

      viz.innerHTML = arr.map((val, idx) => {
        const h = max > 0 ? (val / max) * 100 : 0;
        let classes = 'flex-1 min-w-[8px] max-w-[24px] rounded-t transition-all duration-500';
        if (isComplete) classes += ' bg-sky-400 dark:bg-sky-500';
        else if (idx === state.i) classes += ' bg-blue-500 dark:bg-blue-600';
        else if (idx === state.j) classes += ' bg-purple-500 dark:bg-purple-600';
        else classes += ' bg-zinc-400 dark:bg-zinc-500';
        return `<div class="${classes}" style="height:${h}%" title="${val}"></div>`;
      }).join('');
    }

    function resetUI() {
      stepIndex = 0;
      steps = [];
      lastResult = null;
      renderBars([]);
      statComparisons.textContent = statSwaps.textContent = statTime.textContent = '—';
      document.getElementById('btn-step').disabled = true;
      document.getElementById('btn-auto').disabled = true;
      showError('');
    }

    document.getElementById('btn-random').addEventListener('click', () => {
      const arr = generateRandomArrayAdvanced({ length: 14, min: 1, max: 120, allowDuplicates: true });
      inputEl.value = arr.join(', ');
      renderBars(arr);
      showError('');
    });

    const speedSlider = document.getElementById('speed-slider');
    const speedInput = document.getElementById('speed-input');
    function updateSpeed(v) {
      const n = Math.max(1, Math.min(1000, Number(v)));
      speedMs = n;
      speedSlider.value = n;
      speedInput.value = n;
    }
    speedSlider.addEventListener('input', (e) => updateSpeed(e.target.value));
    speedInput.addEventListener('input', (e) => updateSpeed(e.target.value));
    speedInput.addEventListener('blur', (e) => updateSpeed(e.target.value));

    document.getElementById('btn-reset').addEventListener('click', resetUI);
    document.getElementById('btn-sort').addEventListener('click', () => {
      const parsed = parseArrayInput(inputEl.value);
      if (!parsed.success) return showError(parsed.error);
      showError('');
      const result = shakerSort(parsed.data);
      lastResult = result;
      steps = result.steps;
      stepIndex = 0;
      updateStats(result);
      document.getElementById('btn-step').disabled = false;
      document.getElementById('btn-auto').disabled = false;
      renderBars(steps[0]?.array ?? parsed.data, steps[0], true);
    });
    document.getElementById('btn-step').addEventListener('click', () => {
      if (stepIndex >= steps.length - 1) return;
      stepIndex++;
      renderBars(steps[stepIndex].array, steps[stepIndex], true);
    });
    document.getElementById('btn-auto').addEventListener('click', async () => {
      if (!steps.length) return;
      document.getElementById('btn-auto').disabled = true;
      document.getElementById('btn-step').disabled = true;
      for (let i = 0; i < steps.length; i++) {
        stepIndex = i;
        renderBars(steps[i].array, steps[i], true);
        await new Promise((r) => setTimeout(r, speedMs));
      }
      document.getElementById('btn-auto').disabled = false;
      document.getElementById('btn-step').disabled = false;
    });

    inputEl.value = '9, 1, 7, 3, 5, 2, 6, 4';
    renderBars([9, 1, 7, 3, 5, 2, 6, 4]);
  },
};
