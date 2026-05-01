const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /users — list all users (for assigning tasks / adding members)
router.get('/', auth, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// GET /users/:id
router.get('/:id', auth, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

module.exports = router;
