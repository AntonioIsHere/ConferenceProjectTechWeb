const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Conference, User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'conference_secret_key_2024';

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all conferences
router.get('/', async (req, res) => {
  try {
    const conferences = await Conference.findAll({
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'reviewers', attributes: ['id', 'name', 'email'] }
      ],
      order: [['startDate', 'ASC']]
    });
    res.json(conferences);
  } catch (error) {
    console.error('Get conferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single conference
router.get('/:id', async (req, res) => {
  try {
    const conference = await Conference.findByPk(req.params.id, {
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'reviewers', attributes: ['id', 'name', 'email'] }
      ]
    });
    if (!conference) {
      return res.status(404).json({ message: 'Conference not found' });
    }
    res.json(conference);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create conference (Organizer only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ORGANIZER') {
      return res.status(403).json({ message: 'Only organizers can create conferences' });
    }

    const { name, location, description, startDate, endDate } = req.body;
    
    if (!name || !location || !startDate || !endDate) {
      return res.status(400).json({ message: 'Name, location, start date and end date are required' });
    }

    const conference = await Conference.create({
      name,
      location,
      description,
      startDate,
      endDate,
      organizerId: req.user.id
    });

    res.status(201).json(conference);
  } catch (error) {
    console.error('Create conference error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update conference (Organizer only)
router.put('/:id', auth, async (req, res) => {
  try {
    const conference = await Conference.findByPk(req.params.id);
    if (!conference) {
      return res.status(404).json({ message: 'Conference not found' });
    }

    if (conference.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Only the organizer can edit this conference' });
    }

    const { name, location, description, startDate, endDate } = req.body;
    await conference.update({ name, location, description, startDate, endDate });

    res.json(conference);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete conference (Organizer only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const conference = await Conference.findByPk(req.params.id);
    if (!conference) {
      return res.status(404).json({ message: 'Conference not found' });
    }

    if (conference.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Only the organizer can delete this conference' });
    }

    await conference.destroy();
    res.json({ message: 'Conference deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign reviewers to conference (Organizer only)
router.post('/:id/reviewers', auth, async (req, res) => {
  try {
    const conference = await Conference.findByPk(req.params.id);
    if (!conference) {
      return res.status(404).json({ message: 'Conference not found' });
    }

    if (conference.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Only the organizer can assign reviewers' });
    }

    const { reviewerIds } = req.body;
    if (!reviewerIds || !Array.isArray(reviewerIds)) {
      return res.status(400).json({ message: 'reviewerIds array is required' });
    }

    // Verify all users are reviewers
    const reviewers = await User.findAll({
      where: { id: reviewerIds, role: 'REVIEWER' }
    });

    await conference.setReviewers(reviewers);
    
    const updatedConference = await Conference.findByPk(req.params.id, {
      include: [{ model: User, as: 'reviewers', attributes: ['id', 'name', 'email'] }]
    });

    res.json(updatedConference);
  } catch (error) {
    console.error('Assign reviewers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reviewers (for assignment dropdown)
router.get('/users/reviewers', auth, async (req, res) => {
  try {
    const reviewers = await User.findAll({
      where: { role: 'REVIEWER' },
      attributes: ['id', 'name', 'email']
    });
    res.json(reviewers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
