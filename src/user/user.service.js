const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser, updateUser } = require('./user.reponsitory');
const JWT_SECRET = 'adwda233wqfqaf';
const prisma = require('../db');
const  nodemailer = require('nodemailer');

// Fungsi untuk mendapatkan semua user
const getAllUsers = async () => {
  return await prisma.user.findMany();
};

// Fungsi untuk registrasi user
const registerUser = async ({ name, email, password, role }) => {
  const userEmail = await findUserByEmail(email);

  if (userEmail) {
    return { status: 400, data: { message: 'Email sudah digunakan!' } };
  }

  const passwordHash = await bcrypt.hash(password, 5);
  const user = await createUser({
    name,
    email,
    password: passwordHash,
    role,
  });

  return {
    status: 201,
    data: {
      message: 'Registrasi berhasil!',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  };
};

// Fungsi untuk login user
const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) return { status: 404, data: { message: 'User dengan email ini tidak ditemukan!' } };
  
  // Verifikasi password
  const passwordVerif = await bcrypt.compare(password, user.password);
  if (!passwordVerif) return { status: user401, data: { message: 'Password anda salah!' } };
  

  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    status: 200,
    data: { message: 'Login berhasil!', token, role: user.role },
  };
};

async function sendOtpEmail(toEmail, otpCode) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // pastikan variabel lingkungan diatur
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
     from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Kode OTP untuk Reset Kata Sandi Anda',
      text: `
      Halo,
    
      Kami telah menerima permintaan untuk mereset kata sandi akun Anda di Eskyvie, toko online terpercaya untuk alat medis dan produk perawatan kulit berkualitas.
    
      Kode OTP untuk mereset kata sandi Anda adalah: *${otpCode}*. Kode ini hanya berlaku selama 5 menit untuk menjaga keamanan akun Anda.
    
      Jika Anda tidak melakukan permintaan ini, Anda dapat mengabaikan pesan ini. Jika Anda memerlukan bantuan lebih lanjut, jangan ragu untuk menghubungi kami.
    
      Terima kasih telah berbelanja di Eskyvie, tempat Anda dapat menemukan produk kesehatan dan kecantikan terbaik.
    
      Hormat kami,
      Tim Eskyvie
      `,
  };

  await transporter.sendMail(message);
}

function generateOtp() {
  return parseInt(Math.floor(100000 + Math.random() * 900000), 10); // Pastikan OTP adalah integer
}

async function handleForgetPassword(email) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('User dengan email ini tidak ditemukan!');
  }

  const otpCode = generateOtp();  // Pastikan ini menghasilkan integer
  console.log('Generated OTP:', otpCode);  // Debugging untuk memeriksa apakah OTP yang dihasilkan integer

  const otpExpired = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

  // Pastikan Anda menunggu hasil update
  await updateUser(email, { otpCode, otpExpired });

  await sendOtpEmail(email, otpCode);

  return otpCode;  // Kembalikan hanya OTP code
}


async function verifyOtp(email, otpCode, newPassword) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('Pengguna tidak ditemukan!');
  }

  if (user.otpCode !== otpCode) {
    throw new Error('Kode OTP tidak valid!');
  }

  if (user.otpExpired < new Date()) {
    throw new Error('Kode OTP telah kedaluwarsa!');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const updatedUser = await updateUser(email, {
    password: passwordHash,
    otpCode: null,
    otpExpired: null,
  });

  return { message: 'Password berhasil diperbarui!', user: updatedUser };
}

module.exports = { getAllUsers, registerUser, loginUser, sendOtpEmail, handleForgetPassword, verifyOtp };
