# Agent Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for managing agents and distributing CSV/Excel data items equally among them. Built as a machine test assessment for MERN Stack Developer role.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Functionality](#core-functionality)
3. [Tech Stack (Detailed)](#tech-stack-detailed)
4. [System Architecture](#system-architecture)
5. [How Each Module Works](#how-each-module-works)
   - [Backend Modules](#backend-modules)
   - [Frontend Modules](#frontend-modules)
6. [Authentication Flow](#authentication-flow)
7. [Distribution Algorithm](#distribution-algorithm)
8. [File Upload & Validation](#file-upload--validation)
9. [Database Schema Design](#database-schema-design)
10. [API Reference](#api-reference)
11. [Installation & Setup](#installation--setup)
12. [Project Structure](#project-structure)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

This application allows an **admin user** to:

1. Log in securely using email/password authentication
2. Create and manage **agents** (team members who will receive tasks)
3. Upload a **CSV or Excel file** containing a list of items (FirstName, Phone, Notes)
4. Automatically **distribute** those items equally among all registered agents
5. View the **distributed lists** per agent on a clean dashboard

The system simulates a real-world workflow where a manager uploads a lead list or task list and the system automatically assigns them to team members.

---

## Core Functionality

| Feature               | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| Admin Login           | JWT-based authentication with bcrypt password hashing                    |
| Agent CRUD            | Create, list, and delete agents (each has name, email, mobile, password) |
| File Upload           | Upload CSV, XLSX, or XLS files with format validation                    |
| Smart Distribution    | Equal distribution of items among all agents with remainder handling     |
| Distributed Lists     | Grouped view of items assigned to each agent                             |

---

## Tech Stack (Detailed)

### Backend

| Technology        | Purpose                                              | Version  |
| ----------------- | ---------------------------------------------------- | -------- |
| **Node.js**       | JavaScript runtime environment                       | v22.18.0 |
| **Express.js**    | Web framework for building REST APIs                 | ^4.18.2  |
| **MongoDB**       | NoSQL document database                              | v8.2.2   |
| **Mongoose**      | ODM (Object Data Modeling) library for MongoDB       | ^8.2.0   |
| **jsonwebtoken**  | JWT generation and verification                      | ^9.0.2   |
| **bcryptjs**      | Password hashing                                     | ^2.4.3   |
| **multer**        | File upload handling (multipart/form-data)           | ^1.4.5   |
| **xlsx**          | CSV/Excel file parsing (supports .csv, .xlsx, .xls)  | ^0.18.5  |
| **cors**          | Cross-Origin Resource Sharing                        | ^2.8.5   |
| **dotenv**        | Environment variable management                      | ^16.4.5  |

### Frontend

| Technology              | Purpose                                    | Version |
| ----------------------- | ------------------------------------------ | ------- |
| **React 18**            | UI component library                       | ^18.2.0 |
| **React Router 6**      | Client-side routing                        | ^6.22.0 |
| **Axios**               | HTTP client for API calls                  | ^1.6.7  |
| **react-scripts**       | Build tooling & dev server (Create React App) | 5.0.1 |
| **CSS**                 | Custom styling (no framework, lightweight) | -       |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Login   │  │  Agent   │  │  Upload  │  │ Distributed│  │
│  │  Page    │  │  Manager │  │  CSV     │  │  Lists     │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │             │             │              │         │
│       └─────────────┴─────────────┴──────────────┘         │
│                        │  Axios HTTP                       │
└────────────────────────┼────────────────────────────────────┘
                         │  JWT Token in x-auth-token header
┌────────────────────────┼────────────────────────────────────┐
│              Express.js REST API (port 5001)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Auth    │  │  Agent   │  │  Upload  │  │ Middleware │  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  (auth)    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────────┘  │
│       │             │             │                         │
│  ┌────┴────┐   ┌────┴────┐  ┌────┴────┐                    │
│  │  Auth   │   │  Agent  │  │  Upload │                    │
│  │Controller│  │Controller│  │Controller│                   │
│  └─────────┘   └─────────┘  └─────────┘                    │
│       │             │             │                         │
│       └─────────────┴─────────────┴──────────┐              │
│                                    Mongoose ODM              │
└────────────────────────────────────────────┼─────────────────┘
                                             │
                                    ┌────────┴────────┐
                                    │    MongoDB      │
                                    │  Database       │
                                    │  (mernapp)      │
                                    │                 │
                                    │  Collections:   │
                                    │  - users        │
                                    │  - agents       │
                                    │  - lists        │
                                    └─────────────────┘
```

---

## How Each Module Works

### Backend Modules

#### 1. `server.js` - Application Entry Point

- Loads environment variables from `.env` using dotenv
- Connects to MongoDB via the `connectDB()` function
- Configures Express with CORS and JSON body parsing
- Mounts three route modules under `/api/`
- Starts the HTTP server on the configured port (default: 5001)

```javascript
// Core structure:
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/upload', require('./routes/upload'));
app.listen(PORT);
```

#### 2. `config/db.js` - Database Connection

- Uses `mongoose.connect()` to establish a connection to MongoDB
- Reads `MONGO_URI` from environment variables
- Exits the process with error code 1 if connection fails
- Logs the connected host on success

#### 3. `middleware/auth.js` - JWT Authentication Middleware

- Extracts the JWT token from the `x-auth-token` request header
- Verifies the token using `jsonwebtoken.verify()` with the secret from `.env`
- If valid: attaches decoded user payload (`req.user`) and calls `next()`
- If missing or invalid: returns HTTP 401 with an error message
- Applied to all routes except login

#### 4. `models/User.js` - Admin User Schema

```
┌─────────────┬──────────┬──────────────┐
│ Field       │ Type     │ Constraints  │
├─────────────┼──────────┼──────────────┤
│ email       │ String   │ required,    │
│             │          │ unique,      │
│             │          │ lowercase    │
│ password    │ String   │ required,    │
│             │          │ minlength: 6 │
│ timestamps  │ true     │ createdAt,   │
│             │          │ updatedAt    │
└─────────────┴──────────┴──────────────┘
```

- **Password Hashing:** Uses a Mongoose `pre('save')` hook that hashes the password with bcryptjs (salt rounds: 10) before saving
- **Password Comparison:** Exposes a `comparePassword()` instance method that uses `bcrypt.compare()` for secure password verification

#### 5. `models/Agent.js` - Agent Schema

```
┌─────────────┬──────────┬──────────────┐
│ Field       │ Type     │ Constraints  │
├─────────────┼──────────┼──────────────┤
│ name        │ String   │ required     │
│ email       │ String   │ required,    │
│             │          │ unique,      │
│             │          │ lowercase    │
│ mobile      │ String   │ required     │
│ password    │ String   │ required,    │
│             │          │ minlength: 6 │
│ timestamps  │ true     │              │
└─────────────┴──────────┴──────────────┘
```

- Same password hashing mechanism as User
- The `getAgents` controller explicitly excludes the password field using `.select('-password')`

#### 6. `models/List.js` - Distributed List Schema

```
┌─────────────┬──────────┬─────────────────────┐
│ Field       │ Type     │ Description         │
├─────────────┼──────────┼─────────────────────┤
│ agent       │ ObjectId │ Reference to Agent  │
│             │ (ref)    │                     │
│ firstName   │ String   │ From CSV row        │
│ phone       │ String   │ From CSV row        │
│ notes       │ String   │ From CSV row        │
│ batchId     │ ObjectId │ Groups items from   │
│             │          │ same upload         │
│ timestamps  │ true     │                     │
└─────────────┴──────────┴─────────────────────┘
```

- `batchId` is a unique identifier generated per upload. All items from the same CSV file share the same `batchId`, allowing retrieval of the latest distribution

#### 7. `controllers/authController.js` - Authentication Logic

**Workflow:**
1. Receives `email` and `password` in request body
2. Validates that both fields are present
3. Looks up the user by email (case-insensitive)
4. If user not found → returns "Invalid credentials" (generic message, no user enumeration)
5. Compares the provided password with the stored hash using `comparePassword()`
6. If password doesn't match → returns "Invalid credentials"
7. If valid: creates a JWT payload `{ user: { id: user.id } }` and signs it with the secret, setting expiration to 1 day
8. Returns `{ token, user: { id, email } }` to the client

#### 8. `controllers/agentController.js` - Agent CRUD Logic

**getAgents:**
- Fetches all agents from MongoDB, sorted by `createdAt` descending
- Excludes the `password` field from results
- Returns the array of agents

**addAgent:**
- Validates all required fields (name, email, mobile, password)
- Checks password minimum length (6 characters)
- Checks for duplicate email (case-insensitive)
- Creates a new Agent document (password is auto-hashed by the pre-save hook)
- Returns the created agent (without password) with HTTP 201

**deleteAgent:**
- Finds agent by ID
- Returns 404 if not found
- Deletes the agent document
- Returns success message

#### 9. `controllers/uploadController.js` - File Upload & Distribution Logic

**uploadAndDistribute (the core algorithm):**

1. **File Validation:**
   - Checks if a file was uploaded
   - Validates file extension against allowed list [.csv, .xlsx, .xls]

2. **Agent Check:**
   - Fetches all agents from the database
   - Returns error if no agents exist

3. **File Parsing:**
   - Reads the uploaded file using `xlsx.readFile()`
   - Gets the first sheet from the workbook
   - Converts sheet data to JSON array using `xlsx.utils.sheet_to_json()`

4. **Data Extraction:**
   - Maps each row to extract first 3 columns as firstName, phone, notes
   - Filters out invalid rows (missing firstName or phone)

5. **Distribution Algorithm (see dedicated section below):**
   - Calculates base count per agent and remainder
   - Iterates through agents assigning items

6. **Database Insertion:**
   - Generates a new `batchId` (ObjectId) for this upload
   - Creates an array of List documents with agent references
   - Inserts all documents in a single `insertMany()` call for performance

7. **Response:**
   - Fetches and returns the grouped distribution with agent details

**getDistributedLists:**
- Finds all unique `batchId` values
- Selects the latest batch (last element in the array)
- Fetches all List items for that batch, populated with agent name and email
- Groups items by agent
- Returns grouped distribution

### Frontend Modules

#### 1. `App.js` - Root Component

- Wraps the entire app in `AuthProvider` (context) and `BrowserRouter`
- Defines two route groups:
  - `/login` → Login page (public)
  - `/*` → All other routes (protected by `ProtectedRoute` wrapper)
- `ProtectedRoute` checks if user is authenticated; if not, redirects to `/login`

#### 2. `context/AuthContext.js` - Authentication State Management

- Manages global authentication state using React Context
- On mount: checks `localStorage` for an existing token and sets Axios default header
- Provides `login()` and `logout()` functions to all child components
- `login()`: calls API, stores token in localStorage, sets Axios header, updates state
- `logout()`: removes token from localStorage, clears Axios header, sets state to null

#### 3. `services/api.js` - Axios Instance

- Creates a pre-configured Axios instance with base URL from environment variable
- Default base URL: `http://localhost:5001/api`

#### 4. `components/Login.js` - Login Page

- Form with email and password inputs
- Client-side validation (checks empty fields)
- Calls `login()` from AuthContext on submit
- Displays error messages from the API (e.g., "Invalid credentials")
- Redirects to `/dashboard` on success
- Shows loading state during API call

#### 5. `components/Dashboard.js` - Main Layout

- Two-column layout: sidebar (navigation) + main content area
- Sidebar contains:
  - Navigation links (Agents, Upload CSV, Distributed Lists) using React Router's `NavLink`
  - Logout button (calls `logout()` and redirects to `/login`)
- `NavLink` automatically gets an `active` CSS class for the current route
- Renders child components via nested `<Routes>`

#### 6. `components/Agents.js` - Agent Management

- Two sections in one page:
  - **Add Agent Form:** 2x2 grid layout with Name, Email, Mobile, Password fields
  - **Agents Table:** Lists all agents with Name, Email, Mobile, and Delete action
- On mount: fetches all agents from `GET /api/agents`
- Add: validates all fields, posts to `POST /api/agents`, prepends new agent to list
- Delete: confirms with `window.confirm()`, sends `DELETE /api/agents/:id`, removes from list
- Shows success/error messages with auto-dismiss

#### 7. `components/UploadCSV.js` - File Upload

- File input with `.csv,.xlsx,.xls` accept attribute
- Client-side file extension validation before upload
- Displays selected file name and size
- Checks agent count before allowing upload
- On upload: creates FormData, posts to `POST /api/upload` with multipart header
- On success: shows message with link to view distributed lists
- Shows loading state during upload

#### 8. `components/DistributedLists.js` - View Distribution

- On mount: fetches distribution from `GET /api/upload/lists`
- Renders a grid of cards, one per agent
- Each card shows:
  - Agent name and email as header
  - Table of assigned items (numbered: FirstName, Phone, Notes)
  - Total item count at the bottom
- Shows empty state when no lists have been distributed

---

## Authentication Flow

```
Client (Browser)                        Server (Express)
     │                                       │
     │  POST /api/auth/login                 │
     │  { email, password }                  │
     │──────────────────────────────────────>│
     │                                       │
     │       ┌───────────────────────────┐   │
     │       │ 1. Validate body fields   │   │
     │       │ 2. Find user by email     │   │
     │       │ 3. Compare password hash  │   │
     │       │ 4. Generate JWT token     │   │
     │       │    (expires: 1 day)       │   │
     │       └───────────────────────────┘   │
     │                                       │
     │  { token, user: { id, email } }       │
     │<──────────────────────────────────────│
     │                                       │
     │ Store token in localStorage           │
     │ Set x-auth-token header on Axios      │
     │                                       │
     │  GET /api/agents                      │
     │  x-auth-token: <jwt>                  │
     │──────────────────────────────────────>│
     │                                       │
     │       ┌───────────────────────────┐   │
     │       │ middleware/auth.js:       │   │
     │       │ 1. Extract token from     │   │
     │       │    x-auth-token header    │   │
     │       │ 2. jwt.verify(token,      │   │
     │       │    secret)                │   │
     │       │ 3. Attach decoded user    │   │
     │       │    to req.user            │   │
     │       │ 4. Call next()            │   │
     │       └───────────────────────────┘   │
     │                                       │
     │  [agent data]                         │
     │<──────────────────────────────────────│
```

---

## Distribution Algorithm

The distribution algorithm ensures fair allocation of items across all agents.

### Mathematical Formula

```
totalItems   = total number of valid rows in the uploaded file
agentCount   = total number of registered agents
base         = floor(totalItems / agentCount)  ← each agent gets at least this many
remainder    = totalItems % agentCount         ← extra items to distribute

For agent at index i (0-based):
  itemsForAgent[i] = base + (1 if i < remainder else 0)
```

### Pseudocode

```
function distribute(items, agents):
    n = length(items)
    k = length(agents)
    base = n // k          (integer division)
    remainder = n % k
    
    index = 0
    distribution = []
    
    for i = 0 to k-1:
        count = base + (1 if i < remainder else 0)
        agentItems = items[index : index + count]
        distribution.append({ agent: agents[i], items: agentItems })
        index += count
    
    return distribution
```

### Examples

| Total Items | Agents | Distribution                          |
| ----------- | ------ | ------------------------------------- |
| 10          | 5      | Each agent gets 2 items               |
| 13          | 5      | Agents 1-3: 3 items, Agents 4-5: 2   |
| 25          | 5      | Each agent gets 5 items               |
| 7           | 5      | Agents 1-2: 2 items, Agents 3-5: 1   |
| 1           | 5      | Agent 1: 1 item, Agents 2-5: 0 items |

### Implementation Detail

In `uploadController.js`, items are assigned by iterating through agents in the order they are returned from MongoDB and slicing the items array:

```javascript
for (let i = 0; i < totalAgents; i++) {
  const count = base + (i < remainder ? 1 : 0);
  const agentItems = [];
  for (let j = 0; j < count; j++) {
    const item = validRows[index++];
    agentItems.push({
      agent: agents[i]._id,
      firstName: item.firstName,
      phone: item.phone,
      notes: item.notes,
      batchId,
    });
  }
  distribution.push({ agent: agents[i], items: agentItems });
}
```

---

## File Upload & Validation

### Upload Flow

1. User selects a file via the file input (restricted to `.csv`, `.xlsx`, `.xls`)
2. **Client-side validation:** File extension is checked before enabling the upload button
3. File is sent as `multipart/form-data` to `POST /api/upload`
4. **Multer middleware:** Intercepts the file, validates extension again, saves to `uploads/` directory with a timestamp-based filename
5. **Controller validation:**
   - File existence check
   - Extension whitelist check
   - Agent existence check (at least 1 agent required)
   - File parsing using xlsx library
   - Row validation (firstName and phone required)
6. On failure at any step → returns appropriate HTTP 400/500 error with message
7. On success → returns distribution data

### Accepted File Formats

| Format | Extension | Notes                        |
| ------ | --------- | ---------------------------- |
| CSV    | `.csv`    | Comma-separated values       |
| Excel  | `.xlsx`   | Excel Open XML format        |
| Excel  | `.xls`    | Excel 97-2003 format         |

### Column Mapping

The system reads the first 3 columns from the file (regardless of header names):

| Column Index | Field      | Validation        |
| ------------ | ---------- | ----------------- |
| 1st column   | firstName  | Required, trimmed |
| 2nd column   | phone      | Required, trimmed |
| 3rd column   | notes      | Optional          |

This means the file doesn't need specific header names. The system reads columns positionally.

---

## Database Schema Design

### Entity Relationship

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│   User   │       │  Agent   │       │   List   │
├──────────┤       ├──────────┤       ├──────────┤
│ _id      │       │ _id      │       │ _id      │
│ email    │       │ name     │◄──────│ agent    │
│ password │       │ email    │       │ firstName│
│          │       │ mobile   │       │ phone    │
│          │       │ password │       │ notes    │
│          │       │          │       │ batchId  │
│          │       │          │       │          │
│ 1 doc    │       │ N docs   │       │ M docs   │
└──────────┘       └──────────┘       └──────────┘
```

### Collections

**users collection:** Stores admin credentials only (typically 1 document)
- email indexed with unique constraint
- password stored as bcrypt hash (never plain text)

**agents collection:** Stores agent profiles
- email indexed with unique constraint
- password stored as bcrypt hash
- mobile stored as string (supports country codes like +1, +91, etc.)

**lists collection:** Stores distributed items
- agent field references the agents collection
- batchId allows grouping items from the same upload
- Each upload creates a new batch of documents

---

## API Reference

### Authentication

#### `POST /api/auth/login`

Authenticates admin user and returns a JWT token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "6a1e61f4b28eb4d181c1ffcd",
    "email": "admin@example.com"
  }
}
```

**Error Responses:**
- `400` - `{ "message": "Please provide email and password" }`
- `400` - `{ "message": "Invalid credentials" }`
- `500` - `{ "message": "Server error" }`

### Agents

#### `GET /api/agents`

Retrieves all agents (password excluded).

**Headers:** `x-auth-token: <jwt_token>`

**Success Response (200):**
```json
[
  {
    "_id": "6a1e62a99879cb74a4bcb20f",
    "name": "Agent1",
    "email": "agent1@test.com",
    "mobile": "+1234567890",
    "createdAt": "2026-06-02T04:57:13.694Z",
    "updatedAt": "2026-06-02T04:57:13.694Z"
  }
]
```

#### `POST /api/agents`

Creates a new agent.

**Headers:** `x-auth-token: <jwt_token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+1234567890",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+1234567890",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Error Responses:**
- `400` - `{ "message": "All fields are required" }`
- `400` - `{ "message": "Password must be at least 6 characters" }`
- `400` - `{ "message": "Agent with this email already exists" }`

#### `DELETE /api/agents/:id`

Deletes an agent by ID.

**Headers:** `x-auth-token: <jwt_token>`

**Success Response (200):**
```json
{ "message": "Agent deleted successfully" }
```

**Error Responses:**
- `404` - `{ "message": "Agent not found" }`

### File Upload

#### `POST /api/upload`

Uploads a file and distributes items among agents.

**Headers:** `x-auth-token: <jwt_token>` | `Content-Type: multipart/form-data`

**Body:** Form-data with `file` field containing the CSV/Excel file

**Success Response (200):**
```json
{
  "message": "File uploaded and distributed successfully",
  "distribution": [
    {
      "agent": {
        "id": "...",
        "name": "Agent1",
        "email": "agent1@test.com"
      },
      "count": 2,
      "items": [
        {
          "_id": "...",
          "firstName": "John",
          "phone": "1234567890",
          "notes": "Note 1"
        }
      ]
    }
  ]
}
```

#### `GET /api/upload/lists`

Retrieves the latest distributed lists grouped by agent.

**Headers:** `x-auth-token: <jwt_token>`

**Success Response (200):**
```json
[
  {
    "agent": {
      "_id": "...",
      "name": "Agent1",
      "email": "agent1@test.com"
    },
    "items": [
      { "firstName": "John", "phone": "1234567890", "notes": "Note 1" }
    ]
  }
]
```

---

## Installation & Setup

### Prerequisites

- **Node.js** v16+ (v22.18.0 used in development)
- **MongoDB** v6+ (v8.2.2 used in development) - must be running locally or accessible via URI
- **npm** v8+

### Step 1: Start MongoDB

```bash
# Start MongoDB in background (macOS)
nohup mongod --dbpath /tmp/mongodb --logpath /tmp/mongod.log > /tmp/mongod.out 2>&1 &
```

Verify it's running:
```bash
pgrep mongod && echo "MongoDB is running"
```

### Step 2: Configure Backend

```bash
cd backend
npm install
```

The `.env` file is already configured:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/mernapp
JWT_SECRET=MernApp_jwt_secret_key_2024
```

> Note: Port 5000 is often used by macOS AirDrop/Control Center, so we use 5001.

### Step 3: Seed Admin User

```bash
npm run seed
```

Expected output:
```
MongoDB connected for seeding
Admin user created: admin@example.com / admin123
```

### Step 4: Start Backend Server

```bash
npm run dev
```

Expected output:
```
Server running on port 5001
MongoDB connected: localhost
```

### Step 5: Configure & Start Frontend

```bash
cd frontend
npm install
npm start
```

The `.env` file is pre-configured:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

The app opens automatically at `http://localhost:3000`.

### Default Credentials

| Field    | Value                |
| -------- | -------------------- |
| Email    | admin@example.com    |
| Password | admin123             |

---

## Project Structure

```
MernApp/
│
├── backend/                          # Express.js API server
│   ├── config/
│   │   └── db.js                    # MongoDB connection using Mongoose
│   │
│   ├── controllers/
│   │   ├── authController.js        # Login: validates credentials, returns JWT
│   │   ├── agentController.js       # CRUD: list, create, delete agents
│   │   └── uploadController.js      # Upload: parse CSV, distribute items, list results
│   │
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware for protected routes
│   │
│   ├── models/
│   │   ├── User.js                  # Admin user schema with bcrypt hashing
│   │   ├── Agent.js                 # Agent schema with bcrypt hashing
│   │   └── List.js                  # Distributed list item schema
│   │
│   ├── routes/
│   │   ├── auth.js                  # POST /api/auth/login
│   │   ├── agents.js                # GET/POST/DELETE /api/agents
│   │   └── upload.js                # POST /api/upload, GET /api/upload/lists
│   │
│   ├── uploads/                     # Uploaded files stored here by multer
│   │
│   ├── .env                         # Environment variables
│   ├── package.json                 # Dependencies & scripts
│   ├── seed.js                      # Admin user seeder script
│   └── server.js                    # Entry point: configures Express, mounts routes
│
├── frontend/                         # React.js client app
│   ├── public/
│   │   └── index.html              # HTML template
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js            # Login form with email/password
│   │   │   ├── Dashboard.js        # Main layout: sidebar + content area
│   │   │   ├── Agents.js           # Agent list + add form
│   │   │   ├── UploadCSV.js        # File upload with validation
│   │   │   └── DistributedLists.js # Grid of per-agent distributed items
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js      # Auth state management (login/logout/token)
│   │   │
│   │   ├── services/
│   │   │   └── api.js             # Axios instance with base URL
│   │   │
│   │   ├── App.js                  # Root: routes, auth protection
│   │   ├── App.css                 # All application styles
│   │   └── index.js               # React DOM entry point
│   │
│   ├── .env                        # REACT_APP_API_URL
│   └── package.json                # Dependencies & scripts
│
├── sample.csv                       # Test CSV file with 10 sample rows
└── README.md                        # This file
```

---

## Troubleshooting

### Backend fails to start

**Error: `EADDRINUSE` (port already in use)**
```bash
# Find and kill the process using port 5001
lsof -i :5001
kill -9 <PID>
```

**Error: MongoDB connection refused**
```bash
# Ensure MongoDB is running
pgrep mongod || mongod --dbpath /tmp/mongodb --logpath /tmp/mongod.log &
```

### Frontend fails to start

**Error: `react-scripts: command not found`**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: Port 3000 already in use**
```bash
lsof -i :3000
kill -9 <PID>
```

### Common Issues

| Issue                          | Likely Cause                 | Solution                        |
| ------------------------------ | ---------------------------- | ------------------------------- |
| Login returns "Invalid credentials" | Wrong email/password     | Run `npm run seed` to re-seed   |
| Upload returns "No agents found" | No agents created           | Add agents first from dashboard |
| Upload returns "Empty file"    | Wrong column format          | Ensure 3 columns: name, phone, notes |
| JWT errors                     | JWT_SECRET mismatch in .env | Check backend/.env for correct secret |

---

## License

MIT
