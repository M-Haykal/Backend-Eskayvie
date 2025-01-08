const { createReviewInDB, getAllReviewsFromDB, getReviewByIdFromDB, updateReviewInDB, deleteReviewFromDB } = require('./review.responsitory');

async function createReview(userId, productId, rating, comment) {
    if (!userId || !productId || !rating || !comment) {
        throw { status: 400, message: 'All fields are required' };
    }
    if (rating < 1 || rating > 5) {
        throw { status: 400, message: 'Rating must be between 1 and 5' };
    }
    return await createReviewInDB({ userId, productId, rating, comment });
}

async function getAllReviews() {
    return await getAllReviewsFromDB();
}

async function getReviewById(id) {
    const review = await getReviewByIdFromDB(id);
    if (!review) {
        throw { status: 404, message: 'Review not found' };
    }
    return review;
}

async function updateReview(id, data) {
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
        throw { status: 400, message: 'Rating must be between 1 and 5' };
    }
    return await updateReviewInDB(id, data);
}

async function deleteReview(id) {
    return await deleteReviewFromDB(id);
}

module.exports = { createReview, getAllReviews, getReviewById, updateReview, deleteReview };
