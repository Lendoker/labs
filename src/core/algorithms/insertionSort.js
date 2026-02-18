/**
 * @file insertionSort.js
 * @description Чиста алгоритмічна реалізація сортування включенням (Insertion Sort).
 * Файл повністю ізольований: без DOM, без стилів, без console.log.
 *
 * Алгоритм: масив розділяється на відсортовану (зліва) і невідсортовану (справа).
 * На кожному кроці беремо елемент з невідсортованої частини і вставляємо його
 * на правильне місце у відсортовану шляхом порівнянь і зсувів вправо.
 *
 * @module core/algorithms/insertionSort
 */

/**
 * Виконує сортування включенням і повертає кроки для візуалізації.
 *
 * @param {number[]} arr - Вхідний масив чисел (не змінюється)
 * @returns {{ steps: Object[], comparisons: number, swaps: number, executionTimeMs: number }}
 */
export function insertionSort(arr) {
  const startTime = performance.now();
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const result = [...arr];

  // Масив з 0 або 1 елементом вже відсортований
  if (result.length <= 1) {
    steps.push({
      array: [...result],
      sortedUpTo: result.length,
      keyIndex: -1,
      comparingWith: -1,
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

  // Початковий стан: перший елемент вважаємо відсортованою частиною
  steps.push({
    array: [...result],
    sortedUpTo: 1,
    keyIndex: -1,
    comparingWith: -1,
    action: 'init',
    comparisons: 0,
    swaps: 0,
  });

  // j — індекс елемента, який вставляємо; sortedUpTo = j
  for (let j = 1; j < result.length; j++) {
    const key = result[j];
    let i = j - 1;

    // Крок: беремо елемент arr[j] для вставки (key)
    steps.push({
      array: [...result],
      sortedUpTo: j,
      keyIndex: j,
      comparingWith: i,
      action: 'pick_key',
      comparisons,
      swaps,
    });

    // Внутрішній цикл: порівнюємо key з елементами відсортованої частини справа наліво
    while (i >= 0) {
      comparisons++;
      // Крок: порівняння arr[i] з key
      steps.push({
        array: [...result],
        sortedUpTo: j,
        keyIndex: j,
        comparingWith: i,
        action: 'compare',
        comparisons,
        swaps,
      });

      if (result[i] <= key) break;

      // Зсув елемента вправо: arr[i+1] = arr[i]
      result[i + 1] = result[i];
      swaps++;
      steps.push({
        array: [...result],
        sortedUpTo: j,
        keyIndex: j,
        comparingWith: i,
        action: 'shift',
        comparisons,
        swaps,
      });

      i--;
    }

    // Вставка key на знайдену позицію arr[i+1]
    result[i + 1] = key;
    steps.push({
      array: [...result],
      sortedUpTo: j + 1,
      keyIndex: i + 1,
      comparingWith: -1,
      action: 'insert',
      comparisons,
      swaps,
    });
  }

  // Фінальний крок: масив повністю відсортований
  steps.push({
    array: [...result],
    sortedUpTo: result.length,
    keyIndex: -1,
    comparingWith: -1,
    action: 'complete',
    comparisons,
    swaps,
  });

  const executionTimeMs = performance.now() - startTime;

  return {
    steps,
    comparisons,
    swaps,
    executionTimeMs,
  };
}
