/**
 * @file quickSort.js
 * @description Чиста алгоритмічна реалізація швидкого сортування (Quick Sort).
 * Файл повністю ізольований: без DOM, без стилів, без console.log.
 *
 * Алгоритм:
 * - Використовується ітеративний підхід (стек діапазонів), щоб уникнути рекурсії.
 * - Для кожного діапазону виконується partition (схема Ломуто).
 * - Після розбиття опорний елемент (pivot) опиняється на правильній позиції.
 *
 * @module core/algorithms/quickSort
 */

/**
 * Виконує швидке сортування і повертає кроки для візуалізації.
 *
 * @param {number[]} arr - Вхідний масив чисел (не змінюється)
 * @returns {{ steps: Object[], comparisons: number, swaps: number, executionTimeMs: number }}
 */
export function quickSort(arr) {
  const startTime = performance.now();
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const result = [...arr];
  const n = result.length;

  // Початковий крок: показуємо масив до початку сортування.
  steps.push({
    array: [...result],
    low: -1,
    high: -1,
    pivotIndex: -1,
    currentI: -1,
    currentJ: -1,
    fixedIndex: -1,
    action: 'init',
    comparisons: 0,
    swaps: 0,
  });

  if (n <= 1) {
    steps.push({
      array: [...result],
      low: 0,
      high: n - 1,
      pivotIndex: n - 1,
      currentI: -1,
      currentJ: -1,
      fixedIndex: n - 1,
      action: 'complete',
      comparisons: 0,
      swaps: 0,
    });
    return {
      steps,
      comparisons: 0,
      swaps: 0,
      executionTimeMs: performance.now() - startTime,
    };
  }

  // Стек діапазонів [low, high], які потрібно розбити.
  const stack = [[0, n - 1]];

  while (stack.length > 0) {
    const [low, high] = stack.pop();
    if (low >= high) continue;

    let i = low - 1;
    const pivotIndex = high;

    steps.push({
      array: [...result],
      low,
      high,
      pivotIndex,
      currentI: i,
      currentJ: -1,
      fixedIndex: -1,
      action: 'partition_start',
      comparisons,
      swaps,
    });

    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push({
        array: [...result],
        low,
        high,
        pivotIndex,
        currentI: i,
        currentJ: j,
        fixedIndex: -1,
        action: 'compare',
        comparisons,
        swaps,
      });

      if (result[j] <= result[pivotIndex]) {
        i++;
        if (i !== j) {
          [result[i], result[j]] = [result[j], result[i]];
          swaps++;
          steps.push({
            array: [...result],
            low,
            high,
            pivotIndex,
            currentI: i,
            currentJ: j,
            fixedIndex: -1,
            action: 'swap',
            comparisons,
            swaps,
          });
        } else {
          steps.push({
            array: [...result],
            low,
            high,
            pivotIndex,
            currentI: i,
            currentJ: j,
            fixedIndex: -1,
            action: 'keep',
            comparisons,
            swaps,
          });
        }
      }
    }

    const fixedIndex = i + 1;
    if (fixedIndex !== pivotIndex) {
      [result[fixedIndex], result[pivotIndex]] = [result[pivotIndex], result[fixedIndex]];
      swaps++;
      steps.push({
        array: [...result],
        low,
        high,
        pivotIndex,
        currentI: i,
        currentJ: -1,
        fixedIndex,
        action: 'pivot_swap',
        comparisons,
        swaps,
      });
    } else {
      steps.push({
        array: [...result],
        low,
        high,
        pivotIndex,
        currentI: i,
        currentJ: -1,
        fixedIndex,
        action: 'pivot_stay',
        comparisons,
        swaps,
      });
    }

    steps.push({
      array: [...result],
      low,
      high,
      pivotIndex,
      currentI: -1,
      currentJ: -1,
      fixedIndex,
      action: 'partition_done',
      comparisons,
      swaps,
    });

    // Праву частину додаємо першою, щоб ліву обробити раніше (LIFO).
    if (fixedIndex + 1 < high) stack.push([fixedIndex + 1, high]);
    if (low < fixedIndex - 1) stack.push([low, fixedIndex - 1]);
  }

  steps.push({
    array: [...result],
    low: 0,
    high: n - 1,
    pivotIndex: -1,
    currentI: -1,
    currentJ: -1,
    fixedIndex: -1,
    action: 'complete',
    comparisons,
    swaps,
  });

  const executionTimeMs = performance.now() - startTime;
  return { steps, comparisons, swaps, executionTimeMs };
}
