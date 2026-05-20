# Team Task Management

A full-stack collaborative task management web application (simplified Trello/Asana). Users can sign up, create projects, invite members, assign tasks, and track progress with role-based access control.

## Live Demo

> Deploy to Vercel and add your live URL here after deployment.

## Features

- **Authentication** — Signup (name, email, password) and JWT-based login
- **Projects** — Create projects; creator becomes Admin; add/remove members by email
- **Tasks** — Title, description, due date, priority (low/medium/high), status (To Do / In Progress / Done)
- **Dashboard** — Total tasks, tasks by status, tasks per user, overdue tasks
- **RBAC** — Admins manage tasks and members; members view and update only their assigned tasks

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, Vite, React Router        |
| Backend  | Node.js, Express, JWT, bcrypt       |
| Database | MongoDB (Mongoose)                  |
| Deploy   | Vercel (serverless API + static UI) |

## Project Structure

```
team-task-manager/
├── api/                 # Vercel serverless entry
├── backend/             # Express API source
│   └── src/
│       ├── models/      # User, Project, Task
│       ├── routes/      # auth, projects, tasks, dashboard
│       └── middleware/  # JWT auth, RBAC
├── frontend/            # React SPA
└── vercel.json
```

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd "ethara ai"
npm run install:all
```

### 2. Backend environment

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/teamtasks
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Run locally

```bash
# Terminal 1 — API on http://localhost:5000
npm run dev:backend

# Terminal 2 — UI on http://localhost:5173
npm run dev:frontend
```

Or run both together:

```bash
npm run dev
```

The frontend proxies `/api` requests to the backend during development.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Project details |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |
| GET | `/api/projects/:id/tasks` | List tasks |
| POST | `/api/projects/:id/tasks` | Create task (Admin) |
| PUT | `/api/projects/:id/tasks/:taskId` | Update task |
| DELETE | `/api/projects/:id/tasks/:taskId` | Delete task (Admin) |
| GET | `/api/projects/:id/dashboard` | Dashboard stats |

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Team task management app"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
2. Framework preset: **Other** (uses `vercel.json`)
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret string |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |

4. Deploy

### 3. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Database Access → create user
3. Network Access → allow `0.0.0.0/0` (for Vercel serverless)
4. Connect → copy connection string into `MONGODB_URI`

## Demo Video Checklist

Record a 2–5 minute walkthrough covering:

1. Signup and login
2. Create a project (you become Admin)
3. Add a member by email (second account)
4. Create and assign tasks
5. Member updates task status
6. Dashboard metrics
7. Role differences (Admin vs Member)

## License

MIT
