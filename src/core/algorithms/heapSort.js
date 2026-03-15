/**
 * @file heapSort.js
 * @description Чиста алгоритмічна реалізація пірамідального сортування (Heap Sort).
 * Файл повністю ізольований: без DOM, без стилів, без console.log.
 *
 * Алгоритм:
 * - Будуємо max-heap (батько >= діти).
 * - Міняємо місцями корінь (максимум) з останнім елементом heap.
 * - Зменшуємо розмір heap і відновлюємо властивість піраміди (sift down).
 *
 * @module core/algorithms/heapSort
 */

/**
 * Виконує пірамідальне сортування і повертає кроки для візуалізації.
 *
 * @param {number[]} arr - Вхідний масив чисел (не змінюється)
 * @returns {{ steps: Object[], comparisons: number, swaps: number, executionTimeMs: number }}
 */
export function heapSort(arr) {
  const startTime = performance.now();
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const result = [...arr];
  const n = result.length;

  steps.push({
    array: [...result],
    heapSize: n,
    current: -1,
    leftIdx: -1,
    rightIdx: -1,
    largest: -1,
    sortedFrom: n,
    action: 'init',
    comparisons: 0,
    swaps: 0,
  });

  function snapshot(state) {
    steps.push({
      array: [...result],
      heapSize: state.heapSize,
      current: state.current,
      leftIdx: state.leftIdx,
      rightIdx: state.rightIdx,
      largest: state.largest,
      sortedFrom: state.sortedFrom,
      action: state.action,
      comparisons,
      swaps,
    });
  }

  function heapify(heapSize, rootIndex, sortedFrom) {
    let largest = rootIndex;

    while (true) {
      const leftIdx = 2 * largest + 1;
      const rightIdx = 2 * largest + 2;
      let nextLargest = largest;

      snapshot({
        heapSize,
        current: largest,
        leftIdx,
        rightIdx,
        largest: nextLargest,
        sortedFrom,
        action: 'heapify_step',
      });

      if (leftIdx < heapSize) {
        comparisons++;
        snapshot({
          heapSize,
          current: largest,
          leftIdx,
          rightIdx,
          largest: nextLargest,
          sortedFrom,
          action: 'compare_left',
        });
        if (result[leftIdx] > result[nextLargest]) nextLargest = leftIdx;
      }

      if (rightIdx < heapSize) {
        comparisons++;
        snapshot({
          heapSize,
          current: largest,
          leftIdx,
          rightIdx,
          largest: nextLargest,
          sortedFrom,
          action: 'compare_right',
        });
        if (result[rightIdx] > result[nextLargest]) nextLargest = rightIdx;
      }

      if (nextLargest === largest) break;

      [result[largest], result[nextLargest]] = [result[nextLargest], result[largest]];
      swaps++;
      snapshot({
        heapSize,
        current: largest,
        leftIdx,
        rightIdx,
        largest: nextLargest,
        sortedFrom,
        action: 'swap',
      });
      largest = nextLargest;
    }
  }

  // Будуємо max-heap.
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i, n);
  }

  // Виймаємо максимум і ставимо в кінець.
  for (let end = n - 1; end > 0; end--) {
    [result[0], result[end]] = [result[end], result[0]];
    swaps++;
    snapshot({
      heapSize: end,
      current: 0,
      leftIdx: 1,
      rightIdx: 2,
      largest: end,
      sortedFrom: end,
      action: 'extract_max',
    });
    heapify(end, 0, end);
  }

  steps.push({
    array: [...result],
    heapSize: 0,
    current: -1,
    leftIdx: -1,
    rightIdx: -1,
    largest: -1,
    sortedFrom: 0,
    action: 'complete',
    comparisons,
    swaps,
  });

  const executionTimeMs = performance.now() - startTime;
  return { steps, comparisons, swaps, executionTimeMs };
}
