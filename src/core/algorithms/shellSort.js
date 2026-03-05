/**
 * @file shellSort.js
 * @description Чиста алгоритмічна реалізація сортування Шелла (Shell Sort).
 * Файл повністю ізольований: без DOM, без стилів, без console.log.
 *
 * Алгоритм:
 * - Починаємо з великого кроку gap = n / 2.
 * - Для кожного gap виконуємо "включення з кроком gap".
 * - Поступово зменшуємо gap у 2 рази до 1.
 *
 * @module core/algorithms/shellSort
 */

/**
 * Виконує сортування Шелла і повертає кроки для візуалізації.
 *
 * @param {number[]} arr - Вхідний масив чисел (не змінюється)
 * @returns {{ steps: Object[], comparisons: number, swaps: number, executionTimeMs: number }}
 */
export function shellSort(arr) {
  const startTime = performance.now();
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const result = [...arr];
  const n = result.length;

  steps.push({
    array: [...result],
    gap: 0,
    keyIndex: -1,
    comparingWith: -1,
    insertIndex: -1,
    action: 'init',
    comparisons: 0,
    swaps: 0,
  });

  if (n <= 1) {
    steps.push({
      array: [...result],
      gap: 1,
      keyIndex: -1,
      comparingWith: -1,
      insertIndex: -1,
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

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    steps.push({
      array: [...result],
      gap,
      keyIndex: -1,
      comparingWith: -1,
      insertIndex: -1,
      action: 'gap_start',
      comparisons,
      swaps,
    });

    for (let i = gap; i < n; i++) {
      const key = result[i];
      let j = i;

      steps.push({
        array: [...result],
        gap,
        keyIndex: i,
        comparingWith: i - gap,
        insertIndex: i,
        action: 'pick_key',
        comparisons,
        swaps,
      });

      while (j >= gap) {
        comparisons++;
        steps.push({
          array: [...result],
          gap,
          keyIndex: i,
          comparingWith: j - gap,
          insertIndex: j,
          action: 'compare',
          comparisons,
          swaps,
        });

        if (result[j - gap] <= key) break;

        result[j] = result[j - gap];
        swaps++;
        steps.push({
          array: [...result],
          gap,
          keyIndex: i,
          comparingWith: j - gap,
          insertIndex: j,
          action: 'shift',
          comparisons,
          swaps,
        });
        j -= gap;
      }

      result[j] = key;
      if (j !== i) swaps++;
      steps.push({
        array: [...result],
        gap,
        keyIndex: i,
        comparingWith: -1,
        insertIndex: j,
        action: 'insert',
        comparisons,
        swaps,
      });
    }
  }

  steps.push({
    array: [...result],
    gap: 1,
    keyIndex: -1,
    comparingWith: -1,
    insertIndex: -1,
    action: 'complete',
    comparisons,
    swaps,
  });

  const executionTimeMs = performance.now() - startTime;
  return { steps, comparisons, swaps, executionTimeMs };
}
