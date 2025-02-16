const express = require("express");
const prisma = require("../db");
const {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("./product.service");
const { verifyToken, verifyRole } = require("../middelware/authMiddelware");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await createProduct(productData);

    res.status(200).json({
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(400).json({ error: error.message });
  }
});



// Endpoint untuk mendapatkan semua produk
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        reviews: true,
        images: true,
      },
    });
    res.send({
      status: 200,
      message: "Get all products",
      data: products,
    });
  } catch (error) {
    res.status(500).send({
      error: error.message,
      status: 500,
    });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        category: true,
        reviews: true,
        images: true,
      },
    });

    if (!product) {
      return res.status(404).send({
        status: 404,
        message: "Product not found",
      });
    }

    res.send({
      status: 200,
      message: "Get product details",
      data: product,
    });
  } catch (error) {
    res.status(500).send({
      error: error.message,
      status: 500,
    });
  }
});



router.patch("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = req.body;
    const product = await updateProduct(parseInt(productId), productData);

    return res.send({
      status: 200,
      message: "update product",
      data: product,
    });
  } catch (error) {
    throw error;
  }
});

router.delete("/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  const product = await deleteProduct(productId);
  res.send({
    data: product,
    status: 200,
    message: "delete product",
  });
});

module.exports = router;
