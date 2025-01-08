const prisma = require("../db");
const express = require('express');
const router = express.Router();
const upload = require('../middelware/images')


router.post('/', upload.single('image'), async (req, res) => {
  const imagePath = req.file ? `/blogs/images/${req.file.filename}` : null;
  try {
    const { title, text, author } = req.body;


    // Membuat artikel di database dengan Prisma
    const article = await prisma.article.create({
      data: { title, image: imagePath, text, author },
    });

    res.status(201).json({ success: true, data: article });
  } catch (error) {
    // Jika ada error, hapus gambar yang baru saja diupload
    if (req.file) {
      const targetPath = path.resolve(__dirname, 'images', getHashFileName(req.file.originalname));
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath); // Hapus gambar
      }
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const articles = await prisma.article.findMany(); // Ambil semua artikel
    res.status(200).json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/blogs/images/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'images', req.params.filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Image not found');
  }
});


router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.article.delete({ where: { id: parseInt(id) } });
  
      res.status(200).json({ success: true, message: 'Article deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });


module.exports = router
