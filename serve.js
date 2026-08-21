const http = require('http');
const fs   = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.mp3':  'audio/mpeg',
  '.ogg':  'audio/ogg',
  '.woff2':'font/woff2',
};

http.createServer((req, res) => {
  // Headers CORS y anti-bloqueo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  const filePath = path.join(DIST, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  // Intentar servir el archivo exacto
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime, 'Content-Length': data.length });
    res.end(data);
    return;
  }

  // SPA fallback → index.html
  const indexPath = path.join(DIST, 'index.html');
  if (fs.existsSync(indexPath)) {
    const data = fs.readFileSync(indexPath);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
    return;
  }

  res.writeHead(404);
  res.end('Not found: ' + urlPath);

}).listen(PORT, '0.0.0.0', () => {
  console.log('[ABYSSAL] Servidor en puerto ' + PORT);
  console.log('[ABYSSAL] DIST:', DIST);
  console.log('[ABYSSAL] index.html existe:', fs.existsSync(path.join(DIST,'index.html')));
  console.log('[ABYSSAL] classes.json existe:', fs.existsSync(path.join(DIST,'assets/data/classes.json')));
});
