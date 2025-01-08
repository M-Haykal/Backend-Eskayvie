const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUserInDb, getAllUsersFromDb, findUserByEmail } = require('./user.reponsitory');
const JWT_SECRET = 'adwda233wqfqaf';

// Fungsi untuk mendapatkan semua user
const getAllUsers = async () => {
  return await getAllUsersFromDb();
};

// Fungsi untuk registrasi user
const registerUser = async ({ name, email, password, role, emailPassword }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return { status: 400, data: { message: 'Email sudah digunakan!' } };
  }

  // Hash password dan emailPassword
  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedEmailPassword = await bcrypt.hash(emailPassword, 10);

  const newUser = await createUserInDb({
    name,
    email,
    password: hashedPassword,
    role,
    emailPassword: hashedEmailPassword, // Simpan hash
  });

  return {
    status: 201,
    data: {
      message: 'Registrasi berhasil!',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    },
  };
};

// Fungsi untuk login user
const loginUser = async ({ email, password, emailPassword }) => {
  const user = await findUserByEmail(email);
  if (!user) return { status: 404, data: { message: 'User tidak ditemukan!' } };

  // Verifikasi password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return { status: 401, data: { message: 'Password salah!' } };

  // Verifikasi emailPassword
  const isEmailPasswordValid = await bcrypt.compare(emailPassword, user.emailPassword);
  if (!isEmailPasswordValid) {
    return { status: 400, data: { message: 'App Password Gmail salah!' } };
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, emailPassword: user.emailPassword }, // Tambahkan emailPassword
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    status: 200,
    data: { message: 'Login berhasil!', token, role: user.role },
  };
};


module.exports = { getAllUsers, registerUser, loginUser };
