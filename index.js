const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_ORIGIN || '*' } });

// API Rate Limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: '12mb' }));
app.use(apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));

app.use('/api/search', require('./routes/search'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/communities', require('./routes/communities'));
// Global Error Handler
app.use(errorHandler);

// Socket.io presence and messages
const onlineUsers = new Map();

io.on('connection', socket => {
  socket.on('presence:online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('presence:update', Array.from(onlineUsers.keys()));
  });

  socket.on('private:message', async (payload) => {
    const toSocket = onlineUsers.get(payload.to);
    if (toSocket) io.to(toSocket).emit('private:message', payload);
    try {
      const Message = require('./models/Message');
      await Message.create({ from: payload.from, to: payload.to, type: payload.type || 'text', text: payload.text, audio: payload.audioPath || null });

      // Create notification for new message
      const Notification = require('./models/Notification');
      await Notification.create({
        user: payload.to,
        type: 'message',
        from: payload.from,
        message: `New message from ${(await require('./models/user').findById(payload.from)).name}`,
        relatedId: null
      });
    } catch (err) {
      console.error('Save message error - index.js:71', err);
    }
  });

  socket.on('disconnect', () => {
    for (let [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) onlineUsers.delete(uid);
    }
    io.emit('presence:update', Array.from(onlineUsers.keys()));
  });
});

// Connect to DB and start
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/echoplex4')
  .then(() => {
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => console.log('Server listening on - index.js:87', PORT));
  }).catch(err => console.error('MongoDB connection error - index.js:88', err));
