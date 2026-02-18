/**
 * @file main.js
 * @description Точка входу додатку.
 * Чекає події DOMContentLoaded і викликає initApp() з App.js,
 * який створює layout (сайдбар + контент) та монтує лабораторну №1.
 */

import { initApp } from './ui/layout/App.js';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
