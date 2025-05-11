const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const redis = new Redis({
  host: 'redis-12675.c212.ap-south-1-1.ec2.cloud.redislabs.com',
  port: 12675,
  username: 'default',
  password: 'dssYpBnYQrl01GbCGVhVq2e4dYvUrKJB',
});

const REDIS_KEY = 'FULLSTACK_TASK_John'; // Replace 'John' with your first name

// MongoDB setup
mongoose.connect('mongodb+srv://ranvishwakarma122:nNjOcMP7oTBVqWVK@cluster0.cbs5t.mongodb.net/assignment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const NoteSchema = new mongoose.Schema({
  id: String,
  text: String,
  completed: Boolean,
  createdAt: String,
});

const Note = mongoose.model('assignment_John', NoteSchema); // Replace 'John'

app.use(bodyParser.json());

// Fetch all notes from Redis or MongoDB
app.get('/fetchAllTasks', async (req, res) => {
  try {
    const cached = await redis.get(REDIS_KEY);
    if (cached) return res.json(JSON.parse(cached));

    // fallback to MongoDB if cache is empty
    const mongoNotes = await Note.find({});
    return res.json(mongoNotes);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebSocket Handling
wss.on('connection', async (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.event === 'add') {
        const newNote = data.note;

        let current = await redis.get(REDIS_KEY);
        let notes = current ? JSON.parse(current) : [];
        notes.push(newNote);

        // If more than 50, move to MongoDB
        if (notes.length > 50) {
          await Note.insertMany(notes);
          await redis.del(REDIS_KEY);
          notes = [];
        } else {
          await redis.set(REDIS_KEY, JSON.stringify(notes));
        }

        // Broadcast to all clients
        broadcast({
          type: 'notes_updated',
          notes,
        });
      }

      if (data.event === 'update') {
        const updatedNotes = data.notes;
        await redis.set(REDIS_KEY, JSON.stringify(updatedNotes));
        broadcast({
          type: 'notes_updated',
          notes: updatedNotes,
        });
      }
    } catch (err) {
      console.error('WebSocket error:', err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Broadcast to all clients
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
