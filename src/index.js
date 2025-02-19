const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require('path');
const cors = require('cors');
const { verifyToken, verifyRole } = require('./middelware/authMiddelware');
const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: true
}));
const looger = require('morgan');

// Import dan gunakan controller
const userController = require('./user/user.controller');
const productController = require('./product/product.controller');
const categoryController = require('./category/category.controller');
const orderController = require('./order/order.controller');
const reviewController = require('./review/review.controller');
const paymentController = require('./payment/payment.controller');
const blogController = require('./blog/blog.controller');
const imageController = require('./image_product/image.controller');

// app.use('/products',verifyToken, productController);
app.use('/users', userController);
app.use('/products', productController);
app.use('/categorys', categoryController);
app.use('/orders', orderController);
app.use('/reviews', reviewController);
app.use('/payments', paymentController);
app.use('/blogs', blogController)
app.use('/images', imageController);
app.use(looger('dev'));

// route test image
app.use('/images', express.static(path.join(__dirname,'public/images')));
app.use('/blogs/images', express.static(path.join(__dirname, 'public/images')));


// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
