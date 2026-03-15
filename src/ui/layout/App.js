/**
 * @file App.js
 * @description Головний layout додатку: бокова панель (fixed) + контент лабораторної роботи.
 * Відповідає за маршрутизацію між лабораторними (lab1, lab2, …).
 *
 * Структура:
 * - LABS: реєстр лабораторних (id → { title, component })
 * - currentLab: активна лабораторна
 * - mountSidebar(): рендер бокової панелі з пунктами меню
 * - renderContent(): монтує відповідний Lab*Page в #content
 * - onSelect(id): при кліку на пункт — зміна currentLab, перемальовка сайдбару і контенту
 */

import '../styles/main.css';
import { initTheme, toggleTheme } from '../../utils/theme.js';
import { Sidebar } from './Sidebar.js';
import { Lab1Page } from '../components/Lab1Page.js';
import { Lab2Page } from '../components/Lab2Page.js';
import { Lab3Page } from '../components/Lab3Page.js';
import { Lab4Page } from '../components/Lab4Page.js';
import { Lab5Page } from '../components/Lab5Page.js';
import { Lab6Page } from '../components/Lab6Page.js';
import { Lab7Page } from '../components/Lab7Page.js';
import { Lab8Page } from '../components/Lab8Page.js';

/** Реєстр лабораторних: id → { title, component } */
const LABS = {
  lab1: { title: 'Лабораторна робота №1', component: Lab1Page },
  lab2: { title: 'Лабораторна робота №2', component: Lab2Page },
  lab3: { title: 'Лабораторна робота №3', component: Lab3Page },
  lab4: { title: 'Лабораторна робота №4', component: Lab4Page },
  lab5: { title: 'Лабораторна робота №5', component: Lab5Page },
  lab6: { title: 'Лабораторна робота №6', component: Lab6Page },
  lab7: { title: 'Лабораторна робота №7', component: Lab7Page },
  lab8: { title: 'Лабораторна робота №8', component: Lab8Page },
};

let currentLab = 'lab1';
let isMobileSidebarOpen = false;

/**
 * Рендерить контент поточної лабораторної в #content.
 * Очищає контейнер і монтує відповідний Lab*Page компонент.
 */
function renderContent() {
  const container = document.getElementById('content');
  if (!container) return;
  container.innerHTML = '';
  const LabComponent = LABS[currentLab]?.component;
  if (LabComponent) LabComponent.mount(container);
  // Єдиний "скін" для всіх лабораторних сторінок: робимо інтерфейс більш цілісним.
  container.firstElementChild?.classList.add('lab-page-shell');
  updateMobileHeader();
}

/**
 * Монтує бокову панель з пунктами лабораторних і кнопкою теми.
 * При виборі лабораторної: оновлює currentLab, перемальовує сайдбар і контент.
 */
function mountSidebar() {
  Sidebar.mount(document.getElementById('sidebar-root'), {
    labs: Object.entries(LABS).map(([id, { title }]) => ({ id, title })),
    activeId: currentLab,
    onSelect: (id) => {
      if (LABS[id]) {
        currentLab = id;
        isMobileSidebarOpen = false;
        renderContent();
        mountSidebar();
      }
    },
    onThemeToggle: () => toggleTheme(),
    onCloseMobile: () => {
      isMobileSidebarOpen = false;
      updateMobileSidebarState();
    },
  });
  updateMobileSidebarState();
}

function updateMobileHeader() {
  const titleEl = document.getElementById('mobile-current-lab');
  if (titleEl) titleEl.textContent = LABS[currentLab]?.title ?? 'Лабораторна робота';
}

function updateMobileSidebarState() {
  const sidebarRoot = document.getElementById('sidebar-root');
  const overlay = document.getElementById('mobile-overlay');
  const menuBtn = document.getElementById('mobile-menu-toggle');
  if (!sidebarRoot || !overlay) return;

  sidebarRoot.className = `fixed top-0 left-0 z-40 h-screen w-72 max-w-[85vw] transform transition-transform duration-300 ease-out lg:w-64 lg:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`;
  overlay.className = `fixed inset-0 z-30 bg-black/35 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`;
  if (menuBtn) menuBtn.setAttribute('aria-expanded', String(isMobileSidebarOpen));
}

/**
 * Ініціалізує додаток: тема, DOM-структура, сайдбар, контент lab1.
 * Викликається з main.js після DOMContentLoaded.
 */
export function initApp() {
  initTheme();
  document.getElementById('app').innerHTML = `
    <div class="animate-mesh-bg"></div>
    <header class="lg:hidden sticky top-0 z-20 border-b border-purple-200/70 dark:border-purple-900/60 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <button id="mobile-menu-toggle" class="btn-animated px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200" aria-label="Відкрити меню" aria-expanded="false">☰ Меню</button>
        <div id="mobile-current-lab" class="text-sm font-semibold text-purple-900 dark:text-purple-100 truncate"></div>
      </div>
    </header>
    <div id="mobile-overlay"></div>
    <aside id="sidebar-root"></aside>
    <main id="content" class="lg:ml-64 flex-1 overflow-auto min-h-screen min-w-0 px-2 sm:px-3 lg:px-0"></main>
  `;

  document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
    isMobileSidebarOpen = !isMobileSidebarOpen;
    updateMobileSidebarState();
  });
  document.getElementById('mobile-overlay')?.addEventListener('click', () => {
    isMobileSidebarOpen = false;
    updateMobileSidebarState();
  });

  updateMobileHeader();
  mountSidebar();
  renderContent();
}
