const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT;
const revokedTokens = [];
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Token tidak ditemukan!" });
  }

  const token = authHeader.split(" ")[1];

  // Cek apakah token dicabut
  if (revokedTokens.includes(token)) {
    return res.status(401).json({ message: "Token sudah dicabut!" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.email) {
      return res
        .status(401)
        .json({ message: "Token tidak valid! Informasi email hilang." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token sudah kedaluwarsa!" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token tidak valid!" });
    }
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan pada autentikasi." });
  }
};

const logout = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Token tidak ditemukan!" });
  }

  const token = authHeader.split(" ")[1];
  revokedTokens.push(token);

  return res.status(200).json({ message: "Logout berhasil!" });
};

const verifyRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res
        .status(403)
        .json({ message: "Akses ditolak! Anda tidak memiliki izin." });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  verifyRole,
  logout
};
