/**
 * Helper functions for Socket.IO events
 */

// Emit a new alert event
export const emitNewAlert = (io, alertData) => {
  io.to("alerts").emit("newAlert", alertData);
};

// Emit an updated alert event
export const emitUpdatedAlert = (io, alertData) => {
  io.to("alerts").emit("updatedAlert", alertData);
};

// Emit a deleted alert event
export const emitDeletedAlert = (io, alertId) => {
  io.to("alerts").emit("deletedAlert", { id: alertId });
};

// Emit all alert events (for initial load)
export const emitAllAlerts = (io, alertsData) => {
  io.to("alerts").emit("allAlerts", alertsData);
};


