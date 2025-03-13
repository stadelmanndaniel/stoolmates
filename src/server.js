import express from 'express';
import next from 'next';
import { createServer } from 'http';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const httpServer = createServer(server);
  const PORT = process.env.PORT || 3000;

  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}); 