const { json } = require("body-parser");
const prisma = require("../db")



const createProductData = async (productData) => {
    // Buat produk jika semua validasi terpenuhi
    if (
      !productData.name ||
      !productData.description ||
      !productData.price ||
      !productData.stock ||
      !productData.categoryId
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Periksa apakah categoryId valid
    const category = await prisma.category.findUnique({
      where: { id: productData.categoryId },
    });

    if (!category) {
      return res.status(400).json({ error: "Category ID not found." });
    }

    // Buat produk jika semua validasi terpenuhi
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        categoryId: productData.categoryId,
      },
    });

    // Ambil gambar-gambar yang terkait dengan produk baru
    const images = await prisma.image.findMany({
      where: { productId: product.id },
    });

    // Gabungkan produk dengan gambar yang terkait
    product.images = images;

    return product
  };
  

const findProductById = async (id) => {
    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: { category: true, reviews: true },
    });
    return product
}   

const deleteProductById = async (id) => {
    const product = await prisma.product.delete({
        where: { id: parseInt(id) },
    });
    return product
}



const editProduct = async (id, productData) => {
    const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock: productData.stock,
            imageUrl: productData.imageUrl,
            categoryId: productData.categoryId
        }
    });

  if (
    !(
      productData.name &&
      productData.description &&
      productData.price &&
      productData.stock&&
      productData.imageUrl&&
      productData.categoryId
    )
  ) {
    return res.status(400).send("Some fields are missing");
  }
    return product
}

module.exports = {
    findProductById,
    editProduct,
    deleteProductById,
    createProductData
}