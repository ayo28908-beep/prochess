// Minimal static file server for the ProChess site (no dependencies).
// Usage: node serve.mjs [rootDir] [port]   (port 0 or omitted = ephemeral)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const rootArg = process.argv[2];
if (!rootArg) { console.error('Usage: node serve.mjs <rootDir> [port]'); process.exit(1); }
const root = path.resolve(rootArg);
const port = Number(process.argv[3] || 0);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pgn': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.normalize(path.join(root, p));
    const rel = path.relative(root, file);
    if (rel.startsWith('..') || path.isAbsolute(rel)) { res.writeHead(403, { 'Content-Type': 'text/plain' }).end('Forbidden'); return; }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found: ' + p); return; }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(file).pipe(res);
    });
  } catch (e) { res.writeHead(500).end('Server error'); }
});

server.listen(port, '127.0.0.1', () => {
  const a = server.address();
  console.log('PROCHESS_SERVER_READY pid=' + process.pid + ' port=' + a.port);
});
