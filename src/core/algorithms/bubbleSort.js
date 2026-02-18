/**
 * @file bubbleSort.js
 * @description Чиста алгоритмічна реалізація сортування бульбашкою (Bubble Sort).
 * Файл повністю ізольований: без DOM, без стилів, без console.log.
 *
 * Алгоритм: порівнюємо попарно сусідні елементи масиву і міняємо їх місцями,
 * якщо вони розташовані в неправильному порядку. На кожній ітерації зовнішнього
 * циклу найбільший елемент "спливає" до кінця масиву, як бульбашка.
 *
 * @module core/algorithms/bubbleSort
 */

/**
 * Виконує сортування бульбашкою і повертає кроки для візуалізації.
 *
 * Алгоритм працює наступним чином:
 * 1. Зовнішній цикл (j) виконується size разів - кожна ітерація "виштовхує"
 *    найбільший елемент на свою правильну позицію в кінці масиву.
 * 2. Внутрішній цикл (i) проходить по масиву від початку до size-1-j,
 *    порівнюючи кожну пару сусідніх елементів.
 * 3. Якщо наступний елемент менший за попередній (a[i+1] < a[i]),
 *    вони міняються місцями через тимчасову змінну tmp.
 *
 * @param {number[]} arr - Вхідний масив чисел (не змінюється)
 * @returns {{ steps: Object[], comparisons: number, swaps: number, executionTimeMs: number }}
 */
export function bubbleSort(arr) {
  const startTime = performance.now();
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const result = [...arr]; // Створюємо копію масиву, щоб не змінювати оригінал
  const size = result.length;

  // Початковий стан масиву перед сортуванням
  steps.push({
    array: [...result],
    comparingWith: -1,
    comparingWithNext: -1,
    action: 'init',
    comparisons: 0,
    swaps: 0,
  });

  // Зовнішній цикл: j від 0 до size-1
  // Кожна ітерація "виштовхує" найбільший елемент на позицію size-1-j
  // Після j ітерацій останні j елементів вже відсортовані
  for (let j = 0; j < size; j++) {
    // Внутрішній цикл: i від 0 до size-2-j
    // Порівнюємо пари сусідніх елементів: a[i] та a[i+1]
    // size-1-j замість size-1, бо після j ітерацій останні j елементів вже на місці
    for (let i = 0; i < size - 1 - j; i++) {
      comparisons++; // Збільшуємо лічильник порівнянь

      // Крок: порівнюємо поточну пару елементів
      steps.push({
        array: [...result],
        comparingWith: i,
        comparingWithNext: i + 1,
        action: 'compare',
        comparisons,
        swaps,
      });

      // Якщо наступний елемент менший за поточний, міняємо їх місцями
      if (result[i + 1] < result[i]) {
        // Використовуємо тимчасову змінну tmp для збереження значення a[i+1]
        // Це необхідно, бо після присвоєння a[i+1] = a[i] значення a[i+1] буде втрачено
        const tmp = result[i + 1];

        // Переміщуємо більший елемент на позицію i+1
        result[i + 1] = result[i];

        // Переміщуємо менший елемент на позицію i
        result[i] = tmp;

        swaps++; // Збільшуємо лічильник перестановок

        // Крок: відбулася перестановка елементів
        steps.push({
          array: [...result],
          comparingWith: i,
          comparingWithNext: i + 1,
          action: 'swap',
          comparisons,
          swaps,
        });
      }
    }

    // Крок: завершено одну ітерацію зовнішнього циклу
    // Останній елемент на позиції size-1-j тепер найбільший серед невідсортованих
    steps.push({
      array: [...result],
      comparingWith: -1,
      comparingWithNext: -1,
      action: 'pass_complete',
      comparisons,
      swaps,
    });
  }

  // Фінальний крок: масив повністю відсортований
  steps.push({
    array: [...result],
    comparingWith: -1,
    comparingWithNext: -1,
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
