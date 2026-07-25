const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  year: {
    type: Number,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  section: {
    type: String,
    default: 'A'
  },
  batch: {
    type: String,
    required: true
  },
  guardianName: {
    type: String,
    required: true
  },
  guardianPhone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  bloodGroup: {
    type: String
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  attendance: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance'
  }],
  marks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Marks'
  }],
  fees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fee'
  }]
});

module.exports = mongoose.model('Student', studentSchema);
