/**
 * @file binarySearch.js
 * @description Двійковий пошук у відсортованому масиві з кроками.
 */

/**
 * Виконує двійковий пошук target у ВІДСОРТОВАНОМУ масиві.
 *
 * @param {number[]} sortedArr
 * @param {number} target
 * @returns {{steps: Object[], comparisons: number, foundIndex: number, executionTimeMs: number}}
 */
export function binarySearch(sortedArr, target) {
  const startTime = performance.now();
  const steps = [];
  let comparisons = 0;
  let foundIndex = -1;
  const data = [...sortedArr];

  let low = 0;
  let high = data.length - 1;

  steps.push({
    array: [...data],
    low,
    high,
    mid: -1,
    foundIndex: -1,
    action: 'init',
    comparisons: 0,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    comparisons++;

    steps.push({
      array: [...data],
      low,
      high,
      mid,
      foundIndex: -1,
      action: 'compare_mid',
      comparisons,
    });

    if (data[mid] === target) {
      foundIndex = mid;
      steps.push({
        array: [...data],
        low,
        high,
        mid,
        foundIndex,
        action: 'found',
        comparisons,
      });
      break;
    }

    if (data[mid] < target) {
      low = mid + 1;
      steps.push({
        array: [...data],
        low,
        high,
        mid,
        foundIndex: -1,
        action: 'move_right',
        comparisons,
      });
    } else {
      high = mid - 1;
      steps.push({
        array: [...data],
        low,
        high,
        mid,
        foundIndex: -1,
        action: 'move_left',
        comparisons,
      });
    }
  }

  if (foundIndex === -1) {
    steps.push({
      array: [...data],
      low,
      high,
      mid: -1,
      foundIndex: -1,
      action: 'not_found',
      comparisons,
    });
  }

  const executionTimeMs = performance.now() - startTime;
  return { steps, comparisons, foundIndex, executionTimeMs };
}
