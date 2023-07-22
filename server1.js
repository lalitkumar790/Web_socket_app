// const express = require('express');
// const WebSocket = require('ws');
// const path = require('path');

// const app = express();
// const server = app.listen(8080, () => {
//   console.log('WebSocket server listening on port 8080');
// });

// const wss = new WebSocket.Server({ server });
// const rooms = {};

// app.use(express.static(path.join(__dirname, 'public')));

// function handleJoin(ws, room, username) {
//   ws.room = room;
//   ws.username = username;

//   if (!rooms[room]) {
//     rooms[room] = [];
//   }

//   rooms[room].push(ws);

//   const confirmationMessage = {
//     type: 'system',
//     content: `You have joined room ${room}`,
//   };
//   ws.send(JSON.stringify(confirmationMessage));
// }

// function handleDisconnect(ws) {
//   for (const room in rooms) {
//     if (rooms[room].includes(ws)) {
//       rooms[room] = rooms[room].filter((client) => client !== ws);
//     }
//   }
// }

// function handleMessage(ws, room, content) {
//   if (rooms[room] && Array.isArray(rooms[room])) {
//     const messageData = {
//       type: 'message',
//       sender: ws.username,
//       content,
//     };

//     rooms[room].forEach((client) => {
//       client.send(JSON.stringify(messageData));
//     });
//   } else {
//     const errorMessage = {
//       type: 'system',
//       content: `The room '${room}' does not exist or is empty.`,
//     };
//     ws.send(JSON.stringify(errorMessage));
//   }
// }

// function handleFile(ws, room, content, filename, filetype) {
//   const messageData = {
//     type: 'file',
//     sender: ws.username,
//     content,
//     filename,
//     filetype,
//   };

//   rooms[room].forEach((client) => {
//     client.send(JSON.stringify(messageData));
//   });
// }

// wss.on('connection', (ws) => {
//   ws.on('message', (message) => {
//     const data = JSON.parse(message);

//     switch (data.type) {
//       case 'join':
//         handleJoin(ws, data.room, data.username);
//         break;
//       case 'message':
//         handleMessage(ws, data.room, data.content);
//         break;
//       case 'file':
//         handleFile(ws, data.room, data.content, data.filename, data.filetype);
//         break;
//       default:
//         break;
//     }
//   });

//   ws.on('close', () => {
//     handleDisconnect(ws);
//   });
// });

const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = app.listen(8080, () => {
  console.log('WebSocket server listening on port 8080');
});

const wss = new WebSocket.Server({ server });
const rooms = {};

app.use(express.static(path.join(__dirname, 'public')));

function handleJoin(ws, room, username) {
  ws.room = room;
  ws.username = username;

  if (!rooms[room]) {
    rooms[room] = [];
  }

  rooms[room].push(ws);

  const confirmationMessage = {
    type: 'system',
    content: `You have joined room ${room}`,
  };
  ws.send(JSON.stringify(confirmationMessage));
}

function saveChatMessages(room, messages) {
  const filePath = path.join(__dirname, `chats/${room}.json`);
  fs.writeFileSync(filePath, JSON.stringify(messages));
}

function handleDisconnect(ws) {
  for (const room in rooms) {
    if (rooms[room].includes(ws)) {
      rooms[room] = rooms[room].filter((client) => client !== ws);
    }
  }
}

function handleMessage(ws, room, content) {
  if (rooms[room] && Array.isArray(rooms[room])) {
    const messageData = {
      type: 'message',
      sender: ws.username,
      content,
    };

    rooms[room].forEach((client) => {
      client.send(JSON.stringify(messageData));
    });

    
    const chatMessages = rooms[room].map((client) => ({
      sender: client.username,
      content,
    }));
    saveChatMessages(room, chatMessages);
  } else {
    const errorMessage = {
      type: 'system',
      content: `The room '${room}' does not exist or is empty.`,
    };
    ws.send(JSON.stringify(errorMessage));
  }
}

function handleFile(ws, room, content, filename, filetype) {
  const messageData = {
    type: 'file',
    sender: ws.username,
    content,
    filename,
    filetype,
  };

  rooms[room].forEach((client) => {
    client.send(JSON.stringify(messageData));
  });

const fs = require('fs').promises;


async function saveChatMessages(room, messages) {
  const chatDir = path.join(__dirname, 'chats');

  try {
    await fs.mkdir(chatDir, { recursive: true });

    const filePath = path.join(chatDir, `${room}.json`);
    let existingMessages = [];

    try {
      const fileData = await fs.readFile(filePath, 'utf-8');
      existingMessages = JSON.parse(fileData);
    } catch (error) {
      
    }

    const updatedMessages = [...existingMessages, ...messages];
    await fs.writeFile(filePath, JSON.stringify(updatedMessages));
  } catch (error) {
    console.error('Error saving chat messages:', error);
  }
}


function saveChatMessages(room, messages) {
  const chatDir = path.join(__dirname, 'chats');

  if (!fs.existsSync(chatDir)) {
    fs.mkdirSync(chatDir);
  }

  const filePath = path.join(chatDir, `${room}.json`);
  let existingMessages = [];
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    existingMessages = JSON.parse(fileData);
  }

  const updatedMessages = [...existingMessages, ...messages];
  fs.writeFileSync(filePath, JSON.stringify(updatedMessages));
}

 
  const chatMessages = rooms[room].map((client) => ({
    sender: client.username,
    content,
    filename,
    filetype,
  }));
  saveChatMessages(room, chatMessages);
}

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'join':
        handleJoin(ws, data.room, data.username);
        break;
      case 'message':
        handleMessage(ws, data.room, data.content);
        break;
      case 'file':
        handleFile(ws, data.room, data.content, data.filename, data.filetype);
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });
});

// const express = require('express');
// const WebSocket = require('ws');
// const path = require('path');

// const app = express();
// const server = app.listen(8080, () => {
//   console.log('WebSocket server listening on port 8080');
// });

// const wss = new WebSocket.Server({ server });
// const rooms = {};

// app.use(express.static(path.join(__dirname, 'public')));

// function handleJoin(ws, room, username) {
//   ws.room = room;
//   ws.username = username;

//   if (!rooms[room]) {
//     rooms[room] = [];
//   }

  
//   const chatHistory = rooms[room].map((message) => ({
//     sender: message.sender,
//     content: message.content,
//     timestamp: message.timestamp,
//   }));
//   const joinConfirmation = {
//     type: 'system',
//     content: `You have joined room ${room}`,
//     chatHistory,
//   };
//   ws.send(JSON.stringify(joinConfirmation));

//   rooms[room].push(ws);
// }

// function handleDisconnect(ws) {
//   for (const room in rooms) {
//     if (rooms[room].includes(ws)) {
//       rooms[room] = rooms[room].filter((client) => client !== ws);
//     }
//   }
// }

// function handleMessage(ws, room, content) {
//   if (rooms[room] && Array.isArray(rooms[room])) {
//     const message = {
//       sender: ws.username,
//       content,
//       timestamp: new Date().toISOString(),
//     };

//     rooms[room].forEach((client) => {
//       client.send(JSON.stringify({ type: 'message', ...message }));
//     });

//     rooms[room].push(message); 
//   } else {
//     const errorMessage = {
//       type: 'system',
//       content: `The room '${room}' does not exist or is empty.`,
//     };
//     ws.send(JSON.stringify(errorMessage));
//   }
// }

// function handleFile(ws, room, content, filename, filetype) {
//   if (rooms[room] && Array.isArray(rooms[room])) {
//     const message = {
//       sender: ws.username,
//       content,
//       timestamp: new Date().toISOString(),
//       filename,
//       filetype,
//     };

//     rooms[room].forEach((client) => {
//       client.send(JSON.stringify({ type: 'file', ...message }));
//     });

//     rooms[room].push(message); 
//   } else {
//     const errorMessage = {
//       type: 'system',
//       content: `The room '${room}' does not exist or is empty.`,
//     };
//     ws.send(JSON.stringify(errorMessage));
//   }
// }

// wss.on('connection', (ws) => {
//   ws.on('message', (message) => {
//     const data = JSON.parse(message);

//     switch (data.type) {
//       case 'join':
//         handleJoin(ws, data.room, data.username);
//         break;
//       case 'message':
//         handleMessage(ws, data.room, data.content);
//         break;
//       case 'file':
//         handleFile(ws, data.room, data.content, data.filename, data.filetype);
//         break;
//       default:
//         break;
//     }
//   });

//   ws.on('close', () => {
//     handleDisconnect(ws);
//   });
// });

