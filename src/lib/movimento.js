import { browser } from "$app/env";

/**
 * Converte uma cubic-bezier do CSS numa função de easing para as transições
 * do Svelte, para JS e CSS usarem exatamente as mesmas curvas.
 * @param {number} x1 @param {number} y1 @param {number} x2 @param {number} y2
 * @returns {(t: number) => number}
 */
export function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const curvaX = (/** @type {number} */ t) => ((ax * t + bx) * t + cx) * t;
  const curvaY = (/** @type {number} */ t) => ((ay * t + by) * t + cy) * t;
  const derivadaX = (/** @type {number} */ t) => (3 * ax * t + 2 * bx) * t + cx;

  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    // Newton-Raphson, com bisseção de reserva quando a derivada zera.
    let t = x;
    for (let i = 0; i < 8; i++) {
      const erro = curvaX(t) - x;
      if (Math.abs(erro) < 1e-6) return curvaY(t);
      const d = derivadaX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= erro / d;
    }

    let inicio = 0;
    let fim = 1;
    t = x;
    while (inicio < fim) {
      const valor = curvaX(t);
      if (Math.abs(valor - x) < 1e-6) break;
      if (x > valor) inicio = t;
      else fim = t;
      t = (inicio + fim) / 2;
      if (fim - inicio < 1e-6) break;
    }
    return curvaY(t);
  };
}

// Mesmas curvas de --ease-out, --ease-in-out e --ease-drawer do app.css.
export const easeOut = bezier(0.23, 1, 0.32, 1);
export const easeInOut = bezier(0.77, 0, 0.175, 1);
export const easeDrawer = bezier(0.32, 0.72, 0, 1);

export function reduzirMovimento() {
  return browser && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Entrada/saída de elementos pequenos (menus, avisos): leve subida + escala,
 * nunca a partir de scale(0). Com movimento reduzido, vira só um fade.
 * @param {Element} _no
 * @param {{ duracao?: number, y?: number, escala?: number, atraso?: number }} [opcoes]
 */
export function surgir(_no, { duracao = 180, y = 4, escala = 0.97, atraso = 0 } = {}) {
  if (reduzirMovimento()) {
    return { duration: Math.min(duracao, 150), delay: atraso, css: (/** @type {number} */ t) => `opacity: ${t}` };
  }
  return {
    duration: duracao,
    delay: atraso,
    easing: easeOut,
    css: (/** @type {number} */ t) =>
      `opacity: ${t}; transform: translateY(${(1 - t) * y}px) scale(${escala + (1 - escala) * t})`,
  };
}
