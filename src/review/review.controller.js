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


router.post("/", verifyToken, (req, res, next) => {
  upload.single("image")(req, res, function (err) {
    if (err) {
      // Tangani error dari multer
      return res.status(400).json({ error: err.message });
    }
    // Lanjutkan ke handler berikutnya
    next();
  });
}, async (req, res) => {
  console.log("File uploaded:", req.file); // Periksa apakah file terdeteksi
  console.log("Request headers:", req.headers); // Debugging headers

  let uploadedFile = null;
  try {
    const data = req.body;
    const rating = parseInt(data.rating, 10);

    if (!req.user || !req.user.id) {
      throw new Error("User tidak terautentikasi.");
    }
    const userId = req.user.id;
    const productId = parseInt(data.productId, 10);

    if (isNaN(productId) || isNaN(rating)) {
      throw new Error("ProductId dan rating harus berupa angka.");
    }

    if (!productId || !rating || !data.comment) {
      throw new Error("Semua field harus diisi.");
    }

    if (rating < 1 || rating > 5) {
      throw new Error("Rating harus antara 1 sampai 5.");
    }

    if (req.file) {
      uploadedFile = path.join(__dirname, "../public/images", req.file.filename);
    }

    const productExists = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!productExists) {
      throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
    }


    const review = await createReview({ ...data, userId }, req.file);

    res.status(201).json({
      status: 201,
      message: "Review berhasil ditambahkan",
      data: review,
    });

  } catch (error) {
    if (uploadedFile) {
      fs.unlink(uploadedFile, (err) => {
        if (err) {
          console.error(`Gagal menghapus file: ${uploadedFile} - ${err.message}`);
        } else {
          console.log(`File dihapus: ${uploadedFile}`);
        }
      });
    }

    res.status(500).json({ error: error.message });
  }
});


  // const existingReview = await prisma.review.findFirst({
    //   where: {
    //     userId: userId,
    //     productId: productId,
    //   },
    // });

    // if (existingReview) {
    //   throw new Error(`User dengan ID ${userId} sudah memiliki review untuk produk dengan ID ${productId}.`);
    // }


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
