const { getAllReviews, getReviewById, deleteReview } = require('./review.responsitory');
const { updateRatingProduct } = require('../product/product.service');
const prisma = require('../db');
const createReview = async (data, files) => {
  try {
   
    const userId = parseInt(data.userId, 10);
    const productId = parseInt(data.productId, 10);
    const rating = parseInt(data.rating, 5);

    let mediaUrls = [];
    if (files && files.length > 0) {
      mediaUrls = files.map(file => `/images/${file.filename}`);
    }

    const newReview = await prisma.review.create({
      data: {
        rating,       
        userId,       
        productId,    
        comment: data.comment, 
        mediaUrls,     
      },
    });

    const updateProduct = await updateRatingProduct(productId);
    if (!updateProduct.success) {
      throw new Error(updateProduct.message);
    }

    return {
      success: 2001,
      message: "Review berhasil dibuat.",
      review: newReview,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Terjadi kesalahan saat membuat review.",
    };
  }
};



  

async function getAllReviewsProduct() {
    return await getAllReviews();
}

async function getReviewProductById(id) {
    const review = await getReviewById(id);
    if (!review) {
        throw { status: 404, message: 'Review not found' };
    }
    return review;
}


async function deleteReviewProduct(id) {
    return await deleteReview(id);
}

module.exports = { createReview, getAllReviewsProduct, getReviewProductById, deleteReviewProduct };
