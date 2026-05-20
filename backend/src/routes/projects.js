const express = require('express');
const { body } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { loadProject, requireAdmin } = require('../middleware/projectAccess');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('creator', 'name email')
      .populate('members.user', 'name email')
      .sort('-updatedAt');

    const data = projects.map((p) => {
      const membership = p.members.find((m) => m.user._id.toString() === req.user._id.toString());
      return {
        ...p.toObject(),
        myRole: membership?.role,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
  ],
  validate,
  async (req, res) => {
    try {
      const project = await Project.create({
        name: req.body.name,
        description: req.body.description || '',
        creator: req.user._id,
        members: [{ user: req.user._id, role: 'admin' }],
      });

      await project.populate([
        { path: 'creator', select: 'name email' },
        { path: 'members.user', select: 'name email' },
      ]);

      res.status(201).json({ success: true, data: { ...project.toObject(), myRole: 'admin' } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.get('/:id', loadProject, async (req, res) => {
  res.json({
    success: true,
    data: { ...req.project.toObject(), myRole: req.membership.role },
  });
});

router.put(
  '/:id',
  loadProject,
  requireAdmin,
  [body('name').optional().trim().notEmpty(), body('description').optional().trim()],
  validate,
  async (req, res) => {
    try {
      if (req.body.name) req.project.name = req.body.name;
      if (req.body.description !== undefined) req.project.description = req.body.description;
      await req.project.save();
      await req.project.populate([
        { path: 'creator', select: 'name email' },
        { path: 'members.user', select: 'name email' },
      ]);

      res.json({
        success: true,
        data: { ...req.project.toObject(), myRole: req.membership.role },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.delete('/:id', loadProject, requireAdmin, async (req, res) => {
  try {
    const Task = require('../models/Task');
    await Task.deleteMany({ project: req.project._id });
    await req.project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post(
  '/:id/members',
  loadProject,
  requireAdmin,
  [body('email').isEmail().withMessage('Valid member email is required')],
  validate,
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found with that email' });
      }

      const alreadyMember = req.project.members.some(
        (m) => m.user._id.toString() === user._id.toString()
      );
      if (alreadyMember) {
        return res.status(400).json({ success: false, message: 'User is already a member' });
      }

      req.project.members.push({ user: user._id, role: 'member' });
      await req.project.save();
      await req.project.populate('members.user', 'name email');

      res.json({ success: true, data: req.project.members });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.delete('/:id/members/:userId', loadProject, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove yourself as admin' });
    }

    const member = req.project.members.find((m) => m.user._id.toString() === userId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (member.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot remove another admin' });
    }

    req.project.members = req.project.members.filter((m) => m.user._id.toString() !== userId);
    await req.project.save();

    const Task = require('../models/Task');
    await Task.updateMany(
      { project: req.project._id, assignee: userId },
      { $unset: { assignee: 1 } }
    );

    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
