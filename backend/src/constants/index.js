const USER_ROLES = {
  RESCUER: 'rescuer',
  CIVILIAN: 'civilian',
  ADMIN: 'admin',
};

const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  MESH: 'mesh',
};

const VICTIM_STATUS = {
  CRITICAL: 'critical',
  INJURED: 'injured',
  SAFE: 'safe',
};

const RESOURCE_TYPES = {
  TEAM: 'rescue_team',
  AMBULANCE: 'ambulance',
  DRONE: 'drone',
};

const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const SIMULATION_TYPES = {
  HAZARD: 'hazard',
  FLOOD: 'flood',
  BLOCKED_ROAD: 'blocked_road',
};

const SOCKET_EVENTS = {
  NEW_SOS: 'new_sos',
  VICTIM_UPDATE: 'victim_update',
  RESOURCE_UPDATE: 'resource_update',
  RISK_UPDATE: 'risk_update',
};

module.exports = {
  USER_ROLES,
  DEVICE_STATUS,
  VICTIM_STATUS,
  RESOURCE_TYPES,
  SEVERITY_LEVELS,
  SIMULATION_TYPES,
  SOCKET_EVENTS,
};
