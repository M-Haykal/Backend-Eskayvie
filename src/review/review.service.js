const { getAllReviews, getReviewById, deleteReview } = require('./review.responsitory');
const { updateRatingProduct } = require('../product/product.service');
const prisma = require('../db');


const createReview = async (data) => {
    try {
      if (!data.userId || !data.productId || !data.rating || !data.comment) {
        throw new Error("Semua field harus diisi.");
      }
  
      if (data.rating < 1 || data.rating > 5) {
        throw new Error("Rating harus antara 1 sampai 5.");
      }
  
      const userExists = await prisma.user.findUnique({
        where: { id: data.userId },
      });
      if (!userExists) {
        throw new Error(`User dengan ID ${data.userId} tidak ditemukan.`);
      }
  
      const productExists = await prisma.product.findUnique({
        where: { id: data.productId },
      });
      if (!productExists) {
        throw new Error(`Produk dengan ID ${data.productId} tidak ditemukan.`);
      }
  
      const newReview = await prisma.review.create({ data });
  
      const updateProduct = await updateRatingProduct(data.productId);
      if (!updateProduct.success) {
        throw new Error(updateProduct.message);
      }
  
      return {
        success: 2001,
        message: "review created.",
        review: newReview,
      };
    } catch (error) { 
     return {
        success: false,
        message: error.message || "An error occurred while creating the review.",
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

const updateReview = async (id, data) => {
    try {
      // Validasi input
      if (!data.userId || !data.productId || !data.rating || !data.comment) {
        throw new Error("Semua field harus diisi.");
      }
  
      if (data.rating < 1 || data.rating > 5) {
        throw new Error("Rating harus antara 1 sampai 5.");
      }
  
      // Validasi apakah review dengan ID tersebut ada
      const existingReview = await prisma.review.findUnique({
        where: { id: id },
      });
      if (!existingReview) {
        throw new Error(`Review dengan ID ${id} tidak ditemukan.`);
      }
  
      // Validasi apakah user dengan ID tersebut ada
      const userExists = await prisma.user.findUnique({
        where: { id: data.userId },
      });
      if (!userExists) {
        throw new Error(`User dengan ID ${data.userId} tidak ditemukan.`);
      }
  
      // Validasi apakah produk dengan ID tersebut ada
      const productExists = await prisma.product.findUnique({
        where: { id: data.productId },
      });
      if (!productExists) {
        throw new Error(`Produk dengan ID ${data.productId} tidak ditemukan.`);
      }
  
      // Update review
      const updatedReview = await prisma.review.update({
        where: { id: id },
        data,
      });
  
      // Perbarui rata-rata rating produk
      const updateProduct = await updateRatingProduct(data.productId);
      if (!updateProduct.success) {
        throw new Error(updateProduct.message);
      }
  
      return {
        success: true,
        message: "Review updated successfully.",
        review: updatedReview,
        averageRating: updateProduct.data.averageRating,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "An error occurred while updating the review.",
      };
    }
  };
  

async function deleteReviewProduct(id) {
    return await deleteReview(id);
}

module.exports = { createReview, getAllReviewsProduct, getReviewProductById, updateReview, deleteReviewProduct };
