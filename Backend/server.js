const express = require('express');
const WebSocket = require('ws');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const server = app.listen(8080, () => {
  console.log('WebSocket server listening on port 8080');
});

const wss = new WebSocket.Server({ server });

mongoose.connect('mongodb://localhost:27017/chatdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const chatSchema = new mongoose.Schema({
  room: String,
  sender: String,
  content: String,
  messageType: String,
  timestamp: { type: Date, default: Date.now },
});

const ChatModel = mongoose.model('Chat', chatSchema);

// Multer setup to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const upload = multer({ storage });


const rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'join':
        handleJoin(ws, data.room, data.username);
        break;
      case 'message':
        handleMessage(ws, data.room, data.content, data.messageType);
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });
});

function handleJoin(ws, room, username) {
  ws.room = room;
  ws.username = username;

  if (!rooms[room]) {
    rooms[room] = [];
  }

  rooms[room].push(ws);
}

function handleMessage(ws, room, content, messageType) {
  const messageData = {
    type: 'message',
    sender: ws.username,
    content,
    messageType,
  };

  rooms[room].forEach((client) => {
    client.send(JSON.stringify(messageData));
  });

  
  const chatMessage = new ChatModel({
    room,
    sender: ws.username,
    content,
    messageType,
  });

  chatMessage.save((err) => {
    if (err) {
      console.error('Error saving chat message to database:', err);
    }
  });
}

function handleDisconnect(ws) {
  
  for (const room in rooms) {
    if (rooms[room].includes(ws)) {
      rooms[room] = rooms[room].filter((client) => client !== ws);
    }
  }
}


app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.json({ success: false, error: 'No file provided' });
  } else {
    const fileUrl = `http://localhost:8080/${req.file.path}`;
    const fileType = req.file.mimetype;

    res.json({ success: true, fileUrl, filename: req.file.filename, fileType });
  }
});


app.use(express.static('uploads'));
