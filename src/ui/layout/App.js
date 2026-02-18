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

/** Реєстр лабораторних: id → { title, component } */
const LABS = {
  lab1: { title: 'Лабораторна робота №1', component: Lab1Page },
  lab2: { title: 'Лабораторна робота №2', component: Lab2Page },
  lab3: { title: 'Лабораторна робота №3', component: Lab3Page },
  lab4: { title: 'Лабораторна робота №4', component: Lab4Page },
};

let currentLab = 'lab1';

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
        renderContent();
        mountSidebar();
      }
    },
    onThemeToggle: () => toggleTheme(),
  });
}

/**
 * Ініціалізує додаток: тема, DOM-структура, сайдбар, контент lab1.
 * Викликається з main.js після DOMContentLoaded.
 */
export function initApp() {
  initTheme();
  document.getElementById('app').innerHTML = `
    <div class="animate-mesh-bg"></div>
    <aside id="sidebar-root" class="fixed left-0 top-0 z-10 w-64 h-screen"></aside>
    <main id="content" class="ml-64 flex-1 overflow-auto min-h-screen min-w-0"></main>
  `;
  mountSidebar();
  renderContent();
}
