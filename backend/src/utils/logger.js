const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const currentLevel = process.env.LOG_LEVEL ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] : LOG_LEVELS.DEBUG;

function timestamp() {
  return new Date().toISOString();
}

function shouldLog(level) {
  return LOG_LEVELS[level] >= currentLevel;
}

const logger = {
  debug(message, ...args) {
    if (!shouldLog('DEBUG')) return;
    console.debug(`[${timestamp()}] [DEBUG] ${message}`, ...args);
  },

  info(message, ...args) {
    if (!shouldLog('INFO')) return;
    console.info(`[${timestamp()}] [INFO]  ${message}`, ...args);
  },

  warn(message, ...args) {
    if (!shouldLog('WARN')) return;
    console.warn(`[${timestamp()}] [WARN]  ${message}`, ...args);
  },

  error(message, ...args) {
    if (!shouldLog('ERROR')) return;
    console.error(`[${timestamp()}] [ERROR] ${message}`, ...args);
  },
};

module.exports = logger;
