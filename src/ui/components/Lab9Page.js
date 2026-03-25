/**
 * @file Lab9Page.js
 * @description Лабораторна №9 — лінійний пошук і лінійний пошук з бар'єром.
 */

import { linearSearch } from '../../core/algorithms/linearSearch.js';
import { linearSearchWithBarrier } from '../../core/algorithms/linearSearchBarrier.js';
import { parseArrayInput, generateRandomArrayAdvanced } from '../../utils/parseArray.js';
import { playSortTick, playSortComplete } from '../../utils/sound.js';

const PSEUDOCODE = `// Linear Search
for i = 0 .. n-1:
  if a[i] == x: return i
return -1

// Linear Search with Barrier
a[n] = x
i = 0
while a[i] != x: i++
if i == n: return -1
return i`;

export const Lab9Page = {
  mount(container) {
    let steps = [];
    let stepIndex = 0;
    let speedMs = 350;
    let lastResult = null;
    let currentMethod = 'linear';

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №9 — Лінійний пошук та пошук з бар'єром</h1></header>
        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p>У роботі реалізовано два методи пошуку: класичний лінійний пошук і лінійний пошук з бар'єром (sentinel).</p>
          <p><strong>Складність:</strong> обидва методи мають O(n) у середньому/найгіршому випадку.</p>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm overflow-x-auto"><code>${PSEUDOCODE}</code></pre>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Інтерактивний блок</h2>
          <div class="flex flex-wrap gap-2 items-end">
            <div class="flex-1 min-w-[240px]">
              <label class="block text-sm font-medium mb-1">Масив</label>
              <input id="array-input" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="5, 12, 8, 1, 9, 4, 7">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Шукане значення</label>
              <input id="target-input" class="w-36 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="9">
            </div>
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700">Випадковий</button>
            <button id="btn-linear" class="btn-animated px-4 py-2 rounded-lg bg-blue-600 text-white">Лінійний</button>
            <button id="btn-barrier" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">З бар'єром</button>
            <button id="btn-step" class="btn-animated px-4 py-2 rounded-lg bg-amber-500 text-white" disabled>Крок</button>
            <button id="btn-auto" class="btn-animated px-4 py-2 rounded-lg bg-emerald-600 text-white" disabled>Авто</button>
            <button id="btn-reset" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Скинути</button>
          </div>
          <div class="flex items-center gap-2 w-full max-w-xs">
            <label class="text-sm shrink-0">Швидкість (мс):</label>
            <input type="range" id="speed-slider" min="1" max="1000" value="350" step="1" class="flex-1 accent-purple-500">
            <input type="number" id="speed-input" min="1" max="1000" value="350" class="w-20 px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm font-mono">
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Візуалізація</h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Синій — поточна перевірка, зелений — знайдений елемент, фіолетовий — бар'єр</p>
          <div id="visualization" class="h-64 flex items-end justify-center gap-1 p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/60"></div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Аналітика</h2>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Метод</div><div id="stat-method" class="font-mono text-sm">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Порівнянь</div><div id="stat-comparisons" class="font-mono text-lg">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Індекс</div><div id="stat-index" class="font-mono text-lg">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Час (мс)</div><div id="stat-time" class="font-mono text-lg">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-sm text-zinc-500 dark:text-zinc-400">Складність</div><div class="font-mono text-lg font-bold">O(n)</div></div>
          </div>
        </section>
      </div>
    `;

    const viz = document.getElementById('visualization');
    const arrayInput = document.getElementById('array-input');
    const targetInput = document.getElementById('target-input');
    const errorEl = document.getElementById('error-msg');
    const statMethod = document.getElementById('stat-method');
    const statComparisons = document.getElementById('stat-comparisons');
    const statIndex = document.getElementById('stat-index');
    const statTime = document.getElementById('stat-time');

    function showError(msg) {
      errorEl.textContent = msg || '';
      errorEl.classList.toggle('hidden', !msg);
    }

    function updateStats(result) {
      if (!result) return;
      statMethod.textContent = currentMethod === 'barrier' ? 'З барʼєром' : 'Лінійний';
      statComparisons.textContent = result.comparisons;
      statIndex.textContent = result.foundIndex >= 0 ? result.foundIndex : 'не знайдено';
      statTime.textContent = result.executionTimeMs.toFixed(2);
    }

    function renderBars(arr, state = {}, playSound = false) {
      if (!arr?.length) {
        viz.innerHTML = '<p class="text-zinc-500">Введіть масив і значення для пошуку</p>';
        return;
      }
      const max = Math.max(...arr.map((v) => Math.abs(v))) || 1;
      const isComplete = state.action === 'found' || state.action === 'not_found' || state.action === 'hit_barrier_not_found';
      if (playSound && isComplete) playSortComplete();
      else if (playSound) playSortTick();

      viz.innerHTML = arr.map((val, idx) => {
        const h = (Math.abs(val) / max) * 100;
        let cls = 'flex-1 min-w-[8px] max-w-[24px] rounded-t transition-all duration-500';
        if (idx === state.targetIndex) cls += ' bg-emerald-500 dark:bg-emerald-600';
        else if (idx === state.currentIndex) cls += ' bg-blue-500 dark:bg-blue-600';
        else if (idx === state.barrierIndex) cls += ' bg-purple-500 dark:bg-purple-600';
        else cls += ' bg-zinc-400 dark:bg-zinc-500';
        return `<div class="${cls} bar-with-value" style="height:${h}%" data-value="${val}" title="${val}"></div>`;
      }).join('');
    }

    function resetUI() {
      steps = [];
      stepIndex = 0;
      lastResult = null;
      renderBars([]);
      statMethod.textContent = statComparisons.textContent = statIndex.textContent = statTime.textContent = '—';
      document.getElementById('btn-step').disabled = true;
      document.getElementById('btn-auto').disabled = true;
      showError('');
    }

    function runSearch(method) {
      const parsed = parseArrayInput(arrayInput.value);
      if (!parsed.success) return showError(parsed.error);
      const target = Number(targetInput.value);
      if (!Number.isFinite(target)) return showError('Введіть коректне шукане число.');

      showError('');
      currentMethod = method;
      const result = method === 'barrier'
        ? linearSearchWithBarrier(parsed.data, target)
        : linearSearch(parsed.data, target);
      lastResult = result;
      steps = result.steps;
      stepIndex = 0;
      updateStats(result);
      document.getElementById('btn-step').disabled = false;
      document.getElementById('btn-auto').disabled = false;
      renderBars(steps[0]?.array || parsed.data, steps[0], true);
    }

    const speedSlider = document.getElementById('speed-slider');
    const speedInput = document.getElementById('speed-input');
    function updateSpeed(value) {
      const v = Math.max(1, Math.min(1000, Number(value)));
      speedMs = v;
      speedSlider.value = v;
      speedInput.value = v;
    }
    speedSlider.addEventListener('input', (e) => updateSpeed(e.target.value));
    speedInput.addEventListener('input', (e) => updateSpeed(e.target.value));
    speedInput.addEventListener('blur', (e) => updateSpeed(e.target.value));

    document.getElementById('btn-random').addEventListener('click', () => {
      const arr = generateRandomArrayAdvanced({ length: 12, min: 1, max: 30, allowDuplicates: true });
      arrayInput.value = arr.join(', ');
      targetInput.value = arr[Math.floor(Math.random() * arr.length)];
      renderBars(arr);
      showError('');
    });
    document.getElementById('btn-linear').addEventListener('click', () => runSearch('linear'));
    document.getElementById('btn-barrier').addEventListener('click', () => runSearch('barrier'));
    document.getElementById('btn-reset').addEventListener('click', resetUI);

    document.getElementById('btn-step').addEventListener('click', () => {
      if (!steps.length || stepIndex >= steps.length - 1) return;
      stepIndex++;
      const s = steps[stepIndex];
      renderBars(s.array, s, true);
    });

    document.getElementById('btn-auto').addEventListener('click', async () => {
      if (!steps.length) return;
      const autoBtn = document.getElementById('btn-auto');
      const stepBtn = document.getElementById('btn-step');
      autoBtn.disabled = true;
      stepBtn.disabled = true;
      for (let i = 0; i < steps.length; i++) {
        stepIndex = i;
        renderBars(steps[i].array, steps[i], true);
        await new Promise((r) => setTimeout(r, speedMs));
      }
      autoBtn.disabled = false;
      stepBtn.disabled = false;
    });

    arrayInput.value = '5, 12, 8, 1, 9, 4, 7';
    targetInput.value = '9';
    renderBars([5, 12, 8, 1, 9, 4, 7]);
  },
};
