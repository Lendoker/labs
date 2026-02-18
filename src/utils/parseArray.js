/**
 * @file parseArray.js
 * @description Утиліти для парсингу та генерації масивів чисел.
 * Використовуються для валідації введення користувача та створення випадкових даних.
 */

/**
 * Перетворює рядок у масив чисел з валідацією.
 * Підтримує роздільники: кома, пробіл, комбінація.
 *
 * @param {string} input - Рядок, напр. "5, 3, 8" або "5 3 8"
 * @returns {{ success: true, data: number[] } | { success: false, error: string }}
 */
export function parseArrayInput(input) {
  const trimmed = String(input).trim();
  if (!trimmed) {
    return { success: false, error: 'Введіть числа через кому або пробіл.' };
  }

  // Розбиваємо по пробілах або комах
  const parts = trimmed.split(/[\s,]+/).filter(Boolean);
  const numbers = [];

  for (const part of parts) {
    const num = Number(part);
    if (!Number.isFinite(num)) {
      return { success: false, error: `"${part}" не є числом.` };
    }
    numbers.push(num);
  }

  if (numbers.length === 0) {
    return { success: false, error: 'Масив не може бути порожнім.' };
  }

  return { success: true, data: numbers };
}

/**
 * Генерує масив випадкових цілих чисел.
 *
 * @param {number} length - Кількість елементів
 * @param {number} min - Мінімальне значення (включно)
 * @param {number} max - Максимальне значення (включно)
 * @returns {number[]}
 */
export function generateRandomArray(length = 10, min = 1, max = 100) {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return arr;
}

/**
 * Генерує масив випадкових цілих чисел з розширеними опціями.
 *
 * @param {Object} options - Опції генерації
 * @param {number} options.length - Кількість елементів
 * @param {number} options.min - Мінімальне значення (включно)
 * @param {number} options.max - Максимальне значення (включно)
 * @param {boolean} options.allowDuplicates - Чи дозволені повторення чисел (за замовчуванням true)
 * @returns {number[]}
 */
export function generateRandomArrayAdvanced({ length = 10, min = 1, max = 100, allowDuplicates = true }) {
  // Якщо дозволені повторення, використовуємо просту генерацію
  if (allowDuplicates) {
    return generateRandomArray(length, min, max);
  }

  // Якщо повторення заборонені, перевіряємо можливість генерації
  const range = max - min + 1;
  if (length > range) {
    // Якщо потрібно більше елементів, ніж можливих унікальних значень, дозволяємо повторення
    return generateRandomArray(length, min, max);
  }

  // Генеруємо унікальні числа
  const arr = [];
  const used = new Set();
  
  while (arr.length < length) {
    const num = Math.floor(Math.random() * range) + min;
    if (!used.has(num)) {
      used.add(num);
      arr.push(num);
    }
  }

  // Перемішуємо масив для випадковості порядку
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}
