const router = require('express').Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// GET /projects — projects where user is owner or member
router.get('/', auth, async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user.id }, { members: req.user.id }]
  }).populate('owner', 'name email').populate('members', 'name email');
  res.json(projects);
});

// POST /projects
router.post('/', auth, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  const project = await Project.create({ name, description, owner: req.user.id, members: [req.user.id] });
  res.status(201).json(project);
});

// GET /projects/:id
router.get('/:id', auth, async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email').populate('members', 'name email');
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (!project.members.some(m => m._id.equals(req.user.id)))
    return res.status(403).json({ message: 'Access denied' });
  res.json(project);
});

// PUT /projects/:id
router.put('/:id', auth, async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (!project.owner.equals(req.user.id)) return res.status(403).json({ message: 'Only owner can update' });
  const { name, description } = req.body;
  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  await project.save();
  res.json(project);
});

// POST /projects/:id/members — add a member
router.post('/:id/members', auth, async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId is required' });
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (!project.owner.equals(req.user.id)) return res.status(403).json({ message: 'Only owner can add members' });
  if (!project.members.includes(userId)) project.members.push(userId);
  await project.save();
  res.json(project);
});

// DELETE /projects/:id/members/:userId — remove a member
router.delete('/:id/members/:userId', auth, async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (!project.owner.equals(req.user.id)) return res.status(403).json({ message: 'Only owner can remove members' });
  project.members = project.members.filter(m => !m.equals(req.params.userId));
  await project.save();
  res.json(project);
});

// DELETE /projects/:id
router.delete('/:id', auth, async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (!project.owner.equals(req.user.id)) return res.status(403).json({ message: 'Only owner can delete' });
  await project.deleteOne();
  res.json({ message: 'Project deleted' });
});

module.exports = router;
