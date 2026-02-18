/**
 * Minimal static server for Render.com (and local preview).
 * - Listens on PORT from environment (Render sets this; default 10000)
 * - Binds to 0.0.0.0 so the service is reachable on Render
 * - Serves the dist/ folder with SPA fallback (index.html for client routes)
 */
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = parseInt(process.env.PORT || '10000', 10);
const HOST = '0.0.0.0';

const MIMES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function serve(pathname) {
  if (pathname === '/' || pathname === '') pathname = '/index.html';
  const file = join(DIST, pathname.replace(/^\//, ''));
  if (!file.startsWith(DIST)) return null;
  if (existsSync(file)) return file;
  if (!extname(pathname)) return join(DIST, 'index.html');
  return null;
}

const server = createServer((req, res) => {
  const pathname = new URL(req.url || '/', `http://${req.headers.host}`).pathname;
  const file = serve(pathname);
  if (!file || !existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }
  const ext = extname(file);
  const mime = MIMES[ext] || 'application/octet-stream';
  const body = readFileSync(file);
  res.writeHead(200, { 'Content-Type': mime });
  res.end(body);
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
