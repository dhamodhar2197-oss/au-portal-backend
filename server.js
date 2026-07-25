const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// In-memory database
let users = [];

// Seed test users
const seedUsers = () => {
  if (users.length === 0) {
    users = [
      {
        _id: '1',
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
        _id: '2',
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
        _id: '3',
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
        _id: '4',
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
    console.log('Seeded test users');
  }
};

seedUsers();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make users available to routes
app.use((req, res, next) => {
  req.users = users;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
