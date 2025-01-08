const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createReviewInDB(data) {
    return await prisma.review.create({ data });
}

async function getAllReviewsFromDB() {
    return await prisma.review.findMany();
}

async function getReviewByIdFromDB(id) {
    return await prisma.review.findUnique({ where: { id } });
}

async function updateReviewInDB(id, data) {
    try {
        return await prisma.review.update({
            where: { id },
            data,
        });
    } catch (error) {
        if (error.code === 'P2025') {
            throw { status: 404, message: 'Review not found' };
        }
        throw error;
    }
}

async function deleteReviewFromDB(id) {
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

module.exports = { createReviewInDB, getAllReviewsFromDB, getReviewByIdFromDB, updateReviewInDB, deleteReviewFromDB };
