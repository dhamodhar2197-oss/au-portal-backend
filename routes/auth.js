const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Helper function to hash password
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password, branch, rollNumber, year, semester, role } = req.body;
    const db = req.db;
    
    // Check if user already exists
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    if (role === 'student') {
      const existingRollNumber = db.students.find(s => s.rollNumber === rollNumber);
      if (existingRollNumber) {
        return res.status(400).json({ message: 'Roll number already exists' });
      }
    }
    
    // Hash password
    const hashedPassword = hashPassword(password);
    
    // Create user
    const userId = Date.now().toString();
    const user = {
      id: userId,
      name,
      email,
      phone: mobile,
      password: hashedPassword,
      role: role || 'student',
      department: branch,
      username: role === 'student' ? null : username,
      rollNumber: role === 'student' ? rollNumber : null,
      createdAt: new Date().toISOString()
    };
    
    db.users.push(user);
    
    // Create student profile if student
    if (role === 'student') {
      const student = {
        userId,
        rollNumber,
        year,
        semester,
        section: 'A',
        batch: `${year}-${parseInt(year) + 4}`,
        guardianName: '',
        guardianPhone: '',
        address: '',
        dateOfBirth: new Date().toISOString(),
        bloodGroup: '',
        createdAt: new Date().toISOString()
      };
      db.students.push(student);
    }
    
    req.saveDb();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
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
    const db = req.db;
    
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
    const user = db.users.find(u => u[queryField] === queryValue && u.role === role);
    
    console.log('Found user:', user ? user.name : 'Not found');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const hashedPassword = hashPassword(password);
    console.log('Password check:', { 
      inputHash: hashedPassword, 
      storedHash: user.password,
      match: user.password === hashedPassword 
    });
    
    if (user.password !== hashedPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
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
