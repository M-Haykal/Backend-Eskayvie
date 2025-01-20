const express = require('express');
const { createReview, getAllReviewsProduct, getReviewProductById, updateReview, deleteReviewProduct } = require('./review.service');
const { verifyToken, verifyRole } = require('../middelware/authMiddelware');
const router = express.Router();

router.post('/', async (req, res) => {
    const data = req.body;
    try {
        const review = await createReview(data);
        res.status(201).json(review);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const reviews = await getAllReviewsProduct();
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching reviews' });
    }
});

router.get('/:id', async (req, res) => {
    const  id  = parseInt(req.params.id)
    try {
        const review = await getReviewProductById(parseInt(id));
        res.status(200).json(review);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    const  id  = parseInt(req.params.id)
    const data = req.body;
    try {
        const updatedReview = await updateReview(parseInt(id), data);
        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedReview = await deleteReviewProduct(parseInt(id));
        res.status(200).json({ message: 'Review deleted successfully', review: deletedReview });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

module.exports = router;
