const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store connected users
const users = new Map();

// Socket.io connection handling
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`User connected: ${userId}, socket ID: ${socket.id}`);

  // Store user socket
  users.set(userId, socket.id);
  console.log(`Current connected users: ${users.size}`);

  // Emit online status to all users
  io.emit("user_status", {
    userId: userId,
    status: "online",
  });

  // Handle private messages
  socket.on("private_message", ({ content, to, from }) => {
    console.log(
      `Message from ${from} to ${to}: ${
        content ? content.substring(0, 20) + "..." : "empty content"
      }`
    );

    const recipientSocket = users.get(to);
    console.log(
      `Recipient socket ID for ${to}: ${recipientSocket || "Not found"}`
    );

    if (recipientSocket) {
      // Send to recipient
      io.to(recipientSocket).emit("private_message", {
        content,
        from,
        timestamp: new Date().toISOString(),
      });
      console.log(`Message sent to recipient socket: ${recipientSocket}`);

      // Send delivery receipt to sender
      const senderSocket = users.get(from);
      if (senderSocket) {
        io.to(senderSocket).emit("message_delivered", {
          to,
          timestamp: new Date().toISOString(),
        });
        console.log(`Delivery receipt sent to sender socket: ${senderSocket}`);
      } else {
        console.log(`Sender socket not found for ${from}`);
      }
    } else {
      console.log(`Recipient offline or not found: ${to}`);
    }
  });

  // Handle message read receipt
  socket.on("message_read", ({ from, to }) => {
    console.log(`Message read by ${to} from ${from}`);

    const senderSocket = users.get(from);
    console.log(`Sender socket ID for ${from}: ${senderSocket || "Not found"}`);

    if (senderSocket) {
      io.to(senderSocket).emit("message_read", {
        by: to,
        timestamp: new Date().toISOString(),
      });
      console.log(`Read receipt sent to sender socket: ${senderSocket}`);
    } else {
      console.log(`Sender socket not found for ${from}`);
    }
  });

  // Handle user typing
  socket.on("typing", ({ to, from }) => {
    const recipientSocket = users.get(to);

    if (recipientSocket) {
      io.to(recipientSocket).emit("typing", { from });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}, socket ID: ${socket.id}`);
    users.delete(userId);
    console.log(`Remaining connected users: ${users.size}`);

    // Emit offline status to all users
    io.emit("user_status", {
      userId: userId,
      status: "offline",
    });
  });
});

// Simple health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

module.exports = app;
