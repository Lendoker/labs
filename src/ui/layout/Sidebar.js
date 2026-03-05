/**
 * @file Sidebar.js
 * @description Бічна панель навігації по лабораторних роботах.
 * Містить: заголовок, список лабораторних, кнопку теми, кредити.
 *
 * mount(root, { labs, activeId, onSelect, onThemeToggle, onCloseMobile }) — монтує сайдбар в root.
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
  mount(root, { labs, activeId, onSelect, onThemeToggle, onCloseMobile }) {
    const theme = getTheme();
    root.innerHTML = `
      <nav class="w-full h-screen overflow-y-auto bg-white/90 dark:bg-zinc-900/95 backdrop-blur-sm border-r border-purple-200/70 dark:border-purple-900/60 flex flex-col animate-slide-in-left shadow-xl shadow-purple-900/5">
        <div class="p-4 border-b border-purple-200/70 dark:border-purple-900/60">
          <div class="flex items-center justify-between gap-2">
            <h1 class="font-semibold text-lg text-purple-950 dark:text-purple-100 animate-fade-in-up">Лабораторні роботи</h1>
            <button id="mobile-close" class="lg:hidden px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200" aria-label="Закрити меню">✕</button>
          </div>
        </div>
        <ul class="flex-1 p-2 space-y-1">
          ${labs.map(({ id, title }, idx) => `
            <li class="opacity-0 animate-slide-up" style="animation-delay: ${0.1 + idx * 0.05}s; animation-fill-mode: forwards;">
              <button data-lab="${id}" class="lab-link w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ease-out
                hover:scale-[1.02] hover:translate-x-1 active:scale-[0.98]
                ${id === activeId
                  ? 'bg-purple-200/80 dark:bg-purple-700/70 text-purple-950 dark:text-white shadow-inner ring-1 ring-purple-300/70 dark:ring-purple-500/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-purple-100/70 dark:hover:bg-purple-900/35 hover:text-purple-900 dark:hover:text-purple-100'}"
              >
                ${title}
              </button>
            </li>
          `).join('')}
        </ul>
        <div class="p-3 border-t border-purple-200/70 dark:border-purple-900/60 space-y-2">
          <button id="theme-toggle" class="w-full px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-100 text-sm transition-all duration-300 hover:bg-purple-200 dark:hover:bg-purple-800/70 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-purple-500/20" aria-label="Перемкнути тему">
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
      btn.addEventListener('click', () => {
        onSelect(btn.dataset.lab);
        onCloseMobile?.();
      });
    });
    root.querySelector('#mobile-close')?.addEventListener('click', () => onCloseMobile?.());
    // Клік по кнопці теми → onThemeToggle() і оновлення тексту кнопки
    root.querySelector('#theme-toggle').addEventListener('click', () => {
      onThemeToggle();
      const next = getTheme();
      root.querySelector('#theme-toggle').textContent = next === 'dark' ? '☀️ Світла тема' : '🌙 Темна тема';
    });
  },
};
