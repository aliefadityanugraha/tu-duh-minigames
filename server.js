// Entry point server — tipis, hanya setup Express + Socket.io + Next.js
const express  = require('express');
const http     = require('http');
const socketIO = require('socket.io');
const next     = require('next');

const { registerJoinHandlers }     = require('./server/handlers/joinHandler');
const { registerGameHandlers }     = require('./server/handlers/gameHandler');
const { registerQuestionHandlers } = require('./server/handlers/questionHandler');

const dev     = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle  = nextApp.getRequestHandler();
const PORT    = process.env.PORT || 3000;

nextApp.prepare().then(() => {
  const app    = express();
  const server = http.createServer(app);
  const io     = socketIO(server);

  // Semua request HTTP dilayani oleh Next.js
  app.all('*', (req, res) => handle(req, res));

  // Socket.io — daftarkan semua handler per domain
  io.on('connection', (socket) => {
    console.log(`Terhubung: ${socket.id}`);
    registerJoinHandlers(socket, io);
    registerGameHandlers(socket, io);
    registerQuestionHandlers(socket, io);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Server aktif di http://localhost:${PORT}`);
  });
});
