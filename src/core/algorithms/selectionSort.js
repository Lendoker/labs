/**
 * @file selectionSort.js
 * @description Чиста алгоритмічна реалізація сортування вибором (Selection Sort).
 * Файл повністю ізольований: без DOM, без стилів, без console.log.
 *
 * Алгоритм: на кожній ітерації знаходимо мінімум серед невідсортованих
 * і ставимо його на поточну позицію. Відсортована частина зростає зліва.
 *
 * @module core/algorithms/selectionSort
 */

/**
 * Виконує сортування вибором і повертає кроки для візуалізації.
 *
 * @param {number[]} arr - Вхідний масив чисел (не змінюється)
 * @returns {{ steps: Object[], comparisons: number, swaps: number, executionTimeMs: number }}
 */
export function selectionSort(arr) {
  const startTime = performance.now();
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const result = [...arr];

  // Зовнішній цикл: позиція i — куди ставимо мінімум
  for (let i = 0; i < result.length - 1; i++) {
    let minIdx = i;

    // Крок: обрали поточний елемент як мінімум
    steps.push({
      array: [...result],
      sortedUpTo: i,
      currentMin: minIdx,
      comparingWith: i,
      action: 'select_min',
      comparisons,
      swaps,
    });

    // Внутрішній цикл: шукаємо мінімум серед елементів j = i+1 .. n-1
    for (let j = i + 1; j < result.length; j++) {
      comparisons++;
      // Крок: порівнюємо arr[j] з arr[minIdx]
      steps.push({
        array: [...result],
        sortedUpTo: i,
        currentMin: minIdx,
        comparingWith: j,
        action: 'compare',
        comparisons,
        swaps,
      });

      if (result[j] < result[minIdx]) {
        minIdx = j;
        // Крок: знайшли новий мінімум
        steps.push({
          array: [...result],
          sortedUpTo: i,
          currentMin: minIdx,
          comparingWith: j,
          action: 'new_min',
          comparisons,
          swaps,
        });
      }
    }

    // Обмінюємо arr[i] та arr[minIdx], якщо потрібно
    if (minIdx !== i) {
      [result[i], result[minIdx]] = [result[minIdx], result[i]];
      swaps++;
      steps.push({
        array: [...result],
        sortedUpTo: i + 1,
        currentMin: -1,
        comparingWith: -1,
        action: 'swap',
        comparisons,
        swaps,
      });
    } else {
      // Мінімум уже на місці — перестановки немає
      steps.push({
        array: [...result],
        sortedUpTo: i + 1,
        currentMin: -1,
        comparingWith: -1,
        action: 'no_swap',
        comparisons,
        swaps,
      });
    }
  }

  // Фінальний крок: масив повністю відсортований
  steps.push({
    array: [...result],
    sortedUpTo: result.length,
    currentMin: -1,
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
