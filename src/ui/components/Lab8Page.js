/**
 * @file Lab8Page.js
 * @description Сторінка лабораторної роботи №8 — пірамідальне сортування.
 */

import { heapSort } from '../../core/algorithms/heapSort.js';
import { parseArrayInput, generateRandomArrayAdvanced } from '../../utils/parseArray.js';
import { playSortTick, playSortComplete } from '../../utils/sound.js';

const PSEUDOCODE = `build max-heap(arr)
for end = n - 1 downto 1:
    swap arr[0], arr[end]
    heapSize = end
    siftDown(arr, 0, heapSize)`;

export const Lab8Page = {
  mount(container) {
    let steps = [];
    let stepIndex = 0;
    let speedMs = 400;
    let lastResult = null;

    const html = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header class="animate-fade-in-up" style="animation-delay: 0.05s; animation-fill-mode: both;">
          <h1 class="text-2xl font-bold transition-all duration-500 hover:scale-[1.01]">
            Лабораторна робота №8 — Пірамідальне сортування (Heap Sort)
          </h1>
        </header>

        <section class="prose dark:prose-invert max-w-none animate-fade-in-up" style="animation-delay: 0.1s; animation-fill-mode: both;">
          <h2 class="text-xl font-semibold">Теоретичний блок</h2>
          <p>Пірамідальне сортування використовує структуру даних <em>max-heap</em>. Спочатку будується піраміда, потім максимальний елемент (корінь) послідовно переноситься в кінець масиву.</p>
          <p><strong>Складність:</strong> O(n log n) у середньому, найгіршому і найкращому випадках.</p>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg font-mono text-sm overflow-x-auto transition-all duration-300 hover:shadow-lg"><code>${PSEUDOCODE.trim()}</code></pre>
        </section>

        <section class="space-y-4 animate-fade-in-up" style="animation-delay: 0.15s; animation-fill-mode: both;">
          <h2 class="text-xl font-semibold">Інтерактивний блок</h2>
          <div class="flex flex-wrap gap-2 items-end">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-sm font-medium mb-1">Масив (через кому або пробіл)</label>
              <input type="text" id="array-input" placeholder="16, 4, 10, 14, 7, 9, 3, 2, 8, 1"
                class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 focus:scale-[1.01]">
            </div>
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600">Випадковий масив</button>
            <button id="btn-sort" class="btn-animated px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">Сортувати</button>
            <button id="btn-step" class="btn-animated px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white" disabled>Крок</button>
            <button id="btn-auto" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white" disabled>Авто-режим</button>
            <button id="btn-reset" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 hover:bg-zinc-600 text-white">Скинути</button>
          </div>
          <div class="flex flex-wrap items-center gap-2 w-full">
            <div class="flex items-center gap-2 w-full max-w-xs">
              <label class="text-sm shrink-0">Швидкість (мс):</label>
              <input type="range" id="speed-slider" min="1" max="1000" value="400" step="1" class="flex-1 accent-indigo-500">
              <input type="number" id="speed-input" min="1" max="1000" value="400" step="1" class="w-20 px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm font-mono">
            </div>
            <span id="heap-badge" class="text-xs px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">heap: —</span>
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 0.2s; animation-fill-mode: both;">
          <h2 class="text-xl font-semibold mb-4">Візуалізація</h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Індиго — поточний вузол, фіолетовий — найбільший кандидат, зелений — вже відсортована частина, блакитний — завершено</p>
          <div id="visualization" class="h-64 flex items-end justify-center gap-1 p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl min-h-[200px] border-2 border-dashed border-indigo-200 dark:border-indigo-900/60"></div>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 0.25s; animation-fill-mode: both;">
          <h2 class="text-xl font-semibold mb-2">Аналітика</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Порівнянь</div><div id="stat-comparisons" class="font-mono text-lg">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Перестановок</div><div id="stat-swaps" class="font-mono text-lg">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Час (мс)</div><div id="stat-time" class="font-mono text-lg">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Складність</div><div class="font-mono text-lg font-bold">O(n log n)</div></div>
          </div>
        </section>
      </div>
    `;

    container.innerHTML = html;
    const viz = document.getElementById('visualization');
    const inputEl = document.getElementById('array-input');
    const errorEl = document.getElementById('error-msg');
    const heapBadge = document.getElementById('heap-badge');
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
        heapBadge.textContent = 'heap: —';
        return;
      }
      if (state.comparisons !== undefined || state.swaps !== undefined) {
        updateStats({
          comparisons: state.comparisons,
          swaps: state.swaps,
          executionTimeMs: lastResult?.executionTimeMs,
        });
      }
      heapBadge.textContent = `heap size: ${state.heapSize ?? arr.length}`;

      const max = Math.max(...arr);
      const isComplete = state.action === 'complete';
      if (playSound && isComplete) playSortComplete();
      else if (playSound) playSortTick();

      viz.innerHTML = arr.map((val, idx) => {
        const h = max > 0 ? (val / max) * 100 : 0;
        let classes = 'flex-1 min-w-[8px] max-w-[24px] rounded-t transition-all duration-500';
        if (isComplete) classes += ' bg-sky-400 dark:bg-sky-500';
        else if (idx >= (state.sortedFrom ?? arr.length)) classes += ' bg-emerald-500 dark:bg-emerald-600';
        else if (idx === state.largest) classes += ' bg-purple-500 dark:bg-purple-600';
        else if (idx === state.current) classes += ' bg-indigo-500 dark:bg-indigo-600';
        else if (idx === state.leftIdx || idx === state.rightIdx) classes += ' bg-blue-500 dark:bg-blue-600';
        else classes += ' bg-zinc-400 dark:bg-zinc-500';
        return `<div class="${classes} bar-with-value" style="height:${h}%" title="${val}" data-value="${val}"></div>`;
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
      const result = heapSort(parsed.data);
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

    inputEl.value = '16, 4, 10, 14, 7, 9, 3, 2, 8, 1';
    renderBars([16, 4, 10, 14, 7, 9, 3, 2, 8, 1]);
  },
};
