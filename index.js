const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

let users = {};

wss.on("connection", (ws) => {
  console.log("User connected");

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === "join") {
      users[parsedMessage.username] = ws;
      ws.username = parsedMessage.username;
      console.log(`User ${parsedMessage.username} joined`);
    } else if (parsedMessage.type === "message") {
      const id = uuidv4();
      const messageToSend = JSON.stringify({
        id,
        username: ws.username,
        message: parsedMessage.message,
      });
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(messageToSend);
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("User disconnected");
    delete users[ws.username];
  });
});

server.listen(3000, () => {
  console.log("Server started on port 3000");
});
