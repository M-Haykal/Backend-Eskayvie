const express = require("express");
const { registerUser, loginUser, getAllUsers } = require("./user.service");
const { verifyToken, verifyRole } = require('../middelware/authMiddelware');
const prisma = require("../db");
const nodemailer = require('nodemailer');

const router = express.Router();

// Route untuk mendapatkan semua users
router.get("/",  async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
});

// Route untuk registrasi
router.post('/register', async (req, res) => {
  const { name, email, password, role, emailPassword } = req.body;
  
  if (!name || !email || !password || !role || !emailPassword) {
    return res.status(400).json({ message: 'Semua field harus diisi!' });
  }

  try {
    const response = await registerUser({ name, email, password, role, emailPassword });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, emailPassword} = req.body;

  if (!email || !password || !emailPassword) {
    return res.status(400).json({ message: 'Email dan password harus diisi!' });
  }emailPassword

  try {
    const response = await loginUser({ email, password, emailPassword });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
});
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000); // 6 digit angka acak
};

// Route untuk login

router.post('/forget_password',verifyToken, async (req, res) => {
const {email} = req.body;

try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan!' });
  }
  
  
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: req.user.email,
      pass: req.user.emailPassword,
    },
  })
  
  console.log('User email:', req.user.email); // Pastikan nilainya tersedia
  console.log('User password:', req.user.emailPassword); // Pastikan nilainya tersedia
  

  const otpCode = generateOtp();
  const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

  await prisma.user.update({
    where:{email},
    data :{
      otpCode,
      otpExpiration,
    }
  })

  const mailOptions = {
    from: req.user.email,
    to: email,
    subject: 'Your OTP for Reset Password',
    text: `Kode OTP Anda adalah: ${otpCode}. Code ini berlaku selama 5 menit`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({ message: 'Email OTP berhasil dikirim!' });
  
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Terjadi kesalahan saat mengirim OTP.', error: error.message });
}})

module.exports = router;
