const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());

const api = express.Router();

api.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Team Task API is running',
    dbConfigured: Boolean(process.env.MONGODB_URI),
  });
});

api.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    const message =
      error.message === 'MONGODB_URI is not configured'
        ? 'Server misconfigured: add MONGODB_URI in Vercel environment variables'
        : 'Database connection failed — check MongoDB Atlas IP allowlist (0.0.0.0/0)';
    res.status(500).json({ success: false, message });
  }
});

api.use('/auth', authRoutes);
api.use('/projects', projectRoutes);
api.use('/projects/:id/tasks', taskRoutes);
api.use('/projects/:id/dashboard', dashboardRoutes);

// Local dev: requests come as /api/auth/login
app.use('/api', api);
// Vercel Services (routePrefix /api): requests arrive as /auth/login
app.use('/', api);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
