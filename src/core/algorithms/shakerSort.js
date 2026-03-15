/**
 * @file shakerSort.js
 * @description Чиста алгоритмічна реалізація шейкерного сортування (Cocktail Shaker Sort).
 * Файл повністю ізольований: без DOM, без стилів, без console.log.
 *
 * Алгоритм:
 * - Чергує проходи зліва направо і справа наліво.
 * - За прямого проходу найбільший елемент "спливає" вправо.
 * - За зворотного проходу найменший елемент переміщується вліво.
 *
 * @module core/algorithms/shakerSort
 */

/**
 * Виконує шейкерне сортування і повертає кроки для візуалізації.
 *
 * @param {number[]} arr - Вхідний масив чисел (не змінюється)
 * @returns {{ steps: Object[], comparisons: number, swaps: number, executionTimeMs: number }}
 */
export function shakerSort(arr) {
  const startTime = performance.now();
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const result = [...arr];
  const n = result.length;

  let left = 0;
  let right = n - 1;
  let swapped = true;

  steps.push({
    array: [...result],
    left,
    right,
    i: -1,
    j: -1,
    direction: 'none',
    action: 'init',
    comparisons: 0,
    swaps: 0,
  });

  while (swapped && left < right) {
    swapped = false;

    // Прямий прохід: найбільше праворуч.
    for (let i = left; i < right; i++) {
      comparisons++;
      steps.push({
        array: [...result],
        left,
        right,
        i,
        j: i + 1,
        direction: 'forward',
        action: 'compare',
        comparisons,
        swaps,
      });

      if (result[i] > result[i + 1]) {
        [result[i], result[i + 1]] = [result[i + 1], result[i]];
        swaps++;
        swapped = true;
        steps.push({
          array: [...result],
          left,
          right,
          i,
          j: i + 1,
          direction: 'forward',
          action: 'swap',
          comparisons,
          swaps,
        });
      }
    }

    steps.push({
      array: [...result],
      left,
      right,
      i: -1,
      j: -1,
      direction: 'forward',
      action: 'forward_pass_done',
      comparisons,
      swaps,
    });

    right--;
    if (!swapped) break;
    swapped = false;

    // Зворотний прохід: найменше ліворуч.
    for (let i = right; i > left; i--) {
      comparisons++;
      steps.push({
        array: [...result],
        left,
        right,
        i: i - 1,
        j: i,
        direction: 'backward',
        action: 'compare',
        comparisons,
        swaps,
      });

      if (result[i - 1] > result[i]) {
        [result[i - 1], result[i]] = [result[i], result[i - 1]];
        swaps++;
        swapped = true;
        steps.push({
          array: [...result],
          left,
          right,
          i: i - 1,
          j: i,
          direction: 'backward',
          action: 'swap',
          comparisons,
          swaps,
        });
      }
    }

    steps.push({
      array: [...result],
      left,
      right,
      i: -1,
      j: -1,
      direction: 'backward',
      action: 'backward_pass_done',
      comparisons,
      swaps,
    });
    left++;
  }

  steps.push({
    array: [...result],
    left,
    right,
    i: -1,
    j: -1,
    direction: 'none',
    action: 'complete',
    comparisons,
    swaps,
  });

  const executionTimeMs = performance.now() - startTime;
  return { steps, comparisons, swaps, executionTimeMs };
}
