require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(express.json());

app.use('/auth',     require('./routes/auth'));
app.use('/users',    require('./routes/users'));
app.use('/projects', require('./routes/projects'));
app.use('/tasks',    require('./routes/tasks'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
