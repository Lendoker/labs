/**
 * @file theme.js
 * @description Утиліти для перемикання світлої/темної теми.
 * Зберігає вибір у localStorage, підтримує системні налаштування (prefers-color-scheme).
 */

const STORAGE_KEY = 'logic-labs-theme';

/**
 * Повертає поточну тему.
 * Пріоритет: localStorage → системні налаштування → light.
 *
 * @returns {'light'|'dark'}
 */
export function getTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

/**
 * Встановлює тему та застосовує клас .dark до <html>.
 *
 * @param {'light'|'dark'} theme
 */
export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

/**
 * Перемикає тему на протилежну і повертає нову.
 *
 * @returns {'light'|'dark'}
 */
export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/**
 * Ініціалізує тему при завантаженні сторінки.
 * Викликається з main.js / App.js.
 */
export function initTheme() {
  setTheme(getTheme());
}
