/**
 * @file linearSearchBarrier.js
 * @description Лінійний пошук з бар'єром (sentinel) для візуалізації.
 */

/**
 * Лінійний пошук з бар'єром.
 * Додає target в кінець масиву як бар'єр і завершує цикл при першому збігу.
 *
 * @param {number[]} arr
 * @param {number} target
 * @returns {{steps: Object[], comparisons: number, foundIndex: number, executionTimeMs: number}}
 */
export function linearSearchWithBarrier(arr, target) {
  const startTime = performance.now();
  const steps = [];
  let comparisons = 0;
  let foundIndex = -1;

  const original = [...arr];
  const data = [...arr, target];
  const barrierIndex = data.length - 1;
  let i = 0;

  steps.push({
    array: [...data],
    currentIndex: -1,
    barrierIndex,
    targetIndex: -1,
    action: 'init_with_barrier',
    comparisons: 0,
  });

  while (true) {
    comparisons++;
    steps.push({
      array: [...data],
      currentIndex: i,
      barrierIndex,
      targetIndex: -1,
      action: 'compare',
      comparisons,
    });

    if (data[i] === target) break;
    i++;
  }

  if (i < original.length) {
    foundIndex = i;
    steps.push({
      array: [...data],
      currentIndex: i,
      barrierIndex,
      targetIndex: i,
      action: 'found',
      comparisons,
    });
  } else {
    steps.push({
      array: [...data],
      currentIndex: i,
      barrierIndex,
      targetIndex: -1,
      action: 'hit_barrier_not_found',
      comparisons,
    });
  }

  const executionTimeMs = performance.now() - startTime;
  return { steps, comparisons, foundIndex, executionTimeMs };
}
