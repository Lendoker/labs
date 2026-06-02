/**
 * @file graphAdvanced.js
 * @description Алгоритми на графах: топологічне сортування, MST (Краскал, Прим),
 *   найкоротші шляхи (Дейкстра, Беллман–Форд, Флойд–Воршелл, A*).
 */

export const INF = Number.POSITIVE_INFINITY;

/** Парсить орієнтовані ребра: рядки «u v». */
export function parseDirectedEdgesText(text) {
  const lines = String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const edges = [];
  let maxV = -1;
  for (const line of lines) {
    const parts = line.split(/[\s,;]+/).filter(Boolean).map(Number);
    if (parts.length < 2 || parts.some((x) => Number.isNaN(x))) {
      throw new Error(`Некоректний рядок ребра: «${line}»`);
    }
    const [u, v] = parts;
    edges.push({ from: u, to: v });
    maxV = Math.max(maxV, u, v);
  }
  const n = maxV + 1;
  if (n <= 0) throw new Error('Граф порожній — додайте хоча б одне ребро.');
  const adj = Array.from({ length: n }, () => []);
  for (const { from, to } of edges) {
    if (from < 0 || to < 0 || from >= n || to >= n) throw new Error(`Ребро ${from}→${to} поза межами [0..${n - 1}].`);
    adj[from].push(to);
  }
  return { n, adj, edges };
}

/** Парсить зважені орієнтовані ребра: «u v w». */
export function parseWeightedEdgesText(text) {
  const lines = String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const edges = [];
  let maxV = -1;
  for (const line of lines) {
    const parts = line.split(/[\s,;]+/).filter(Boolean).map(Number);
    if (parts.length < 3 || parts.some((x) => Number.isNaN(x))) {
      throw new Error(`Некоректний рядок: «${line}» (очікується u v w).`);
    }
    const [from, to, weight] = parts;
    edges.push({ from, to, weight });
    maxV = Math.max(maxV, from, to);
  }
  const n = maxV + 1;
  if (n <= 0) throw new Error('Граф порожній.');
  return { n, edges };
}

/** Список суміжності зваженого графа з матриці (0 = немає ребра). */
export function weightedAdjFromMatrix(matrix, { directed = false } = {}) {
  const n = matrix.length;
  const adj = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const w = matrix[i][j];
      if (w === 0) continue;
      if (!directed && j < i) continue;
      adj[i].push({ to: j, weight: w });
      if (!directed && i !== j) adj[j].push({ to: i, weight: w });
    }
  }
  return adj;
}

/** Ребра неорієнтованого зваженого графа з верхнього трикутника матриці. */
export function undirectedEdgesFromMatrix(matrix) {
  const n = matrix.length;
  const edges = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const w = matrix[i][j];
      if (w !== 0) edges.push({ start: i, end: j, weight: w });
    }
  }
  return edges;
}

function ufFind(parent, i) {
  if (parent[i] === i) return i;
  parent[i] = ufFind(parent, parent[i]);
  return parent[i];
}

function ufUnion(parent, rank, x, y) {
  const xr = ufFind(parent, x);
  const yr = ufFind(parent, y);
  if (xr === yr) return false;
  if (rank[xr] < rank[yr]) parent[xr] = yr;
  else if (rank[xr] > rank[yr]) parent[yr] = xr;
  else { parent[yr] = xr; rank[xr]++; }
  return true;
}

/**
 * Топологічне сортування DFS + перевірка циклу (3-кольоровий обхід).
 */
export function topologicalSortDfs(adj, n) {
  const WHITE = 0; const GRAY = 1; const BLACK = 2;
  const color = new Array(n).fill(WHITE);
  const finishOrder = [];
  const steps = [];
  let hasCycle = false;
  let cycleEdge = null;

  const dfs = (u) => {
    color[u] = GRAY;
    steps.push({ event: 'enter', current: u, color: [...color], finishOrder: [...finishOrder] });
    for (const v of adj[u]) {
      if (color[v] === GRAY) {
        hasCycle = true;
        cycleEdge = { from: u, to: v };
        steps.push({ event: 'cycle', current: u, neighbour: v, color: [...color], finishOrder: [...finishOrder] });
        return;
      }
      if (color[v] === WHITE) dfs(v);
      if (hasCycle) return;
    }
    color[u] = BLACK;
    finishOrder.push(u);
    steps.push({ event: 'finish', current: u, color: [...color], finishOrder: [...finishOrder] });
  };

  for (let i = 0; i < n; i++) {
    if (color[i] === WHITE) dfs(i);
    if (hasCycle) break;
  }

  const order = hasCycle ? [] : [...finishOrder].reverse();
  steps.push({ event: 'done', hasCycle, order: [...order], finishOrder: [...finishOrder] });
  return { order, hasCycle, cycleEdge, steps };
}

/** Топологічне сортування алгоритмом Кана. */
export function topologicalSortKahn(adj, n) {
  const inDeg = new Array(n).fill(0);
  for (let u = 0; u < n; u++) for (const v of adj[u]) inDeg[v]++;
  const queue = [];
  for (let i = 0; i < n; i++) if (inDeg[i] === 0) queue.push(i);
  const order = [];
  const steps = [];
  steps.push({ event: 'init', queue: [...queue], inDeg: [...inDeg], order: [] });

  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    steps.push({ event: 'dequeue', current: u, queue: [...queue], inDeg: [...inDeg], order: [...order] });
    for (const v of adj[u]) {
      inDeg[v]--;
      steps.push({ event: 'relax', current: u, neighbour: v, queue: [...queue], inDeg: [...inDeg], order: [...order] });
      if (inDeg[v] === 0) {
        queue.push(v);
        steps.push({ event: 'enqueue', current: u, neighbour: v, queue: [...queue], inDeg: [...inDeg], order: [...order] });
      }
    }
  }

  const hasCycle = order.length !== n;
  steps.push({ event: 'done', hasCycle, order: [...order] });
  return { order, hasCycle, steps };
}

/** Алгоритм Краскала з покроковою візуалізацією. */
export function kruskalMst(edges, vertices) {
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);
  const parent = Array.from({ length: vertices }, (_, i) => i);
  const rank = new Array(vertices).fill(0);
  const mst = [];
  const steps = [];
  let totalWeight = 0;

  steps.push({ event: 'init', mst: [], totalWeight: 0, edge: null });

  for (const edge of sorted) {
    const x = ufFind(parent, edge.start);
    const y = ufFind(parent, edge.end);
    if (x !== y) {
      ufUnion(parent, rank, x, y);
      mst.push(edge);
      totalWeight += edge.weight;
      steps.push({ event: 'take', edge, mst: [...mst], totalWeight, rejected: false });
      if (mst.length === vertices - 1) break;
    } else {
      steps.push({ event: 'reject', edge, mst: [...mst], totalWeight, rejected: true });
    }
  }

  steps.push({ event: 'done', mst: [...mst], totalWeight });
  return { mst, totalWeight, steps };
}

/** Алгоритм Пріма з покроковою візуалізацією. */
export function primMst(matrix, start = 0) {
  const vertices = matrix.length;
  const parent = new Array(vertices).fill(-1);
  const key = new Array(vertices).fill(INF);
  const inMst = new Array(vertices).fill(false);
  const mstEdges = [];
  const steps = [];
  let totalWeight = 0;

  key[start] = 0;
  steps.push({ event: 'init', inMst: [...inMst], key: [...key], parent: [...parent], mstEdges: [], totalWeight: 0, current: start });

  for (let count = 0; count < vertices; count++) {
    let u = -1;
    let minKey = INF;
    for (let v = 0; v < vertices; v++) {
      if (!inMst[v] && key[v] < minKey) { minKey = key[v]; u = v; }
    }
    if (u === -1 || minKey === INF) break;
    inMst[u] = true;
    if (parent[u] !== -1) {
      const w = matrix[u][parent[u]];
      mstEdges.push({ start: parent[u], end: u, weight: w });
      totalWeight += w;
    }
    steps.push({ event: 'add-vertex', current: u, inMst: [...inMst], key: [...key], parent: [...parent], mstEdges: [...mstEdges], totalWeight });

    for (let v = 0; v < vertices; v++) {
      const w = matrix[u][v];
      if (w && !inMst[v] && w < key[v]) {
        parent[v] = u;
        key[v] = w;
        steps.push({ event: 'relax', current: u, neighbour: v, weight: w, inMst: [...inMst], key: [...key], parent: [...parent], mstEdges: [...mstEdges], totalWeight });
      }
    }
  }

  steps.push({ event: 'done', mstEdges: [...mstEdges], totalWeight, parent: [...parent] });
  return { mstEdges, totalWeight, parent, steps };
}

function findMinDistanceVertex(distance, visited, vertices) {
  let minV = -1;
  for (let v = 0; v < vertices; v++) {
    if (!visited[v] && (minV === -1 || distance[v] < distance[minV])) minV = v;
  }
  return minV;
}

/** Алгоритм Дейкстри з відновленням шляхів. */
export function dijkstra(matrix, start) {
  const vertices = matrix.length;
  const distance = new Array(vertices).fill(INF);
  const parent = new Array(vertices).fill(-1);
  const visited = new Array(vertices).fill(false);
  const steps = [];

  distance[start] = 0;
  steps.push({ event: 'init', distance: [...distance], visited: [...visited], parent: [...parent], current: start });

  for (let count = 0; count < vertices; count++) {
    const u = findMinDistanceVertex(distance, visited, vertices);
    if (u === -1 || distance[u] === INF) break;
    visited[u] = true;
    steps.push({ event: 'select', current: u, distance: [...distance], visited: [...visited], parent: [...parent] });

    for (let v = 0; v < vertices; v++) {
      const w = matrix[u][v];
      if (!visited[v] && w && distance[u] !== INF && distance[u] + w < distance[v]) {
        distance[v] = distance[u] + w;
        parent[v] = u;
        steps.push({ event: 'relax', current: u, neighbour: v, weight: w, distance: [...distance], visited: [...visited], parent: [...parent] });
      }
    }
  }

  steps.push({ event: 'done', distance: [...distance], visited: [...visited], parent: [...parent] });
  return { distance, parent, steps };
}

export function reconstructPath(parent, target) {
  if (target < 0 || target >= parent.length) return [];
  const path = [];
  for (let v = target; v !== -1; v = parent[v]) {
    path.push(v);
    if (path.length > parent.length + 1) return [];
  }
  path.reverse();
  return path;
}

/** Беллман–Форд + перевірка від’ємного циклу. */
export function bellmanFord(n, edges, start) {
  const dist = new Array(n).fill(INF);
  const parent = new Array(n).fill(-1);
  const steps = [];
  dist[start] = 0;
  steps.push({ event: 'init', dist: [...dist], parent: [...parent], iteration: 0 });

  for (let i = 0; i < n - 1; i++) {
    let changed = false;
    for (const e of edges) {
      if (dist[e.from] !== INF && dist[e.from] + e.weight < dist[e.to]) {
        dist[e.to] = dist[e.from] + e.weight;
        parent[e.to] = e.from;
        changed = true;
        steps.push({ event: 'relax', edge: e, dist: [...dist], parent: [...parent], iteration: i + 1 });
      }
    }
    if (!changed) steps.push({ event: 'iter-done', dist: [...dist], parent: [...parent], iteration: i + 1, early: true });
  }

  let negativeCycle = false;
  for (const e of edges) {
    if (dist[e.from] !== INF && dist[e.from] + e.weight < dist[e.to]) {
      negativeCycle = true;
      steps.push({ event: 'neg-cycle', edge: e, dist: [...dist], parent: [...parent] });
      break;
    }
  }

  steps.push({ event: 'done', dist: [...dist], parent: [...parent], negativeCycle });
  return { dist, parent, negativeCycle, steps };
}

/** Флойд–Воршелл: всі пари найкоротших шляхів. */
export function floydWarshall(matrix) {
  const n = matrix.length;
  const dist = matrix.map((row, i) => row.map((w, j) => (i === j ? 0 : w === 0 ? INF : w)));
  const next = Array.from({ length: n }, () => new Array(n).fill(-1));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (dist[i][j] !== INF && i !== j) next[i][j] = j;

  const steps = [];
  steps.push({ event: 'init', k: -1, dist: dist.map((r) => [...r]) });

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] !== INF && dist[k][j] !== INF && dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
          steps.push({ event: 'relax', k, i, j, dist: dist.map((r) => [...r]) });
        }
      }
    }
    steps.push({ event: 'k-done', k, dist: dist.map((r) => [...r]) });
  }

  let negativeCycle = false;
  for (let i = 0; i < n; i++) if (dist[i][i] < 0) { negativeCycle = true; break; }

  steps.push({ event: 'done', dist: dist.map((r) => [...r]), next, negativeCycle });
  return { dist, next, negativeCycle, steps };
}

export function floydPath(next, i, j) {
  if (next[i][j] === -1) return [];
  const path = [i];
  let cur = i;
  while (cur !== j) {
    cur = next[cur][j];
    if (cur === -1) return [];
    path.push(cur);
  }
  return path;
}

/**
 * A* з евристикою h[]; повертає шлях, вартість і кількість розгорнутих вершин.
 */
export function aStar(adj, h, start, goal) {
  const n = adj.length;
  const g = new Array(n).fill(INF);
  const parent = new Array(n).fill(-1);
  const closed = new Array(n).fill(false);
  const open = [];
  const steps = [];
  let expanded = 0;

  const pushOpen = (v, f) => {
    open.push({ v, f });
    open.sort((a, b) => a.f - b.f || a.v - b.v);
  };

  g[start] = 0;
  parent[start] = -1;
  pushOpen(start, h[start] ?? 0);
  steps.push({ event: 'init', g: [...g], closed: [...closed], open: open.map((x) => x.v), current: start });

  while (open.length) {
    const { v } = open.shift();
    if (closed[v]) continue;
    closed[v] = true;
    expanded++;
    steps.push({ event: 'expand', current: v, g: [...g], closed: [...closed], open: open.map((x) => x.v), expanded });

    if (v === goal) {
      steps.push({ event: 'done', found: true, pathCost: g[v], parent: [...parent], expanded });
      return { found: true, pathCost: g[v], parent, expanded, steps };
    }

    for (const e of adj[v]) {
      const newG = g[v] + e.weight;
      if (newG < g[e.to]) {
        g[e.to] = newG;
        parent[e.to] = v;
        const f = newG + (h[e.to] ?? 0);
        pushOpen(e.to, f);
        steps.push({ event: 'relax', current: v, neighbour: e.to, weight: e.weight, g: [...g], closed: [...closed], open: open.map((x) => x.v), f });
      }
    }
  }

  steps.push({ event: 'done', found: false, pathCost: INF, parent: [...parent], expanded });
  return { found: false, pathCost: INF, parent, expanded, steps };
}

export function formatDist(d) {
  if (d === INF || d === Number.POSITIVE_INFINITY) return '∞';
  return String(d);
}
