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

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    const message =
      error.message === 'MONGODB_URI is not configured'
        ? 'Server misconfigured: MONGODB_URI missing in Vercel environment variables'
        : 'Database connection failed';
    res.status(500).json({ success: false, message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Team Task API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:id/tasks', taskRoutes);
app.use('/api/projects/:id/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
