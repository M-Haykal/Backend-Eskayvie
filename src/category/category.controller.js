const prisma = require("../db");
const express = require('express');
const { createCategory, getDataCategoryById, getAllCategories, updateCategory, deleteCategory } = require("./category.service");
const router = express.Router();
const { verifyToken, verifyRole } = require('../middelware/authMiddelware');


const app = express();
app.use(express.json());

class CustomError extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  }
  
  app.use((err, req, res) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
  });

router.post("/", async (req, res, next) => {
    try {
        const categoryData = req.body
        const category = await createCategory(categoryData)
    if(!categoryData) throw new CustomError('Category name is required', 400)
        res.status(201).json(category)  
    } catch (error) {
        if (error.categoryData === 'SequelizeUniqueConstraintError') {
            return next(new CustomError('Category name must be unique', 400));
          }
          next(error);
    }
})

router.get("/", async (req, res) => {
        const categorys = await getAllCategories()
        res.send({
            status: 200,
            message: "Get all categories",
            data: categorys
        })
})

router.get("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const category = await getDataCategoryById(id);
  
      res.status(200).send({
        status: 200,
        message: "Get category by ID",
        data_category: category,
      });
    } catch (error) {
      if (error.status === 404) {
        return res.status(404).send({
          status: 404,
          message: error.message,
        });
      }
      next(error);
    }
  });

  router.patch("/:id", async (req, res, next) => {
    try {
        const categoryId = parseInt(req.params.id);
        const categoryData = req.body;
        const category = await updateCategory(parseInt(categoryId), categoryData)

        return res.send({
            status : 200,
            message : "update category",
            data_category : category
        })
      } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
          return next(new CustomError('Category name must be unique', 400));
        }
        next(err);
      }
  })

  router.delete("/:id", async (req, res) => {
    const categoryId = parseInt(req.params.id);
    const category = await deleteCategory(categoryId);
    res.send({
      data: category,
      status: 200,
      message: "delete category",
    });
  });






module.exports = router
