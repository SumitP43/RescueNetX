const logger = require('../utils/logger');
const { SOCKET_EVENTS } = require('../constants');

// Singleton io instance shared across the application
let _io = null;

/**
 * Store the Socket.io server instance so services can emit events.
 */
function setIO(io) {
  _io = io;
}

/**
 * Retrieve the Socket.io server instance.
 */
function getIO() {
  return _io;
}

/**
 * Register all Socket.io event handlers on the server instance.
 * Called once during application startup.
 */
function initializeSocketHandlers(io) {
  setIO(io);

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Allow clients to join named rooms (e.g. per-region or per-role)
    socket.on('join_room', (room) => {
      socket.join(room);
      logger.debug(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
      logger.debug(`Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });

    // Acknowledge ping from clients
    socket.on('ping', () => socket.emit('pong'));
  });

  logger.info('Socket.io handlers initialised');
}

// ── Helpers used by services to broadcast events ─────────────────────────────

/**
 * Emit a new SOS alert to all connected clients.
 */
function emitNewSOS(data) {
  if (_io) _io.emit(SOCKET_EVENTS.NEW_SOS, data);
}

/**
 * Emit a victim status update to all connected clients.
 */
function emitVictimUpdate(data) {
  if (_io) _io.emit(SOCKET_EVENTS.VICTIM_UPDATE, data);
}

/**
 * Emit a resource update to all connected clients.
 */
function emitResourceUpdate(data) {
  if (_io) _io.emit(SOCKET_EVENTS.RESOURCE_UPDATE, data);
}

/**
 * Emit an AI risk assessment update to all connected clients.
 */
function emitRiskUpdate(data) {
  if (_io) _io.emit(SOCKET_EVENTS.RISK_UPDATE, data);
}

module.exports = {
  initializeSocketHandlers,
  setIO,
  getIO,
  emitNewSOS,
  emitVictimUpdate,
  emitResourceUpdate,
  emitRiskUpdate,
};
