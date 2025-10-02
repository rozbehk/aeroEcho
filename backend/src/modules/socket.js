let io;
const api = require("./api");

function init(server, cors) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: cors,
  });
  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { init, getIO };
