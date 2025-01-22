const express = require("express");
const {
  createReview,
  getAllReviewsProduct,
  getReviewProductById,
  deleteReviewProduct,
} = require("./review.service");
const { verifyToken, verifyRole } = require("../middelware/authMiddelware");
const router = express.Router();
const upload = require("../middelware/images");
const prisma = require("../db");
const fs = require("fs");
const path = require("path");

router.post("/", upload.array("images", 5), async (req, res) => {
  let uploadedFiles = [];
  try {
    const data = req.body;
    const userId = parseInt(data.userId, 10);
    const productId = parseInt(data.productId, 10);
    const rating = parseInt(data.rating, 10);

    if (isNaN(userId) || isNaN(productId)) {
      throw new Error("userId dan productId harus berupa angka.");
    }

    if (!userId || !productId || !rating || !data.comment) {
      throw new Error("Semua field harus diisi.");
    }

    if (rating < 1 || rating > 5) {
      throw new Error("Rating harus antara 1 sampai 5.");
    }

    // Simpan path file untuk penghapusan jika terjadi error
    if (req.files && req.files.length > 0) {
      uploadedFiles = req.files.map((file) => path.join(__dirname, "../public/images", file.filename));
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new Error(`User dengan ID ${userId} tidak ditemukan.`);
    }

    const productExists = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!productExists) {
      throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,
        productId: productId,
      },
    });

    if (existingReview) {
      throw new Error(`user dengan ID ${userId} sudah memiliki review untuk produk dengan ID ${productId}.`);
    }

    const review = await createReview(data, req.files);

    res.status(201).json({
      status: 201,
      message: "Review berhasil ditambahkan",
      data: review,
    });

  } catch (error) {
    // Hapus file yang telah diunggah jika terjadi kesalahan
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((filePath) => {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Gagal menghapus file: ${filePath} - ${err.message}`);
          } else {
            console.log(`File dihapus: ${filePath}`);
          }
        });
      });
    }

    res.status(500).json({ error: error.message });
  }
});



router.get("/", async (req, res) => {
  try {
    const reviews = await getAllReviewsProduct();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching reviews" });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const review = await getReviewProductById(parseInt(id));
    res.status(200).json(review);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedReview = await deleteReviewProduct(parseInt(id));
    res
      .status(200)
      .json({ message: "Review deleted successfully", review: deletedReview });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

module.exports = router;
