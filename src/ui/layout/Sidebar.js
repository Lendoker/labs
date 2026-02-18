/**
 * @file Sidebar.js
 * @description Бічна панель навігації по лабораторних роботах.
 * Містить: заголовок, список лабораторних, кнопку теми, кредити.
 *
 * mount(root, { labs, activeId, onSelect, onThemeToggle }) — монтує сайдбар в root.
 * labs: [{ id, title }]
 * activeId: id активної лабораторної (підсвічується)
 * onSelect(id): callback при кліку на пункт
 * onThemeToggle(): callback при кліку на кнопку теми
 */

import { getTheme } from '../../utils/theme.js';

export const Sidebar = {
  /**
   * Монтує сайдбар в DOM.
   * @param {HTMLElement} root - Контейнер (aside#sidebar-root)
   * @param {Object} opts - labs, activeId, onSelect, onThemeToggle
   */
  mount(root, { labs, activeId, onSelect, onThemeToggle }) {
    const theme = getTheme();
    root.innerHTML = `
      <nav class="w-64 h-screen overflow-y-auto bg-white/90 dark:bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-200 dark:border-zinc-800 flex flex-col animate-slide-in-left shadow-xl">
        <div class="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 class="font-semibold text-lg animate-fade-in-up">Лабораторні роботи</h1>
        </div>
        <ul class="flex-1 p-2 space-y-1">
          ${labs.map(({ id, title }, idx) => `
            <li class="opacity-0 animate-slide-up" style="animation-delay: ${0.1 + idx * 0.05}s; animation-fill-mode: forwards;">
              <button data-lab="${id}" class="lab-link w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ease-out
                hover:scale-[1.02] hover:translate-x-1 active:scale-[0.98]
                ${id === activeId
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-inner'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}"
              >
                ${title}
              </button>
            </li>
          `).join('')}
        </ul>
        <div class="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <button id="theme-toggle" class="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm transition-all duration-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg" aria-label="Перемкнути тему">
            ${theme === 'dark' ? '☀️ Світла тема' : '🌙 Темна тема'}
          </button>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 text-center credits-text pt-1">
            Створено Студентом групи ІПЗ-22, Пінкевич Артем
          </p>
        </div>
      </nav>
    `;

    // Клік по пункту лабораторної → onSelect(id)
    root.querySelectorAll('.lab-link').forEach((btn) => {
      btn.addEventListener('click', () => onSelect(btn.dataset.lab));
    });
    // Клік по кнопці теми → onThemeToggle() і оновлення тексту кнопки
    root.querySelector('#theme-toggle').addEventListener('click', () => {
      onThemeToggle();
      const next = getTheme();
      root.querySelector('#theme-toggle').textContent = next === 'dark' ? '☀️ Світла тема' : '🌙 Темна тема';
    });
  },
};
