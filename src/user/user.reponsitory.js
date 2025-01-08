const prisma = require('../db');

// Fungsi untuk mendapatkan semua user dari database
const getAllUsersFromDb = async () => {
  return await prisma.user.findMany();
};

// Fungsi untuk mencari user berdasarkan email
const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

// Fungsi untuk membuat user baru di database
const createUserInDb = async ({ name, email, password, role, emailPassword }) => {
  return await prisma.user.create({
    data: {
      name,
      email,
      password,
      role,
      emailPassword
    }
  });
};

module.exports = { getAllUsersFromDb, findUserByEmail, createUserInDb };
