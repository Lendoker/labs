/**
 * @file graph.js
 * @description Представлення графа у вигляді матриці суміжності та похідні
 *   операції: довідкова інформація (тип, ребра, петлі, степені, зв’язність),
 *   список суміжності, а також алгоритми обходу DFS і BFS зі збереженням
 *   покрокових подій для візуалізації.
 */

/**
 * Парсить введену користувачем матрицю. Підтримує роздільники: пробіли, табуляції,
 * коми, крапка з комою. Кожен рядок — окремий рядок матриці. Кидає Error, якщо
 * матриця не квадратна або містить нечислові значення.
 * @returns {number[][]}
 */
export function parseMatrixText(text) {
  const rows = String(text ?? '').split(/\r?\n/).map((r) => r.trim()).filter(Boolean);
  if (!rows.length) throw new Error('Матриця порожня.');
  const matrix = rows.map((row) => {
    const cells = row.split(/[\s,;]+/).filter(Boolean).map(Number);
    if (cells.some((c) => Number.isNaN(c))) throw new Error('У матриці є нечислові значення.');
    return cells;
  });
  const n = matrix.length;
  if (matrix.some((r) => r.length !== n)) throw new Error('Матриця не квадратна.');
  return matrix;
}

export function isSymmetric(a) {
  const n = a.length;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (a[i][j] !== a[j][i]) return false;
  return true;
}

export function isUnweightedLike(a) {
  for (const row of a) for (const v of row) if (!(v === 0 || v === 1)) return false;
  return true;
}

export function hasLoops(a) {
  for (let i = 0; i < a.length; i++) if (a[i][i] !== 0) return true;
  return false;
}

export function hasNegative(a) {
  for (const row of a) for (const v of row) if (v < 0) return true;
  return false;
}

export function countEdges(a, directed) {
  const n = a.length;
  let m = 0;
  if (directed) {
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (a[i][j] !== 0) m++;
  } else {
    for (let i = 0; i < n; i++) {
      if (a[i][i] !== 0) m++;
      for (let j = i + 1; j < n; j++) if (a[i][j] !== 0) m++;
    }
  }
  return m;
}

export function buildAdjList(a) {
  const n = a.length;
  return Array.from({ length: n }, (_, i) => {
    const out = [];
    for (let j = 0; j < n; j++) if (a[i][j] !== 0) out.push(j);
    return out;
  });
}

export function degrees(a) {
  const n = a.length;
  const directed = !isSymmetric(a);
  const out = [];
  for (let i = 0; i < n; i++) {
    let inDeg = 0, outDeg = 0, deg = 0;
    for (let j = 0; j < n; j++) {
      if (a[i][j] !== 0) outDeg++;
      if (a[j][i] !== 0) inDeg++;
      if (a[i][j] !== 0) deg++;
    }
    out.push(directed ? { in: inDeg, out: outDeg } : { deg });
  }
  return { directed, list: out };
}

/** Перевірка зв’язності неорієнтованого графа BFS-обходом з вершини 0. */
export function isConnectedUndirected(g) {
  const n = g.length;
  if (n === 0) return true;
  const used = new Array(n).fill(false);
  const queue = [0];
  used[0] = true;
  while (queue.length) {
    const u = queue.shift();
    for (const v of g[u]) if (!used[v]) { used[v] = true; queue.push(v); }
  }
  return used.every(Boolean);
}

/**
 * Зведена довідка про граф: тип, кількість ребер, петлі, степені, список
 * суміжності, зв’язність (для неорієнтованого).
 */
export function summarize(a) {
  if (!a.length) return { n: 0, edges: 0, directed: false, weighted: false, loops: false };
  const symmetric = isSymmetric(a);
  const directed = !symmetric;
  const weighted = !isUnweightedLike(a);
  const loops = hasLoops(a);
  const negative = hasNegative(a);
  const edges = countEdges(a, directed);
  const adj = buildAdjList(a);
  const deg = degrees(a);
  const connected = symmetric ? isConnectedUndirected(adj) : null;
  return {
    n: a.length,
    directed, weighted, loops, edges, negative,
    adjList: adj,
    degrees: deg,
    connected,
  };
}

/** Координати вершин на колі для рендеру у SVG. */
export function circleLayout(n, { cx = 280, cy = 220, radius = 170 } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    out.push({ id: i, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
  }
  return out;
}

/**
 * DFS-обхід графа з покроковими подіями. Кожна подія описує, що відбувається
 * на цьому кроці, які вершини відвідані, поточну, активне ребро тощо.
 *
 * Події (event):
 *  - 'start'        — стартова вершина
 *  - 'visit'        — нова вершина позначена як відвідана
 *  - 'edge-tree'    — рухаємось по новому ребру (поточна → сусід)
 *  - 'edge-back'    — побачили вже відвідану вершину (зворотне ребро)
 *  - 'backtrack'    — повернення з вершини
 *  - 'component'    — старт нової компоненти
 *  - 'done'         — завершено
 */
export function dfsTraversal(a, startVertex = 0) {
  const n = a.length;
  const adj = buildAdjList(a);
  const visited = new Array(n).fill(false);
  const order = [];
  const steps = [];

  const dfs = (u, parent) => {
    visited[u] = true;
    order.push(u);
    steps.push({ event: 'visit', current: u, parent, visited: [...visited], order: [...order] });
    for (const v of adj[u]) {
      if (!visited[v]) {
        steps.push({ event: 'edge-tree', current: u, neighbour: v, visited: [...visited], order: [...order] });
        dfs(v, u);
      } else if (v !== parent) {
        steps.push({ event: 'edge-back', current: u, neighbour: v, visited: [...visited], order: [...order] });
      }
    }
    steps.push({ event: 'backtrack', current: u, parent, visited: [...visited], order: [...order] });
  };

  const start = Math.max(0, Math.min(n - 1, startVertex));
  if (n > 0) {
    steps.push({ event: 'start', current: start, visited: [...visited], order: [...order] });
    dfs(start, -1);
    for (let i = 0; i < n; i++) {
      if (!visited[i]) {
        steps.push({ event: 'component', current: i, visited: [...visited], order: [...order] });
        dfs(i, -1);
      }
    }
  }
  steps.push({ event: 'done', visited: [...visited], order: [...order] });
  return { steps, order, visited };
}

/**
 * BFS-обхід графа з покроковими подіями та станом черги на кожному кроці.
 *
 * Події (event):
 *  - 'start'        — стартова вершина додана в чергу
 *  - 'dequeue'      — вилучили з черги та обробляємо
 *  - 'enqueue'      — додали сусіда в чергу
 *  - 'edge-skip'    — побачили вже відвіданого сусіда
 *  - 'component'    — нова компонента зв’язності
 *  - 'done'         — завершено
 */
export function bfsTraversal(a, startVertex = 0) {
  const n = a.length;
  const adj = buildAdjList(a);
  const visited = new Array(n).fill(false);
  const order = [];
  const steps = [];

  const runFrom = (start) => {
    visited[start] = true;
    const queue = [start];
    steps.push({ event: 'start', current: start, queue: [...queue], visited: [...visited], order: [...order] });
    while (queue.length) {
      const u = queue.shift();
      order.push(u);
      steps.push({ event: 'dequeue', current: u, queue: [...queue], visited: [...visited], order: [...order] });
      for (const v of adj[u]) {
        if (!visited[v]) {
          visited[v] = true;
          queue.push(v);
          steps.push({ event: 'enqueue', current: u, neighbour: v, queue: [...queue], visited: [...visited], order: [...order] });
        } else {
          steps.push({ event: 'edge-skip', current: u, neighbour: v, queue: [...queue], visited: [...visited], order: [...order] });
        }
      }
    }
  };

  const start = Math.max(0, Math.min(n - 1, startVertex));
  if (n > 0) {
    runFrom(start);
    for (let i = 0; i < n; i++) {
      if (!visited[i]) {
        steps.push({ event: 'component', current: i, queue: [], visited: [...visited], order: [...order] });
        runFrom(i);
      }
    }
  }
  steps.push({ event: 'done', queue: [], visited: [...visited], order: [...order] });
  return { steps, order, visited };
}
