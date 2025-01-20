const prisma = require('../db');
async function getAllReviews() {
    return await prisma.review.findMany();
}

async function getReviewById(id) {
    return await prisma.review.findUnique({ where: { id } });
}
async function deleteReview(id) {
    try {
        return await prisma.review.delete({
            where: { id },
        });
    } catch (error) {
        if (error.code === 'P2025') {
            throw { status: 404, message: 'Review not found' };
        }
        throw error;
    }
}

module.exports = { getAllReviews, getReviewById,  deleteReview };
