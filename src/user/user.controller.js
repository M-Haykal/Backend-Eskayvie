const express = require("express");
const { registerUser, loginUser, getAllUsers, handleForgetPassword, verifyOtp} = require("./user.service");
const { verifyToken, verifyRole, logout } = require('../middelware/authMiddelware');
const prisma = require("../db");
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Route untuk mendapatkan semua users
router.get("/",  async (req, res) => {
  try {
    const users = await getAllUsers();
   res.send({
    status: 200,
    message: "Get all users successfully",
    data: users
   })
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
});


// Route untuk registrasi
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Semua field harus diisi!' });
  }

  try {
    const register = await registerUser({ name, email, password, role });

    // Menggunakan status dan message yang dikembalikan dari registerUser
    if (register.status === 400) {
      return res.status(400).json({ message: register.data.message });
    }

    res.status(register.status).json({
      status: 201,
      message: register.data.message,
      data: register.data.user
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password harus diisi!' });
  }

  try {
    const login = await loginUser({ email, password });
    res.status(login.status).send({
      status: login.status,
      message: login.data.message,
      data: login.data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
});


router.post('/forget_password', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan!' });
    }
    
    // Gunakan email tetap dari variabel lingkungan
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const otpCode = await handleForgetPassword(email);
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    await prisma.user.update({
      where: { email },
      data: {
        otpCode,
        otpExpired: otpExpiration,
      }
    });

    res.status(200).json({ message: 'Email OTP berhasil dikirim!' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengirim OTP.', error: error.message });
  }
});


router.post('/verify-otp', async (req, res) => {
  const { email, otpCode, newPassword } = req.body;

  try {
    const result = await verifyOtp(email, otpCode, newPassword);
    res.send({
      status: 200,
      message: result.message,
      data: result
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/logout", verifyToken, logout);
module.exports = router;
