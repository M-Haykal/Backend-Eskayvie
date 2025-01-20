const prisma = require('../db');

// Fungsi untuk mencari user berdasarkan email
const findUserById = async (id) => {
  return await prisma.user.findUnique({ where: { id } });
};

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

// Fungsi untuk membuat user baru di database
const createUser = async ({ name, email, password, role }) => {
  return await prisma.user.create({
    data: {
      name,
      email,
      password,
      role,
    }
  });
};

async function updateUser(email, data) {
  return prisma.user.update({ where: { email }, data });
}

module.exports = { findUserById, createUser, findUserByEmail, updateUser };
