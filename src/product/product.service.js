const { json } = require("body-parser");
const prisma = require("../db");
const { findProductById, editProduct, deleteProductById, createProductData } = require("./product.reponsitory");




const getAllProducts = async () => {
  const products = await prisma.product.findMany();
  return products;
};

const searchProduct = async () => {
  const { page = 1, limit = 10, search = "", categoryId } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  try {
    const where = {
      AND: [
        { name: { contains: search, mode: "insensitive" } },
        categoryId ? { categoryId: parseInt(categoryId) } : {},
      ],
    };

    const products = await prismaClient.product.findMany({
      where,
      skip,
      take,
      include: { category: true, reviews: true },
    });

    const total = await prismaClient.product.count({ where });

    res.status(200).json({
      data: products,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products." });
  }
};

const getProductById = async (id) => {
  try {
    const product = await findProductById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    console.error(error);
    throw error; // Pastikan error dilempar agar bisa ditangani di route handler
  }
};


const createProduct = async (productData) => {
  if (!productData.categoryId) {
    throw new Error({ message: "Category ID is required" });
  }

  // Membuat produk dengan relasi ke kategori
  const product = createProductData(productData);
  return json(product);
};

const updateProduct = async (id, productData) => {
  try {
    await getProductById(id);

    const product = await editProduct(id, productData);
  
    return product;
  } catch (error) {
    throw error;
  }
};

const deleteProduct = async (id) => {
  try {
  await deleteProductById(id);
  } catch (error) {
    throw error
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  searchProduct,
  getProductById,
  updateProduct,
  deleteProduct
};
