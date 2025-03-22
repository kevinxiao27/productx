import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import apiRoutes from "./routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set("io", io);

// Routes
app.use("/api", apiRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "API server is running" });
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send the client the current count of connections
  io.emit("userCount", { count: io.engine.clientsCount });

  // Listen for client subscribing to alerts
  socket.on("subscribeToAlerts", () => {
    socket.join("alerts");
    console.log(`Client ${socket.id} subscribed to alerts`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    io.emit("userCount", { count: io.engine.clientsCount });
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;
