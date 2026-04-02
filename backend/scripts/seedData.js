/**
 * Seed script — populates the database with sample data for development/testing.
 * Run with: npm run seed
 */
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Device = require('../src/models/Device');
const Message = require('../src/models/Message');
const Victim = require('../src/models/Victim');
const Resource = require('../src/models/Resource');
const RiskData = require('../src/models/RiskData');
const SimulationData = require('../src/models/SimulationData');

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rescuenetx';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Device.deleteMany({}),
    Message.deleteMany({}),
    Victim.deleteMany({}),
    Resource.deleteMany({}),
    RiskData.deleteMany({}),
    SimulationData.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ── Users ──────────────────────────────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('password123', salt);

  const users = await User.insertMany([
    { name: 'Alice Rescuer', email: 'rescuer@rescuenetx.com', password: hashed, role: 'rescuer' },
    { name: 'Bob Civilian', email: 'civilian@rescuenetx.com', password: hashed, role: 'civilian' },
    { name: 'Carol Admin', email: 'admin@rescuenetx.com', password: hashed, role: 'admin' },
  ]);
  console.log(`Seeded ${users.length} users`);

  // ── SOS Messages ──────────────────────────────────────────────────────────
  const sosMessages = await Message.insertMany([
    {
      sender_id: users[1]._id,
      content: 'Trapped under rubble — need immediate help!',
      message_type: 'sos',
      location: { type: 'Point', coordinates: [77.209, 28.6139] },
      severity: 'critical',
    },
    {
      sender_id: users[1]._id,
      content: 'Multiple injuries at school building.',
      message_type: 'sos',
      location: { type: 'Point', coordinates: [77.22, 28.62] },
      severity: 'high',
    },
    {
      sender_id: users[0]._id,
      content: 'Flooded area, residents need evacuation.',
      message_type: 'sos',
      location: { type: 'Point', coordinates: [77.23, 28.63] },
      severity: 'high',
    },
    {
      sender_id: users[1]._id,
      content: 'Elderly person unconscious near market.',
      message_type: 'sos',
      location: { type: 'Point', coordinates: [77.24, 28.64] },
      severity: 'critical',
    },
    {
      sender_id: users[1]._id,
      content: 'Minor injuries, medical attention needed.',
      message_type: 'sos',
      location: { type: 'Point', coordinates: [77.25, 28.65] },
      severity: 'medium',
    },
  ]);
  console.log(`Seeded ${sosMessages.length} SOS messages`);

  // ── Victims ───────────────────────────────────────────────────────────────
  const victims = await Victim.insertMany([
    {
      name: 'Ravi Kumar',
      location: { type: 'Point', coordinates: [77.209, 28.6139] },
      status: 'critical',
      severity: 'critical',
      description: 'Trapped under collapsed building',
      rescuer_id: users[0]._id,
    },
    {
      name: 'Priya Sharma',
      location: { type: 'Point', coordinates: [77.215, 28.618] },
      status: 'injured',
      severity: 'high',
      description: 'Leg fracture, needs ambulance',
    },
    {
      name: 'Amit Singh',
      location: { type: 'Point', coordinates: [77.22, 28.622] },
      status: 'safe',
      severity: 'low',
      description: 'Rescued, at relief camp',
      is_rescued: true,
    },
    {
      name: 'Sunita Devi',
      location: { type: 'Point', coordinates: [77.23, 28.63] },
      status: 'critical',
      severity: 'critical',
      description: 'Unresponsive, possible head injury',
      rescuer_id: users[0]._id,
    },
    {
      name: 'Deepak Verma',
      location: { type: 'Point', coordinates: [77.24, 28.64] },
      status: 'injured',
      severity: 'medium',
      description: 'Burns on arms, needs first aid',
    },
  ]);
  console.log(`Seeded ${victims.length} victims`);

  // ── Resources ─────────────────────────────────────────────────────────────
  const resources = await Resource.insertMany([
    {
      type: 'rescue_team',
      name: 'Alpha Rescue Team',
      current_location: { type: 'Point', coordinates: [77.2, 28.61] },
      availability: true,
      metadata: { members: 8, equipment: ['ropes', 'stretchers'] },
    },
    {
      type: 'rescue_team',
      name: 'Bravo Rescue Team',
      current_location: { type: 'Point', coordinates: [77.21, 28.615] },
      availability: false,
      assigned_task: 'Extracting victim from site A',
      assigned_victim: victims[0]._id,
    },
    {
      type: 'ambulance',
      name: 'Ambulance Unit 1',
      current_location: { type: 'Point', coordinates: [77.205, 28.612] },
      availability: true,
      metadata: { hospital: 'City Hospital', contact: '+91-9876543210' },
    },
    {
      type: 'ambulance',
      name: 'Ambulance Unit 2',
      current_location: { type: 'Point', coordinates: [77.218, 28.619] },
      availability: false,
      assigned_victim: victims[1]._id,
    },
    {
      type: 'drone',
      name: 'Surveillance Drone 1',
      current_location: { type: 'Point', coordinates: [77.212, 28.616] },
      availability: true,
      metadata: { battery: 85, camera: 'thermal', range_km: 10 },
    },
  ]);
  console.log(`Seeded ${resources.length} resources`);

  // ── Simulation Data ───────────────────────────────────────────────────────
  const simulations = await SimulationData.insertMany([
    {
      type: 'hazard',
      name: 'Chemical Plant Leak',
      location: { type: 'Point', coordinates: [77.208, 28.611] },
      severity: 'critical',
      description: 'Chemical gas leak from industrial plant',
      is_active: true,
    },
    {
      type: 'hazard',
      name: 'Building Collapse Zone',
      location: { type: 'Point', coordinates: [77.219, 28.621] },
      severity: 'high',
      description: 'Partial building collapse, unstable structure',
      is_active: true,
    },
    {
      type: 'flood',
      name: 'Yamuna River Flooding',
      location: { type: 'Point', coordinates: [77.23, 28.64] },
      severity: 'high',
      description: 'River banks breached, 2 km radius affected',
      area_coordinates: [[77.22, 28.63], [77.24, 28.63], [77.24, 28.65], [77.22, 28.65]],
      is_active: true,
    },
    {
      type: 'flood',
      name: 'Underpass Flooding',
      location: { type: 'Point', coordinates: [77.215, 28.617] },
      severity: 'medium',
      description: 'Underpass submerged, vehicles stranded',
      is_active: true,
    },
    {
      type: 'blocked_road',
      name: 'NH-48 Blocked',
      location: { type: 'Point', coordinates: [77.202, 28.609] },
      severity: 'high',
      description: 'Highway blocked due to landslide debris',
      is_active: true,
    },
    {
      type: 'blocked_road',
      name: 'Ring Road Obstruction',
      location: { type: 'Point', coordinates: [77.225, 28.628] },
      severity: 'medium',
      description: 'Fallen trees blocking road',
      is_active: true,
    },
  ]);
  console.log(`Seeded ${simulations.length} simulation entries`);

  // ── Risk Data ─────────────────────────────────────────────────────────────
  const riskEntries = await RiskData.insertMany([
    {
      risk_type: 'structural_collapse',
      location: { type: 'Point', coordinates: [77.209, 28.6139] },
      risk_level: 'critical',
      confidence_score: 0.92,
      recommendations: ['Evacuate 500m radius', 'Deploy structural engineers', 'Restrict access'],
      affected_area: 500,
      source: 'ai',
    },
    {
      risk_type: 'flood',
      location: { type: 'Point', coordinates: [77.23, 28.64] },
      risk_level: 'high',
      confidence_score: 0.87,
      recommendations: ['Evacuate low-lying areas', 'Deploy boats', 'Open relief camps'],
      affected_area: 2000,
      source: 'ai',
    },
  ]);
  console.log(`Seeded ${riskEntries.length} risk data entries`);

  console.log('\n✅ Database seeding complete!');
  console.log('\nSample credentials:');
  console.log('  Rescuer : rescuer@rescuenetx.com  / password123');
  console.log('  Civilian: civilian@rescuenetx.com / password123');
  console.log('  Admin   : admin@rescuenetx.com    / password123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
