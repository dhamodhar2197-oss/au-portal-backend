const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password, branch, rollNumber, year, semester, role } = req.body;
    const users = req.users;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    if (role === 'student') {
      const existingRollNumber = users.find(u => u.rollNumber === rollNumber);
      if (existingRollNumber) {
        return res.status(400).json({ message: 'Roll number already exists' });
      }
    }
    
    // Create user
    const user = {
      _id: Date.now().toString(),
      name,
      email,
      phone: mobile,
      password,
      role: role || 'student',
      department: branch,
      username: role === 'student' ? null : rollNumber,
      rollNumber: role === 'student' ? rollNumber : null
    };
    
    users.push(user);
    
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
    const users = req.users;
    
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
    const user = users.find(u => u[queryField] === queryValue && u.role === role);
    
    console.log('Found user:', user ? user.name : 'Not found');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    if (user.password !== password) {
      console.log('Password mismatch');
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

// Get all users (for admin)
router.get('/users', async (req, res) => {
  try {
    const users = req.users;
    const usersWithoutPassword = users.map(u => ({ ...u, password: undefined }));
    res.json(usersWithoutPassword);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

module.exports = router;
