const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Paper, Conference, User, Review } = require('../models');

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

// Multer config for file upload (max 10MB)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  }
});

// Get all papers (filtered by role)
router.get('/', auth, async (req, res) => {
  try {
    let papers;
    
    if (req.user.role === 'AUTHOR') {
      // Authors see only their papers
      papers = await Paper.findAll({
        where: { authorId: req.user.id },
        include: [
          { model: Conference, attributes: ['id', 'name'] },
          { model: Review, include: [{ model: User, as: 'reviewer', attributes: ['id', 'name'] }] }
        ]
      });
    } else if (req.user.role === 'REVIEWER') {
      // Reviewers see papers assigned to them
      papers = await Paper.findAll({
        include: [
          { model: Conference, attributes: ['id', 'name'] },
          { model: User, as: 'author', attributes: ['id', 'name'] },
          { 
            model: Review, 
            where: { reviewerId: req.user.id },
            required: true
          }
        ]
      });
    } else if (req.user.role === 'ORGANIZER') {
      // Organizers see all papers for their conferences
      const conferences = await Conference.findAll({
        where: { organizerId: req.user.id },
        attributes: ['id']
      });
      const conferenceIds = conferences.map(c => c.id);
      
      papers = await Paper.findAll({
        where: { conferenceId: conferenceIds },
        include: [
          { model: Conference, attributes: ['id', 'name'] },
          { model: User, as: 'author', attributes: ['id', 'name'] },
          { model: Review, include: [{ model: User, as: 'reviewer', attributes: ['id', 'name'] }] }
        ]
      });
    }

    res.json(papers);
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit a new paper (Author only)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'AUTHOR') {
      return res.status(403).json({ message: 'Only authors can submit papers' });
    }

    const { title, conferenceId } = req.body;
    
    if (!title || !conferenceId || !req.file) {
      return res.status(400).json({ message: 'Title, conference, and file are required' });
    }

    const conference = await Conference.findByPk(conferenceId, {
      include: [{ model: User, as: 'reviewers' }]
    });
    
    if (!conference) {
      return res.status(404).json({ message: 'Conference not found' });
    }

    const paper = await Paper.create({
      title,
      fileUrl: `/uploads/${req.file.filename}`,
      conferenceId,
      authorId: req.user.id,
      status: 'SUBMITTED'
    });

    // Auto-assign 2 reviewers from conference's reviewer pool
    const reviewers = conference.reviewers || [];
    const assignedReviewers = reviewers.slice(0, 2);

    for (const reviewer of assignedReviewers) {
      await Review.create({
        paperId: paper.id,
        reviewerId: reviewer.id,
        status: 'PENDING'
      });
    }

    if (assignedReviewers.length > 0) {
      await paper.update({ status: 'UNDER_REVIEW' });
    }

    const createdPaper = await Paper.findByPk(paper.id, {
      include: [
        { model: Conference, attributes: ['id', 'name'] },
        { model: Review, include: [{ model: User, as: 'reviewer', attributes: ['id', 'name'] }] }
      ]
    });

    res.status(201).json(createdPaper);
  } catch (error) {
    console.error('Submit paper error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload new version of paper (Author only)
router.put('/:id/revision', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'AUTHOR') {
      return res.status(403).json({ message: 'Only authors can upload revisions' });
    }

    const paper = await Paper.findByPk(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    if (paper.authorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own papers' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    await paper.update({
      fileUrl: `/uploads/${req.file.filename}`,
      version: paper.version + 1,
      status: 'UNDER_REVIEW'
    });

    // Reset review statuses to PENDING
    await Review.update(
      { status: 'PENDING', feedback: null },
      { where: { paperId: paper.id } }
    );

    const updatedPaper = await Paper.findByPk(paper.id, {
      include: [
        { model: Conference, attributes: ['id', 'name'] },
        { model: Review }
      ]
    });

    res.json(updatedPaper);
  } catch (error) {
    console.error('Upload revision error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single paper
router.get('/:id', auth, async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.id, {
      include: [
        { model: Conference, attributes: ['id', 'name'] },
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
        { model: Review, include: [{ model: User, as: 'reviewer', attributes: ['id', 'name'] }] }
      ]
    });

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
