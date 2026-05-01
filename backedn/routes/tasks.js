const router = require('express').Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const isMember = async (projectId, userId) => {
  const p = await Project.findById(projectId);
  return p && p.members.some(m => m.equals(userId));
};

// GET /tasks?projectId=...
router.get('/', auth, async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ message: 'projectId query param required' });
  if (!(await isMember(projectId, req.user.id))) return res.status(403).json({ message: 'Access denied' });
  const tasks = await Task.find({ project: projectId })
    .populate('assignedTo', 'name email').populate('createdBy', 'name email');
  res.json(tasks);
});

// POST /tasks
router.post('/', auth, async (req, res) => {
  const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;
  if (!title || !projectId) return res.status(400).json({ message: 'title and projectId are required' });
  if (!(await isMember(projectId, req.user.id))) return res.status(403).json({ message: 'Access denied' });
  const task = await Task.create({
    title, description, status, priority, dueDate,
    project: projectId, assignedTo, createdBy: req.user.id
  });
  res.status(201).json(task);
});

// GET /tasks/:id
router.get('/:id', auth, async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email').populate('createdBy', 'name email');
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (!(await isMember(task.project, req.user.id))) return res.status(403).json({ message: 'Access denied' });
  res.json(task);
});

// PUT /tasks/:id
router.put('/:id', auth, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (!(await isMember(task.project, req.user.id))) return res.status(403).json({ message: 'Access denied' });
  const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo'];
  fields.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
  await task.save();
  res.json(task);
});

// DELETE /tasks/:id
router.delete('/:id', auth, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (!(await isMember(task.project, req.user.id))) return res.status(403).json({ message: 'Access denied' });
  await task.deleteOne();
  res.json({ message: 'Task deleted' });
});

module.exports = router;
