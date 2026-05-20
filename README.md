# Team Tasks — Collaborative project & task management

A production-style **full-stack** app: multiple users create projects, invite members, assign tasks (with due dates and priorities), and track progress—similar in spirit to Trello or Asana, with **Admin** vs **Member** roles.

---

## Live application

| | Link |
|---|------|
| **Production (Vercel)** | [**https://ethara-ai-ldu5.vercel.app**](https://ethara-ai-ldu5.vercel.app) |
| **API health check** | [https://ethara-ai-ldu5.vercel.app/api/health](https://ethara-ai-ldu5.vercel.app/api/health) |

> Open the app in the browser to sign up, create a project (you become **Admin**), add members by email, and manage tasks.

---

## Demo & media

Project walkthrough assets live under **`screenshots/`**:

| Type | Location |
|------|----------|
| **Screenshots** | `screenshots/` — UI captures (login, projects, tasks, dashboard, etc.) |
| **Demo video (2–5 min)** | `screenshots/videos/` — e.g. `20260520-0650-11.4135463.mp4` |

Add your own PNG/JPG files to `screenshots/` and embed them in GitHub README if you want inline images:

```markdown
![Login](./screenshots/login.png)
```

---

## Repository

Replace with your public repo if it differs:

**GitHub:** [github.com/katikolakarthik/ethara-ai](https://github.com/katikolakarthik/ethara-ai)

```bash
git clone https://github.com/katikolakarthik/ethara-ai.git
cd ethara-ai
```

---

## Feature summary (assignment alignment)

| Requirement | Implementation |
|-------------|----------------|
| **Auth** | Signup (name, email, password), JWT login |
| **Projects** | Create project → creator is **Admin**; add/remove members by email |
| **Tasks** | Title, description, due date, priority (low / medium / high), status (To Do / In Progress / Done) |
| **Assignment** | Tasks assigned to project members |
| **Dashboard** | Totals, breakdown by status, tasks per user, overdue items |
| **RBAC** | **Admin:** full task + member management · **Member:** see and update **assigned** tasks only (status updates) |
| **Stack** | REST API, MongoDB (Mongoose), React (Vite) frontend |
| **Deploy** | Full stack on **Vercel** (frontend + Express API), env vars for secrets |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express, JWT, bcryptjs, express-validator |
| Database | MongoDB Atlas + Mongoose |
| Hosting | [Vercel](https://vercel.com) — Vite static app + Express service (`experimentalServices` in `vercel.json`) |

---

## Project structure

```
ethara-ai/
├── backend/              # Express API
│   ├── index.js          # Vercel entry (exports app)
│   └── src/
│       ├── config/       # DB connection
│       ├── models/       # User, Project, Task
│       ├── routes/       # auth, projects, tasks, dashboard
│       └── middleware/   # JWT + project RBAC
├── frontend/             # React SPA
├── api/                  # Legacy/aux entry (optional)
├── screenshots/          # Screenshots + videos for submission
├── vercel.json           # Services: frontend (/) + api (/api)
└── README.md
```

---

## Local development

### Prerequisites

- **Node.js** 18+
- **MongoDB Atlas** (recommended) or local MongoDB

### Install

```bash
npm run install:all
# or: npm install && npm install --prefix backend && npm install --prefix frontend
```

### Environment

Copy `backend/.env.example` to **`backend/.env`** and fill in:

```env
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/teamtasks
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Atlas:** enable **Network Access** → `0.0.0.0/0` if you deploy serverless.

### Run

```bash
# API: http://localhost:5000   ·  UI: http://localhost:5173
npm run dev
```

Vite proxies `/api` → backend in development.

---

## API overview

Base path: `/api` (production and local).

| Method | Path | Notes |
|--------|------|------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | JWT |
| GET | `/api/auth/me` | Protected |
| GET/POST | `/api/projects` | List / create |
| GET/PUT/DELETE | `/api/projects/:id` | Detail / admin update / admin delete |
| POST / DELETE | `/api/projects/:id/members` · `.../members/:userId` | Admin |
| GET/POST | `/api/projects/:id/tasks` | Member sees assigned only |
| PUT / DELETE | `/api/projects/:id/tasks/:taskId` | Rules per role |
| GET | `/api/projects/:id/dashboard` | Stats |

Full contract lives in route files under `backend/src/routes/`.

---

## Deploy on Vercel (reference)

1. Push this repo to GitHub.
2. **New Project** on [vercel.com](https://vercel.com) → import repo.
3. **Root directory:** repository root (monorepo with `vercel.json`).
4. **Preset:** Services — `experimentalServices` mounts **frontend** at `/` and **backend** at `/api`.
5. **Environment variables** (Production + Preview):

   | Variable | Description |
   |----------|-------------|
   | `MONGODB_URI` | Atlas SRV connection string |
   | `JWT_SECRET` | Strong secret (match nothing in git) |
   | `JWT_EXPIRES_IN` | e.g. `7d` |
   | `NODE_ENV` | `production` |

6. Redeploy after changing env vars.

### Quick production checks

- [`/api/health`](https://ethara-ai-ldu5.vercel.app/api/health) returns JSON with `"success": true`.
- Sign up → create project → add member → create task → dashboard counts update.

### Common issues

| Symptom | What to check |
|---------|----------------|
| Login timeout / “Route not found” | Env vars on Vercel; latest `vercel.json` + route mounting; redeploy |
| DB errors | `MONGODB_URI` correct; Atlas IP allowlist; password URL-encoded if needed |
| Port **5000** in use locally | Stop duplicate `node` processes or change `PORT` in `.env` |

---

## Assignment submission checklist

- [x] **Live URL:** [https://ethara-ai-ldu5.vercel.app](https://ethara-ai-ldu5.vercel.app)
- [ ] **GitHub** — public repo link in README (update if different from above)
- [x] **README** — setup, env, API, deploy, troubleshooting
- [ ] **Demo video** — 2–5 minutes; store under `screenshots/videos/` (or link to YouTube/Loom)

**Suggested demo script:** signup → login → create project (Admin) → add second user by email → create & assign tasks → member updates status → open dashboard → briefly contrast Admin vs Member.

---

## Security notes

- Never commit **`backend/.env`** or real secrets.
- Use a long random `JWT_SECRET` in production.
- Rotate Atlas credentials if they were ever exposed.

---

## License

MIT
