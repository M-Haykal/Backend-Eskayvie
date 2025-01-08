const express = require('express');
const prisma = require("../db");
const app = express();
app.use(express.json());
const { createCategoryData, getAllDataCategories, getCategoryById, editCategory, deleteCategoryById} = require("./category.responsitory");

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

  const createCategory = async (categoryData) => {
    try {
      const category = await createCategoryData(categoryData);
      return category;
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return next(new CustomError('Category name must be unique', 400));
          }
    }
  };

  const getAllCategories = async () => {
    try {
        const categorys = await getAllDataCategories()

        return categorys
    } catch (error) {
        if(error.categorys === 'SequelizeUniqueConstraintError') {
            return next(new CustomError('not found category', 404));
    }
  }}

  const getDataCategoryById = async (id) => {
    try {
      const category = await getCategoryById(id);
      return category;
    } catch (error) {
      throw error; // Lempar error ke fungsi pemanggil
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      await getCategoryById(id);

      const category = await editCategory(id, categoryData);
      return category;
    } catch (error) {
      throw error
    }
  }

  const deleteCategory = async (id) => {
    try {
     const category = await deleteCategoryById(id)
    
      return category;
    } catch (error) {
      throw error
    }
  }

    

  module.exports = {
    createCategory,
    getAllCategories,
    getDataCategoryById,
    updateCategory,
    deleteCategory
  }
  