/**
 * @file linearSearch.js
 * @description Лінійний пошук у масиві з кроками для візуалізації.
 */

/**
 * Класичний лінійний пошук.
 * Послідовно порівнює кожен елемент із target.
 *
 * @param {number[]} arr
 * @param {number} target
 * @returns {{steps: Object[], comparisons: number, foundIndex: number, executionTimeMs: number}}
 */
export function linearSearch(arr, target) {
  const startTime = performance.now();
  const steps = [];
  let comparisons = 0;
  let foundIndex = -1;
  const data = [...arr];

  steps.push({
    array: [...data],
    currentIndex: -1,
    targetIndex: -1,
    action: 'init',
    comparisons: 0,
  });

  for (let i = 0; i < data.length; i++) {
    comparisons++;
    steps.push({
      array: [...data],
      currentIndex: i,
      targetIndex: -1,
      action: 'compare',
      comparisons,
    });

    if (data[i] === target) {
      foundIndex = i;
      steps.push({
        array: [...data],
        currentIndex: i,
        targetIndex: i,
        action: 'found',
        comparisons,
      });
      break;
    }
  }

  if (foundIndex === -1) {
    steps.push({
      array: [...data],
      currentIndex: -1,
      targetIndex: -1,
      action: 'not_found',
      comparisons,
    });
  }

  const executionTimeMs = performance.now() - startTime;
  return { steps, comparisons, foundIndex, executionTimeMs };
}
