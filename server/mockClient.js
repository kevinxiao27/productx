// mock-field-unit.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Change port if needed

socket.on("connect", () => {
  console.log("🚓 Field unit connected:", socket.id);

  // Join alert room if needed
  socket.emit("subscribeToAlerts");

  // Emit unit status updates every 5 seconds
  setInterval(() => {
    const status = ["available", "en route", "on scene", "unavailable"];
    const randomStatus = status[Math.floor(Math.random() * status.length)];

    socket.emit("unitStatusUpdate", {
      unitId: "Alpha-1",
      status: randomStatus,
      timestamp: new Date().toISOString()
    });

    console.log("✅ Emitted status:", randomStatus);
  }, 5000);

  // Emit location updates every 3 seconds
  setInterval(() => {
    const location = {
      lat: 49.2827 + (Math.random() - 0.5) * 0.01,
      lng: -123.1207 + (Math.random() - 0.5) * 0.01
    };

    socket.emit("unitLocationUpdate", {
      unitId: "Alpha-1",
      location,
      timestamp: new Date().toISOString()
    });

    console.log("📍 Emitted location:", location);
  }, 3000);
});

socket.on("disconnect", () => {
  console.log("Field unit disconnected");
});
