const multer = require('multer');
const path = require('path');

// Menentukan tempat penyimpanan gambar dan penamaan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/public/images'); // Tentukan folder penyimpanan
  },
  filename: (req, file, cb) => {
    // Menambahkan timestamp untuk menghindari duplikasi nama file
    const ext = path.extname(file.originalname); 
    cb(null, Date.now() + ext);
  }
});

// Filter hanya menerima file gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Inisialisasi multer dengan konfigurasi
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Batasi ukuran file (misal 5MB)
});

module.exports = upload;
