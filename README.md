# Agent Management System

A full-stack MERN application for managing agents and distributing CSV/Excel data efficiently.

---

## Features

- **Admin Authentication** - Secure login with JWT-based authentication
- **Agent Management** - Create, list, and delete agents
- **File Upload** - Upload CSV, XLSX, or XLS files with validation
- **Smart Distribution** - Distribute uploaded items equally among all agents
- **Distributed Lists** - View items assigned to each agent in a clean UI

---

## Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Frontend | React 18, React Router 6, Axios  |
| Backend  | Node.js, Express.js, Mongoose     |
| Database | MongoDB                           |
| Auth     | JWT (jsonwebtoken + bcryptjs)     |
| File Parsing | xlsx library                  |

---

## Prerequisites

- **Node.js** v16 or higher
- **MongoDB** v6 or higher (running locally or via Atlas)
- **npm** v8 or higher

---

## Installation

### 1. Clone & Navigate

```bash
cd /path/to/MernApp
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Configure environment variables in `backend/.env`:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/mernapp
JWT_SECRET=your_jwt_secret_key
```

> Note: macOS uses port 5000 for AirDrop/Control Center. We use port 5001 to avoid conflicts.

Seed the admin user:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API server runs at `http://localhost:5001`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Configure the API URL in `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm start
```

The app opens at `http://localhost:3000`.

---

## Default Admin Credentials

| Field    | Value                |
| -------- | -------------------- |
| Email    | admin@example.com    |
| Password | admin123             |

---

## API Endpoints

All API routes (except login) require an `x-auth-token` header with the JWT token.

### Authentication

| Method | Endpoint        | Description      |
| ------ | --------------- | ---------------- |
| POST   | `/api/auth/login` | Admin login      |

**Login Request:**
```json
{ "email": "admin@example.com", "password": "admin123" }
```

**Login Response:**
```json
{ "token": "<jwt_token>", "user": { "id": "...", "email": "..." } }
```

### Agents

| Method | Endpoint          | Description       |
| ------ | ----------------- | ----------------- |
| GET    | `/api/agents`     | List all agents   |
| POST   | `/api/agents`     | Add a new agent   |
| DELETE | `/api/agents/:id` | Delete an agent   |

**Add Agent Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+1234567890",
  "password": "password123"
}
```

### File Upload & Distribution

| Method | Endpoint          | Description                      |
| ------ | ----------------- | -------------------------------- |
| POST   | `/api/upload`     | Upload CSV and distribute items  |
| GET    | `/api/upload/lists` | Get latest distributed lists   |

**Upload:** Multipart form-data with a `file` field.

---

## CSV Format

Uploaded files must have **three columns** in the following order:

| Column    | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| FirstName | Text   | Yes      | Person's name   |
| Phone     | Number | Yes      | Phone number    |
| Notes     | Text   | No       | Additional info |

**Accepted file formats:** `.csv`, `.xlsx`, `.xls`

**Sample CSV:**
```csv
FirstName,Phone,Notes
John,1234567890,Note 1
Jane,1234567891,Note 2
Bob,1234567892,Note 3
```

---

## Distribution Logic

Items are distributed **equally** across all agents:

1. **Equal share** - Each agent gets `floor(totalItems / agentCount)` items
2. **Remainder** - Remaining items are distributed one each to agents sequentially (starting from the first agent)

**Example:** 23 items among 5 agents
- Agents 1-3 get **5** items each
- Agents 4-5 get **4** items each

---

## Project Structure

```
MernApp/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Login logic
│   │   ├── agentController.js  # Agent CRUD
│   │   └── uploadController.js # File upload & distribution
│   ├── middleware/
│   │   └── auth.js             # JWT verification
│   ├── models/
│   │   ├── User.js             # Admin user schema
│   │   ├── Agent.js            # Agent schema
│   │   └── List.js             # Distributed list schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── agents.js
│   │   └── upload.js
│   ├── uploads/                # Uploaded files directory
│   ├── .env
│   ├── package.json
│   ├── seed.js                 # Admin user seeder
│   └── server.js               # Entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Agents.js
│   │   │   ├── UploadCSV.js
│   │   │   └── DistributedLists.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── .env
│   └── package.json
├── sample.csv
└── README.md
```

---

## Troubleshooting

### Port already in use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :5001

# Kill the process
kill -9 <PID>
```

### MongoDB not running

```bash
# Start MongoDB
nohup mongod --dbpath /tmp/mongodb --logpath /tmp/mongod.log > /tmp/mongod.out 2>&1 &
```

### react-scripts command not found

```bash
cd frontend && rm -rf node_modules package-lock.json && npm install
```

---

## License

MIT
