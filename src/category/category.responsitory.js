const prisma = require("../db")
const express = require('express');
const { param } = require("./category.controller");
const app = express();
app.use(express.json());

class CustomError extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  }
  
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
  });


  const createCategoryData = async (categoryData) => {
    const category = await prisma.category.create({
      data: {
        name: categoryData.name
      }
    })
    return category
  }

  const getAllDataCategories = async () => {
    const categorys = await prisma.category.findMany()

    return categorys
  }


  const getCategoryById = async (id) => {
    try {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(id) },
        include: {
          products: true,
        },
      });
  
      if (!category) {
        throw new CustomError('Category ID not found', 404); // Throw error jika kategori tidak ditemukan
      }
  
      return category;
    } catch (err) {
      throw err; // Lempar error ke fungsi pemanggil
    }
  };

  const editCategory = async (id, categoryData) => {
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name: categoryData.name
      }
    })
    if (!category) {
      throw new CustomError('Category ID not found', 404); // Throw error jika kategori tidak ditemukan
    }

    if (!categoryData.name) {
      throw new CustomError('Category name is required', 400); // Throw error jika kategori tidak ditemukan
    }

    return category
  } 

  const deleteCategoryById = async (id) => {
    const category = await prisma.category.delete({
      where: { id: parseInt(id) },
    });
    return category
  }
  
  module.exports = {
    createCategoryData,
    getAllDataCategories,
    getCategoryById,
    editCategory,
    deleteCategoryById
  }