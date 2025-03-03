const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, rollNumber, email, id } = req.body;
    if (!name || !rollNumber) return res.status(400).json({ message: 'Name and rollNumber are required' });

    const student = new Student({ name, rollNumber, email: email || '', id: id || Date.now().toString() });
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findOne({ id: req.params.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.name = req.body.name || student.name;
    student.rollNumber = req.body.rollNumber || student.rollNumber;
    student.email = req.body.email || student.email;
    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findOne({ id: req.params.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Use deleteOne() instead of remove()
    await Student.deleteOne({ id: req.params.id });
    await Attendance.deleteMany({ studentId: req.params.id });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const students = req.body.map(student => {
      if (!student.name || !student.rollNumber) {
        throw new Error('Each student must have a name and rollNumber');
      }
      return {
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email || '',
        id: student.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
      };
    });
    const savedStudents = await Student.insertMany(students);
    res.status(201).json(savedStudents);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;