const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const app = express();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .then(async () => {
    // Seed test users if they don't exist
    const testUsers = [
      {
        name: 'Student Test',
        email: 'student@test.com',
        phone: '9876543210',
        password: 'test123',
        role: 'student',
        department: 'CSE',
        username: null,
        rollNumber: '12345'
      },
      {
        name: 'Faculty Test',
        email: 'faculty@test.com',
        phone: '9876543211',
        password: 'faculty123',
        role: 'faculty',
        department: 'CSE',
        username: 'faculty1',
        rollNumber: null
      },
      {
        name: 'HOD Test',
        email: 'hod@test.com',
        phone: '9876543212',
        password: 'hod123',
        role: 'hod',
        department: 'CSE',
        username: 'hod1',
        rollNumber: null
      },
      {
        name: 'Admin Test',
        email: 'admin@test.com',
        phone: '9876543213',
        password: 'admin123',
        role: 'admin',
        department: 'CSE',
        username: 'admin1',
        rollNumber: null
      }
    ];

    for (const testUser of testUsers) {
      const existingUser = await User.findOne({ 
        $or: [
          { email: testUser.email },
          { username: testUser.username },
          { rollNumber: testUser.rollNumber }
        ]
      });
      
      if (!existingUser) {
        await User.create(testUser);
        console.log(`Created test user: ${testUser.role} - ${testUser.username || testUser.rollNumber}`);
      }
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
