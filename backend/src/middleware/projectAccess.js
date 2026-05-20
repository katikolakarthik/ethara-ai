const Project = require('../models/Project');

const memberUserId = (member) => {
  const user = member.user;
  return (user?._id || user).toString();
};

const getMembership = (project, userId) =>
  project.members.find((m) => memberUserId(m) === userId.toString());

const loadProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId || req.params.id)
      .populate('members.user', 'name email')
      .populate('creator', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    let membership = getMembership(project, req.user._id);

    if (!membership) {
      const creatorId = (project.creator?._id || project.creator).toString();
      if (creatorId === req.user._id.toString()) {
        project.members.push({ user: req.user._id, role: 'admin' });
        await project.save();
        membership = { user: req.user._id, role: 'admin' };
      } else {
        return res.status(403).json({ success: false, message: 'Access denied to this project' });
      }
    }

    req.project = project;
    req.membership = membership;
    req.isAdmin = membership.role === 'admin';
    next();
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { loadProject, requireAdmin, getMembership, memberUserId };
