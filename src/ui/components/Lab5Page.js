/**
 * @file Lab5Page.js
 * @description Сторінка лабораторної роботи №5 — швидке сортування (Quick Sort).
 *
 * Функціонал:
 * - Теоретичний блок (опис, складність, псевдокод)
 * - Інтерактивний блок (введення масиву, кнопки, повзунок швидкості)
 * - Візуалізація стовпчиків (фіолетові акценти для pivot/активних елементів)
 * - Аналітика (порівняння, перестановки, час — динамічно)
 * - Звукові ефекти (тик на крок, мелодія при завершенні)
 */

import { quickSort } from '../../core/algorithms/quickSort.js';
import { parseArrayInput, generateRandomArrayAdvanced } from '../../utils/parseArray.js';
import { playSortTick, playSortComplete } from '../../utils/sound.js';

const PSEUDOCODE = `quickSort(arr, low, high):
    if low >= high: return
    pivot = arr[high]
    i = low - 1
    for j = low to high - 1:
        if arr[j] <= pivot:
            i = i + 1
            swap arr[i], arr[j]
    swap arr[i + 1], arr[high]
    p = i + 1
    quickSort(arr, low, p - 1)
    quickSort(arr, p + 1, high)`;

export const Lab5Page = {
  mount(container) {
    let steps = [];
    let stepIndex = 0;
    let speedMs = 400;
    let lastResult = null;

    const html = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header class="animate-fade-in-up" style="animation-delay: 0.05s; animation-fill-mode: both;">
          <h1 class="text-2xl font-bold transition-all duration-500 hover:scale-[1.01]">
            Лабораторна робота №5 — Швидке сортування (Quick Sort)
          </h1>
        </header>

        <section class="prose dark:prose-invert max-w-none animate-fade-in-up" style="animation-delay: 0.1s; animation-fill-mode: both;">
          <h2 class="text-xl font-semibold">Теоретичний блок</h2>
          <p>Quick Sort — ефективний алгоритм на основі підходу "розділяй і володарюй". Обирається опорний елемент (pivot), після чого масив ділиться на елементи, менші/рівні pivot, та більші за нього.</p>
          <p><strong>Складність:</strong> середня O(n log n), найгірша O(n²), найкраща O(n log n).</p>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg font-mono text-sm overflow-x-auto transition-all duration-300 hover:shadow-lg"><code>${PSEUDOCODE.trim()}</code></pre>
        </section>

        <section class="space-y-4 animate-fade-in-up" style="animation-delay: 0.15s; animation-fill-mode: both;">
          <h2 class="text-xl font-semibold">Інтерактивний блок</h2>
          <div class="flex flex-wrap gap-2 items-end">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-sm font-medium mb-1">Масив (через кому або пробіл)</label>
              <input type="text" id="array-input" placeholder="12, 4, 8, 1, 15, 9, 3"
                class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 focus:scale-[1.01]">
            </div>
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 hover:shadow-md">Випадковий масив</button>
            <button id="btn-sort" class="btn-animated px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg hover:shadow-emerald-500/30">Сортувати</button>
            <button id="btn-step" class="btn-animated px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white hover:shadow-lg hover:shadow-amber-500/30" disabled>Крок</button>
            <button id="btn-auto" class="btn-animated px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white hover:shadow-lg hover:shadow-violet-500/30" disabled>Авто-режим</button>
            <button id="btn-reset" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 hover:bg-zinc-600 text-white hover:shadow-md">Скинути</button>
          </div>
          <div class="flex items-center gap-2 w-full max-w-xs">
            <label class="text-sm shrink-0">Швидкість (мс):</label>
            <input type="range" id="speed-slider" min="1" max="1000" value="400" step="1" class="flex-1 accent-violet-500 transition-opacity hover:opacity-100">
            <input type="number" id="speed-input" min="1" max="1000" value="400" step="1" class="w-20 px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm font-mono focus:ring-2 focus:ring-violet-500 focus:border-transparent">
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 0.2s; animation-fill-mode: both;">
          <h2 class="text-xl font-semibold mb-4">Візуалізація</h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Фіолетовий — pivot, синій — порівняння, зелений — межа менших елементів, блакитний — завершено</p>
          <div id="visualization" class="h-64 flex items-end justify-center gap-1 p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl min-h-[200px] border-2 border-dashed border-violet-200 dark:border-violet-900/60 transition-all duration-500 hover:border-violet-300 dark:hover:border-violet-700"></div>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 0.25s; animation-fill-mode: both;">
          <h2 class="text-xl font-semibold mb-2">Аналітика</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div id="stat-card-1" class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg border border-transparent hover:border-violet-200 dark:hover:border-violet-800">
              <div class="text-sm text-zinc-500 dark:text-zinc-400">Порівнянь</div>
              <div id="stat-comparisons" class="font-mono text-lg">—</div>
            </div>
            <div id="stat-card-2" class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg border border-transparent hover:border-fuchsia-200 dark:hover:border-fuchsia-800">
              <div class="text-sm text-zinc-500 dark:text-zinc-400">Перестановок</div>
              <div id="stat-swaps" class="font-mono text-lg">—</div>
            </div>
            <div id="stat-card-3" class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg border border-transparent hover:border-amber-200 dark:hover:border-amber-800">
              <div class="text-sm text-zinc-500 dark:text-zinc-400">Час (мс)</div>
              <div id="stat-time" class="font-mono text-lg">—</div>
            </div>
            <div id="stat-card-4" class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg border border-transparent hover:border-violet-300 dark:hover:border-violet-700">
              <div class="text-sm text-zinc-500 dark:text-zinc-400">Складність</div>
              <div id="stat-complexity" class="font-mono text-lg font-bold">O(n log n)</div>
            </div>
          </div>
        </section>
      </div>
    `;

    container.innerHTML = html;

    const viz = document.getElementById('visualization');
    const inputEl = document.getElementById('array-input');
    const errorEl = document.getElementById('error-msg');
    const statComparisons = document.getElementById('stat-comparisons');
    const statSwaps = document.getElementById('stat-swaps');
    const statTime = document.getElementById('stat-time');

    function showError(msg) {
      errorEl.textContent = msg || '';
      errorEl.classList.toggle('hidden', !msg);
    }

    // Промальовка стовпчиків для quick sort:
    // - pivotIndex: опорний елемент
    // - currentJ: елемент, який порівнюємо з pivot
    // - currentI: межа "менших або рівних" елементів
    function renderBars(arr, state = {}, playSound = false) {
      if (!arr?.length) {
        viz.innerHTML = '<p class="text-zinc-500 animate-fade-in">Введіть масив та натисніть «Сортувати»</p>';
        return;
      }
      if (state.comparisons !== undefined || state.swaps !== undefined) {
        updateStats({
          comparisons: state.comparisons,
          swaps: state.swaps,
          executionTimeMs: lastResult?.executionTimeMs,
        });
      }
      const max = Math.max(...arr);
      const isComplete = state.action === 'complete';
      if (playSound && isComplete) playSortComplete();
      else if (playSound) playSortTick();

      viz.innerHTML = arr.map((val, idx) => {
        const h = max > 0 ? (val / max) * 100 : 0;
        let classes = 'flex-1 min-w-[8px] max-w-[24px] rounded-t transition-all duration-500 ease-out origin-bottom';

        if (isComplete) classes += ' bg-sky-400 dark:bg-sky-500 shadow-lg shadow-sky-400/40 ring-1 ring-sky-300 dark:ring-sky-400';
        else if (idx === state.pivotIndex) classes += ' bg-violet-500 dark:bg-violet-600 ring-2 ring-violet-300 dark:ring-violet-400 shadow-lg shadow-violet-500/35 scale-105';
        else if (idx === state.currentJ) classes += ' bg-blue-500 dark:bg-blue-600 ring-2 ring-offset-2 ring-blue-400 shadow-lg shadow-blue-500/30';
        else if (idx === state.currentI || idx === state.fixedIndex) classes += ' bg-emerald-500 dark:bg-emerald-600 shadow-lg shadow-emerald-500/30';
        else classes += ' bg-zinc-400 dark:bg-zinc-500';

        return `<div class="${classes}" style="height: ${h}%" title="${val}"></div>`;
      }).join('');
    }

    function updateStats(data) {
      if (!data) return;
      const cards = [statComparisons, statSwaps, statTime].map((_, i) => document.getElementById(`stat-card-${i + 1}`));
      if (data.comparisons !== undefined) {
        statComparisons.textContent = data.comparisons;
        cards[0]?.classList.add('stat-updated');
        setTimeout(() => cards[0]?.classList.remove('stat-updated'), 400);
      }
      if (data.swaps !== undefined) {
        statSwaps.textContent = data.swaps;
        cards[1]?.classList.add('stat-updated');
        setTimeout(() => cards[1]?.classList.remove('stat-updated'), 400);
      }
      if (data.executionTimeMs !== undefined) {
        statTime.textContent = data.executionTimeMs.toFixed(2);
        cards[2]?.classList.add('stat-updated');
        setTimeout(() => cards[2]?.classList.remove('stat-updated'), 400);
      }
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
      showError('');
      renderBars(arr);
    });

    const speedSlider = document.getElementById('speed-slider');
    const speedInput = document.getElementById('speed-input');
    function updateSpeed(value) {
      const numValue = Math.max(1, Math.min(1000, Number(value)));
      speedMs = numValue;
      speedSlider.value = numValue;
      speedInput.value = numValue;
    }
    speedSlider.addEventListener('input', (e) => updateSpeed(e.target.value));
    speedInput.addEventListener('input', (e) => updateSpeed(e.target.value));
    speedInput.addEventListener('blur', (e) => updateSpeed(e.target.value));

    document.getElementById('btn-reset').addEventListener('click', resetUI);

    document.getElementById('btn-sort').addEventListener('click', () => {
      const parsed = parseArrayInput(inputEl.value);
      if (!parsed.success) {
        showError(parsed.error);
        return;
      }
      showError('');
      const result = quickSort(parsed.data);
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
      const s = steps[stepIndex];
      renderBars(s.array, s, true);
    });

    document.getElementById('btn-auto').addEventListener('click', async () => {
      if (!steps.length) return;
      document.getElementById('btn-auto').disabled = true;
      document.getElementById('btn-step').disabled = true;
      for (let i = 0; i < steps.length; i++) {
        stepIndex = i;
        const s = steps[i];
        renderBars(s.array, s, true);
        await new Promise((r) => setTimeout(r, speedMs));
      }
      document.getElementById('btn-auto').disabled = false;
      document.getElementById('btn-step').disabled = false;
    });

    inputEl.value = '12, 4, 8, 1, 15, 9, 3';
    renderBars([12, 4, 8, 1, 15, 9, 3]);
  },
};
