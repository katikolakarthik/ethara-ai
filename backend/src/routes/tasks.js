const express = require('express');
const { body } = require('express-validator');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');
const { loadProject, requireAdmin } = require('../middleware/projectAccess');
const validate = require('../middleware/validate');

const router = express.Router({ mergeParams: true });

router.use(protect);

const taskPopulate = [
  { path: 'assignee', select: 'name email' },
  { path: 'createdBy', select: 'name email' },
];

router.get('/', loadProject, async (req, res) => {
  try {
    const filter = { project: req.project._id };

    if (!req.isAdmin) {
      filter.assignee = req.user._id;
    }

    const tasks = await Task.find(filter).populate(taskPopulate).sort('-createdAt');
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post(
  '/',
  loadProject,
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('assignee').optional().isMongoId(),
    body('status').optional().isIn(['todo', 'in_progress', 'done']),
  ],
  validate,
  async (req, res) => {
    try {
      if (req.body.assignee) {
        const isMember = req.project.members.some(
          (m) => m.user._id.toString() === req.body.assignee
        );
        if (!isMember) {
          return res.status(400).json({ success: false, message: 'Assignee must be a project member' });
        }
      }

      const task = await Task.create({
        title: req.body.title,
        description: req.body.description || '',
        dueDate: req.body.dueDate || null,
        priority: req.body.priority || 'medium',
        status: req.body.status || 'todo',
        project: req.project._id,
        assignee: req.body.assignee || null,
        createdBy: req.user._id,
      });

      await task.populate(taskPopulate);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.put(
  '/:taskId',
  loadProject,
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('dueDate').optional().isISO8601(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['todo', 'in_progress', 'done']),
    body('assignee').optional(),
  ],
  validate,
  async (req, res) => {
    try {
      const task = await Task.findOne({ _id: req.params.taskId, project: req.project._id });
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      if (!req.isAdmin) {
        const isAssignee = task.assignee?.toString() === req.user._id.toString();
        if (!isAssignee) {
          return res.status(403).json({ success: false, message: 'You can only update your assigned tasks' });
        }
        if (req.body.status === undefined) {
          return res.status(403).json({
            success: false,
            message: 'Members can only update task status',
          });
        }
        task.status = req.body.status;
      } else {
        if (req.body.title) task.title = req.body.title;
        if (req.body.description !== undefined) task.description = req.body.description;
        if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate || null;
        if (req.body.priority) task.priority = req.body.priority;
        if (req.body.status) task.status = req.body.status;
        if (req.body.assignee !== undefined) {
          if (req.body.assignee) {
            const isMember = req.project.members.some(
              (m) => m.user._id.toString() === req.body.assignee
            );
            if (!isMember) {
              return res.status(400).json({ success: false, message: 'Assignee must be a project member' });
            }
          }
          task.assignee = req.body.assignee || null;
        }
      }

      await task.save();
      await task.populate(taskPopulate);
      res.json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.delete('/:taskId', loadProject, requireAdmin, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      project: req.project._id,
    });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
