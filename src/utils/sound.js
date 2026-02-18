/**
 * @file sound.js
 * @description Звукові ефекти для візуалізації сортування (Web Audio API).
 * Легкі тики на кожному кроці та мелодія при завершенні.
 * Не потребує зовнішніх аудіофайлів.
 */

let audioCtx = null;

/**
 * Повертає єдиний екземпляр AudioContext (лінива ініціалізація).
 * Потрібен користувацький клік перед першим звуком (політика autoplay).
 */
function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Короткий звук "тик" на кожному кроці сортування.
 *
 * @param {number} [freq=600] - Частота в Гц
 * @param {number} [duration=0.03] - Тривалість у секундах
 */
export function playSortTick(freq = 600, duration = 0.03) {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ігноруємо помилки (наприклад, autoplay policy)
  }
}

/**
 * Звук завершення сортування: три ноти вгору (C5, E5, G5).
 */
export function playSortComplete() {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ігноруємо помилки
  }
}
