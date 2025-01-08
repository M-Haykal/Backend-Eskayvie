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

// Endpoint untuk membuat produk
router.post("/", async (req, res) => {
  const productData = req.body;

  try {
    await createProduct(productData);
    res.send({
      status: 200,
      message: "Create product successfully",
      data: productData,
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while creating the product." });
  }
});




// Endpoint untuk mendapatkan semua produk
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        reviews: true,
        images: true
      },
    });
   res.send({
    status: 200,
    message: "Get all products",
    data: products
   })
  } catch (error) {
    res.status(500).send({
      error: error.message,
      status: 500,
    });
  }
});

// router.get('/',verifyToken, verifyRole("customer"), async (req, res) =>{
//   router.get('/', async (req, res) =>{
// const products = await prisma.product.findMany({
//   include: { category: true, reviews: true },
// });
// res.json(products)
// })

// router.get('/:id',verifyToken, verifyRole("customer"), async (req, res) => {
router.get("/:id", async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    const product = await getProductById(productId);
    res.status(200).send({
      data_product: product,
      status: 200,
      message: "Get product by ID",
    });
  } catch (error) {
    res.status(404).send({
      error: error.message,
      status: 404,
    });
  }
});

// router.post("/", verifyToken, verifyRole("admin"), async (req, res) => {
//   router.post("/", async (req, res) => {
//   try {
//     const productData = req.body;
//     if (!productData) {
//       return res.status(400).send({
//         error: "No product data provided",
//         status: 400,
//       });
//     }
//     const product = await createProduct(productData);
//     res.send({
//       data_product: productData,
//       status: 201,
//       message: "create product",
//     });
//   } catch (error) {
//     res.status(500).send({
//       error: error.message,
//       status: 500,
//     });
//   }
// });

// router.patch("/:id", verifyToken, verifyRole("admin"), async (req, res) => {
router.patch("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = req.body;
    const product = await updateProduct(parseInt(productId), productData);

    return res.send({
      data_product: product,
      status: 200,
      message: "update product",
    });
  } catch (error) {
    throw error;
  }
});

// router.delete("/:id", verifyToken, verifyRole("admin"), async (req, res) => {
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
