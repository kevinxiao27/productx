import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected as unit");

  socket.emit("subscribeToAlerts");

  setInterval(() => {
    socket.emit("unitLocationUpdate", {
      unitId: "Alpha3",
      location: { lat: 49.2827, lng: -123.1207 },
    });
  }, 3000);
});
