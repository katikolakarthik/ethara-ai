const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');
const { loadProject } = require('../middleware/projectAccess');

const router = express.Router({ mergeParams: true });

router.use(protect);
router.get('/', loadProject, async (req, res) => {
  try {
    const projectId = req.project._id;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const match = { project: projectId };
    if (!req.isAdmin) {
      match.assignee = req.user._id;
    }

    const [totalTasks, statusAgg, userAgg, overdueTasks] = await Promise.all([
      Task.countDocuments(match),
      Task.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { ...match, assignee: { $ne: null } } },
        {
          $group: {
            _id: '$assignee',
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            name: '$user.name',
            email: '$user.email',
            count: 1,
          },
        },
      ]),
      Task.find({
        ...match,
        dueDate: { $lt: now },
        status: { $ne: 'done' },
      })
        .populate('assignee', 'name email')
        .sort('dueDate')
        .limit(20),
    ]);

    const tasksByStatus = {
      todo: 0,
      in_progress: 0,
      done: 0,
    };
    statusAgg.forEach((s) => {
      tasksByStatus[s._id] = s.count;
    });

    res.json({
      success: true,
      data: {
        totalTasks,
        tasksByStatus,
        tasksPerUser: userAgg,
        overdueTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
