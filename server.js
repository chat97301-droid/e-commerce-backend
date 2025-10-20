const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for simplicity, or use 'http://127.0.0.1:5500'
  credentials: true
}));
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect('mongodb+srv://ar7846159_db_user:IVPlxwCt0fapDa6C@cluster0.ycdttay.mongodb.net/signupdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB Atlas successfully');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
