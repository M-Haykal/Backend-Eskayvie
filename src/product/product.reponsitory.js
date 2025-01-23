const prisma = require("../db")

const createProductData = async (productData) => {
  if (
    !productData.name ||
    !productData.description ||
    !productData.price ||
    !productData.stock ||
    !productData.categoryName
  ) {
    throw new Error("All fields are required.");
  }

  // Mencari kategori berdasarkan nama
  const category = await prisma.category.findUnique({
    where: { name: productData.categoryName },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  // Menyimpan produk ke dalam database
  const product = await prisma.product.create({
    data: {
      name: productData.name,
      description: productData.description,
      price: Number(productData.price),  // Pastikan harga dalam tipe angka
      stock: Number(productData.stock),  // Pastikan stok dalam tipe angka
      categoryId: category.id,
    },
  });

  // Mengambil data gambar yang terkait dengan produk yang baru dibuat
  const images = await prisma.image.findMany({
    where: { productId: product.id },
  });

  return { ...product, images };
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

    return product
}

module.exports = {
    findProductById,
    editProduct,
    deleteProductById,
    createProductData
}