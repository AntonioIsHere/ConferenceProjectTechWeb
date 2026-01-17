const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Review, Paper, User } = require('../models');

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

// Get reviews for a paper
router.get('/paper/:paperId', auth, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { paperId: req.params.paperId },
      include: [{ model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] }]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my reviews (Reviewer only)
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'REVIEWER') {
      return res.status(403).json({ message: 'Only reviewers can access this' });
    }

    const reviews = await Review.findAll({
      where: { reviewerId: req.user.id },
      include: [
        { 
          model: Paper, 
          include: [{ model: User, as: 'author', attributes: ['id', 'name'] }]
        }
      ]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit review (Reviewer only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'REVIEWER') {
      return res.status(403).json({ message: 'Only reviewers can submit reviews' });
    }

    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only submit your own reviews' });
    }

    const { status, feedback } = req.body;
    
    if (!status || !['ACCEPTED', 'REVISION_REQUESTED'].includes(status)) {
      return res.status(400).json({ message: 'Status must be ACCEPTED or REVISION_REQUESTED' });
    }

    await review.update({ status, feedback });

    // Update paper status based on all reviews
    const paper = await Paper.findByPk(review.paperId, {
      include: [{ model: Review }]
    });

    const allReviews = paper.Reviews;
    const allAccepted = allReviews.every(r => r.status === 'ACCEPTED');
    const anyRevisionRequested = allReviews.some(r => r.status === 'REVISION_REQUESTED');

    if (allAccepted) {
      await paper.update({ status: 'ACCEPTED' });
    } else if (anyRevisionRequested) {
      await paper.update({ status: 'REVISION_REQUESTED' });
    }

    res.json(review);
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
