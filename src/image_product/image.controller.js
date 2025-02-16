const express = require('express');
const router = express.Router();
const upload = require('../middelware/images')
const path = require('path');
const fs = require('fs');
const prisma = require('../db'); // Sesuaikan path file

// Create Image (Upload file dan simpan ke database)
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { productId } = req.body;
    const files = req.files;
    
    // Validasi input
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'At least one image file is required' });
    }
    
    if (!productId || isNaN(parseInt(productId))) {
      files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Failed to delete file:', err.message);
        });
      });
      return res.status(400).json({ error: 'Invalid or missing productId' });
    }
    
    // Periksa apakah productId valid
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Simpan data gambar ke database
    const newImages = await Promise.all(files.map(async (file) => {
      return await prisma.image.create({
        data: {
          productId: parseInt(productId),
          url: `/images/${file.filename}`,
        },
      });
    }));
    
    res.status(201).json({ message: 'Images uploaded successfully', newImages });
  } catch (error) {
    console.error('Error creating images:', error);
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Failed to delete file:', err.message);
        });
      });
    }
    res.status(500).json({ error: 'Failed to upload images', detail: error.message });
  }
});


// Delete Image
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Hapus data gambar di database
    await prisma.image.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
