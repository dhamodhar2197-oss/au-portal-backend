const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password, branch, rollNumber, year, semester, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    if (role === 'student') {
      const existingRollNumber = await User.findOne({ rollNumber });
      if (existingRollNumber) {
        return res.status(400).json({ message: 'Roll number already exists' });
      }
    }
    
    // Create user
    const user = new User({
      name,
      email,
      phone: mobile,
      password,
      role: role || 'student',
      department: branch,
      username: role === 'student' ? null : rollNumber,
      rollNumber: role === 'student' ? rollNumber : null
    });
    
    await user.save();
    
    // Create student profile if student
    if (role === 'student') {
      const student = new Student({
        userId: user._id,
        rollNumber,
        year,
        semester,
        section: 'A',
        batch: `${year}-${parseInt(year) + 4}`
      });
      await student.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      'annamacharya_jwt_secret_key_2024',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        username: user.username,
        rollNumber: user.rollNumber
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, rollNumber, password, role } = req.body;
    
    console.log('Login attempt:', { username, rollNumber, role });
    
    let queryField;
    let queryValue;
    
    if (role === 'student') {
      queryField = 'rollNumber';
      queryValue = rollNumber;
    } else {
      queryField = 'username';
      queryValue = username;
    }
    
    console.log('Query:', { queryField, queryValue });
    
    // Find user
    const user = await User.findOne({ [queryField]: queryValue, role });
    
    console.log('Found user:', user ? user.name : 'Not found');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      'annamacharya_jwt_secret_key_2024',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        username: user.username,
        rollNumber: user.rollNumber
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
