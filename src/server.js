const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
let port = 3000;

// Try alternative ports if 3000 is in use
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        server.close();
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    server.listen(startPort, () => {
      server.close();
      resolve(startPort);
    });
  });
};

const app = next({ dev, hostname });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // Find an available port
  port = await findAvailablePort(port);

  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
}); 