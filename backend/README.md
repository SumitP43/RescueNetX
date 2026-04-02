# RescueNet X — Autonomous Disaster Intelligence Network

A production-ready **Node.js + Express.js** backend for coordinating autonomous disaster response operations. The system provides real-time SOS handling, victim tracking, resource management, AI-assisted risk analysis, offline-capable mesh-device sync, and live WebSocket events.

---

## Features

- 🔐 **JWT Authentication** — Secure registration and login with role-based access (rescuer / civilian / admin)
- 📡 **SOS Messaging** — Create, retrieve, and broadcast emergency SOS alerts in real-time
- 🔄 **Offline Sync** — Merge queued messages from offline / mesh-network devices with deduplication
- 👤 **Victim Tracking** — Add, update, and geo-query victims by proximity using MongoDB geospatial indexes
- 🚑 **Resource Management** — Track rescue teams, ambulances, and drones with live availability updates
- 🤖 **AI Risk Analysis** — Delegate risk scoring, operation prioritisation, and resource allocation to an AI microservice (with graceful mock fallback)
- 📍 **Device Registry** — Register field devices, update connectivity status, and retrieve last-known GPS locations
- 🗺️ **Simulation Layer** — Query active hazard zones, flood areas, and blocked roads
- 🔔 **WebSocket Events** — Real-time push events for SOS, victim, resource, and risk updates via Socket.io
- 🛡️ **Security** — helmet, CORS, rate limiting, input validation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Framework | Express.js 4 |
| Database | MongoDB + Mongoose 7 |
| Real-time | Socket.io 4 |
| Auth | JSON Web Tokens (jsonwebtoken + bcryptjs) |
| Validation | express-validator |
| HTTP client | axios |
| Logging | Custom console logger |

---

## Project Structure

```
backend/
├── src/
│   ├── app.js                  # Express app (middleware + routes)
│   ├── config/database.js      # Mongoose connection
│   ├── constants/index.js      # Shared enums
│   ├── controllers/            # Request handlers
│   ├── middleware/             # auth.js, errorHandler.js
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routers
│   ├── services/               # Business logic
│   ├── sockets/socketHandlers.js  # Socket.io setup + emitters
│   └── utils/                  # logger.js, validators.js
├── scripts/seedData.js         # Database seeder
├── server.js                   # Entry point
├── package.json
└── .env.example
```

---

## Setup

### 1. Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 4. Seed sample data (optional)

```bash
npm run seed
```

### 5. Start the server

```bash
# Production
npm start

# Development (auto-restart)
npm run dev
```

The server starts on **http://localhost:5000** by default.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `5000` | HTTP port |
| `MONGODB_URI` | `mongodb://localhost:27017/rescuenetx` | MongoDB connection string |
| `JWT_SECRET` | — | Secret key for JWT signing |
| `JWT_EXPIRE` | `7d` | JWT expiry duration |
| `AI_SERVICE_URL` | `http://localhost:8000` | URL of the AI microservice |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

---

## API Documentation

All routes are prefixed with `/api/v1`. Routes marked 🔒 require a Bearer token:

```
Authorization: Bearer <token>
```

### Health Check

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Server liveness check |

---

### Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register a new user |
| POST | `/login` | — | Login and receive JWT |

**POST /auth/register**
```json
{
  "name": "Alice Rescuer",
  "email": "alice@example.com",
  "password": "secret123",
  "role": "rescuer"
}
```
Response `201`:
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "...", "name": "Alice Rescuer", "email": "alice@example.com", "role": "rescuer" }
}
```

**POST /auth/login**
```json
{ "email": "alice@example.com", "password": "secret123" }
```
Response `200`: same shape as register.

---

### SOS — `/api/v1/sos`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | 🔒 | Send a new SOS alert |
| GET | `/` | — | List all SOS messages (paginated) |
| GET | `/:id` | — | Get a single SOS message |

**POST /sos** body:
```json
{
  "content": "Trapped under rubble!",
  "location": { "type": "Point", "coordinates": [77.209, 28.614] },
  "severity": "critical"
}
```

Query params for **GET /sos**: `page`, `limit`, `severity`, `is_delivered`

---

### Victim — `/api/v1/victim`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | 🔒 | Register a new victim |
| GET | `/` | — | List all victims |
| GET | `/nearby` | — | Victims within radius of coordinate |
| PATCH | `/:id` | 🔒 | Update victim record |

**GET /victim/nearby** query params: `lat`, `lng`, `radius` (metres, default 5000)

---

### Resource — `/api/v1/resource`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | 🔒 | Create a resource |
| GET | `/` | — | List resources (`?type=ambulance&availability=true`) |
| PATCH | `/:id` | 🔒 | Update a resource |
| DELETE | `/:id` | 🔒 | Delete a resource |

---

### AI — `/api/v1/ai`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/risk` | 🔒 | Analyse risk at a location |
| POST | `/prioritize` | 🔒 | Prioritise rescue operations |
| POST | `/resource-allocation` | 🔒 | Optimise resource allocation |

**POST /ai/risk** body:
```json
{
  "risk_type": "flood",
  "location": { "type": "Point", "coordinates": [77.23, 28.64] },
  "affected_area": 2000
}
```
If the AI service is offline, a mock response is returned with `"mock": true`.

---

### Device — `/api/v1/device`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register a field device |
| PATCH | `/:id/status` | — | Update connectivity status |
| GET | `/:id/location` | — | Get last-known GPS location |

---

### Sync — `/api/v1/sync`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/messages` | 🔒 | Bulk-sync offline messages |

**POST /sync/messages** body:
```json
{
  "device_id": "device-abc-123",
  "messages": [
    {
      "message_id": "uuid-...",
      "content": "Offline SOS",
      "message_type": "sos",
      "location": { "type": "Point", "coordinates": [77.21, 28.62] },
      "severity": "high"
    }
  ]
}
```

---

### Simulation — `/api/v1/simulation`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/hazards` | — | Active hazard zones |
| GET | `/floods` | — | Active flood zones |
| GET | `/blocked-roads` | — | Active road blockages |

---

## WebSocket Events

Connect to the server with a Socket.io client. The server broadcasts the following events to **all connected clients**:

| Event | Trigger | Payload |
|---|---|---|
| `new_sos` | New SOS message created | Full message object (with populated sender) |
| `victim_update` | Victim added or updated | `{ event: "added"/"updated", victim }` |
| `resource_update` | Resource created, updated, or deleted | `{ event: "created"/"updated"/"deleted", resource/resourceId }` |
| `risk_update` | AI risk analysis complete | `{ event: "new_risk", riskData, mock }` |

**Client example (JavaScript)**:
```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');

socket.on('new_sos', (data) => console.log('SOS received:', data));
socket.on('victim_update', (data) => console.log('Victim update:', data));
socket.on('resource_update', (data) => console.log('Resource update:', data));
socket.on('risk_update', (data) => console.log('Risk update:', data));

// Join a custom room
socket.emit('join_room', 'sector-A');
```

---

## Seed Credentials

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Rescuer | rescuer@rescuenetx.com | password123 |
| Civilian | civilian@rescuenetx.com | password123 |
| Admin | admin@rescuenetx.com | password123 |

---

## License

MIT
