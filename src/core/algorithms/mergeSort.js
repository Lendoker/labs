/**
 * @file mergeSort.js
 * @description Чиста алгоритмічна реалізація сортування злиттям (Merge Sort).
 * Файл повністю ізольований: без DOM, без стилів, без console.log.
 *
 * Алгоритм використовує ітеративний (bottom-up) підхід:
 * 1. Знаходимо середину масиву
 * 2. Використовуємо змінну h (крок) для визначення відстані між елементами
 * 3. На кожній ітерації подвоюємо h і зливаємо підмасиви розміром h
 * 4. Процес продовжується, поки h < n
 *
 * @module core/algorithms/mergeSort
 */

/**
 * Виконує сортування злиттям (ітеративний підхід) і повертає кроки для візуалізації.
 *
 * Алгоритм працює наступним чином:
 * 1. Знаходимо середину масиву (mid)
 * 2. Ініціалізуємо крок h = 1 та тимчасовий масив c для збереження відсортованих даних
 * 3. Зовнішній цикл: подвоюємо h на кожній ітерації, поки h < n
 * 4. Внутрішній цикл: зливаємо підмасиви розміром step = h
 * 5. Порівнюємо елементи з індексами i та j, копіюємо менший у тимчасовий масив
 * 6. Копіюємо залишкові елементи з обох підмасивів
 * 7. Копіюємо відсортовані дані з тимчасового масиву назад у вихідний
 *
 * @param {number[]} arr - Вхідний масив чисел (не змінюється)
 * @returns {{ steps: Object[], comparisons: number, swaps: number, executionTimeMs: number }}
 */
export function mergeSort(arr) {
  const startTime = performance.now();
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const result = [...arr]; // Створюємо копію масиву, щоб не змінювати оригінал
  const n = result.length;

  // Початковий стан масиву перед сортуванням
  steps.push({
    array: [...result],
    h: 0,
    step: 0,
    i: -1,
    j: -1,
    k: -1,
    action: 'init',
    comparisons: 0,
    swaps: 0,
  });

  // Якщо масив порожній або містить один елемент, він вже відсортований
  if (n <= 1) {
    steps.push({
      array: [...result],
      h: 0,
      step: 0,
      i: -1,
      j: -1,
      k: -1,
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

  // 2. Ініціалізація кроку для злиття
  // h визначає розмір підмасивів, які зливаються на поточній ітерації
  let h = 1;

  // Виділення пам'яті для тимчасового масиву, де зберігаються відсортовані дані
  const temp = new Array(n);

  // 3. Зовнішній цикл керує процесом злиття та подвоюванням кроку до завершення сортування
  // Крок подвоюється на кожній ітерації (h = 1, 2, 4, 8, ...)
  // h визначає розмір підмасивів, які зливаються на кожному кроці
  while (h < n) {
    // Крок: початок нової ітерації зовнішнього циклу
    steps.push({
      array: [...result],
      h: h,
      step: 0,
      i: -1,
      j: -1,
      k: -1,
      action: 'outer_loop_start',
      comparisons,
      swaps,
    });

    // 4. Внутрішній цикл виконує саме злиття
    // Проходимо по масиву з кроком 2*h, зливаючи пари підмасивів розміром h
    let left = 0;
    
    while (left < n) {
      // Визначаємо межі двох підмасивів для злиття
      const mid = Math.min(left + h, n); // Кінець першого підмасиву
      const right = Math.min(left + 2 * h, n); // Кінець другого підмасиву
      
      // Ініціалізація індексів для злиття поточної пари підмасивів
      let i = left; // Індекс поточного елемента в першому підмасиві
      let j = mid; // Індекс поточного елемента в другому підмасиві
      let k = left; // Індекс, за яким буде зберігатися елемент у тимчасовому масиві

      // Крок: початок злиття двох підмасивів
      steps.push({
        array: [...result],
        h: h,
        step: left,
        i: i,
        j: j,
        k: k,
        action: 'merge_start',
        comparisons,
        swaps,
      });

      // Порівнюємо та об'єднуємо елементи з обох підмасивів
      while (i < mid && j < right) {
        comparisons++; // Збільшуємо лічильник порівнянь

        // Крок: порівняння елементів result[i] та result[j]
        steps.push({
          array: [...result],
          h: h,
          step: left,
          i: i,
          j: j,
          k: k,
          action: 'compare',
          comparisons,
          swaps,
        });

        // Якщо елемент першого підмасиву менший або дорівнює елементу другого підмасиву
        if (result[i] <= result[j]) {
          // Копіюємо менший елемент (з першого підмасиву) у тимчасовий масив
          temp[k] = result[i];
          i++; // Переходимо до наступного елемента першого підмасиву
        } else {
          // Копіюємо менший елемент (з другого підмасиву) у тимчасовий масив
          temp[k] = result[j];
          j++; // Переходимо до наступного елемента другого підмасиву
        }
        k++; // Переходимо до наступної позиції в тимчасовому масиві
        swaps++; // Збільшуємо лічильник перестановок

        // Крок: копіювання елемента у тимчасовий масив
        steps.push({
          array: [...result],
          h: h,
          step: left,
          i: i,
          j: j,
          k: k,
          action: 'copy',
          comparisons,
          swaps,
        });
      }

      // 5. Копіюємо залишкові елементи з першого підмасиву (від індексу i до mid)
      while (i < mid) {
        temp[k] = result[i];
        i++;
        k++;
        swaps++;

        // Крок: копіювання залишкового елемента з першого підмасиву
        steps.push({
          array: [...result],
          h: h,
          step: left,
          i: i,
          j: j,
          k: k,
          action: 'copy_remaining_left',
          comparisons,
          swaps,
        });
      }

      // 6. Копіюємо залишкові елементи з другого підмасиву (від індексу j до right)
      while (j < right) {
        temp[k] = result[j];
        j++;
        k++;
        swaps++;

        // Крок: копіювання залишкового елемента з другого підмасиву
        steps.push({
          array: [...result],
          h: h,
          step: left,
          i: i,
          j: j,
          k: k,
          action: 'copy_remaining_right',
          comparisons,
          swaps,
        });
      }

      // Переходимо до наступної пари підмасивів
      left = left + 2 * h;

      // Крок: завершення поточного кроку злиття
      steps.push({
        array: [...result],
        h: h,
        step: left,
        i: -1,
        j: -1,
        k: -1,
        action: 'merge_step_complete',
        comparisons,
        swaps,
      });
    }

    // 7. Копіюємо відсортовані дані з тимчасового масиву temp назад у вихідний масив result
    for (let i = 0; i < n; i++) {
      result[i] = temp[i];
    }

    // 8. Змінну h збільшуємо вдвічі, щоб збільшити розмір підмасивів для наступного кроку злиття
    h = h * 2;

    // Крок: завершення ітерації зовнішнього циклу
    steps.push({
      array: [...result],
      h: h,
      step: 0,
      i: -1,
      j: -1,
      k: -1,
      action: 'copy_back',
      comparisons,
      swaps,
    });
  }

  // Фінальний крок: масив повністю відсортований
  steps.push({
    array: [...result],
    h: h,
    step: 0,
    i: -1,
    j: -1,
    k: -1,
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
