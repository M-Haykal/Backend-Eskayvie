const express = require('express');
const { createReview, getAllReviews, getReviewById, updateReview, deleteReview } = require('./review.service');
const { verifyToken, verifyRole } = require('../middelware/authMiddelware');
const router = express.Router();

router.post('/', async (req, res) => {
    const { userId, productId, rating, comment } = req.body;
    try {
        const review = await createReview(userId, productId, rating, comment);
        res.status(201).json(review);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

router.get('/',verifyToken, async (req, res) => {
    try {
        const reviews = await getAllReviews();
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching reviews' });
    }
});

router.get('/:id',verifyToken, async (req, res) => {
    const  id  = parseInt(req.params.id)
    try {
        const review = await getReviewById(parseInt(id));
        res.status(200).json(review);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

router.put('/:id',verifyToken, async (req, res) => {
    const  id  = parseInt(req.params.id)
    const { rating, comment } = req.body;
    try {
        const updatedReview = await updateReview(parseInt(id), { rating, comment });
        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

router.delete('/:id',verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedReview = await deleteReview(parseInt(id));
        res.status(200).json({ message: 'Review deleted successfully', review: deletedReview });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

module.exports = router;
