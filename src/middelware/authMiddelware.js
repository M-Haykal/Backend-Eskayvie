    const jwt = require('jsonwebtoken');

    // Secret key untuk JWT
    const JWT_SECRET = 'adwda233wqfqaf';

    // Middleware untuk verifikasi token dan role
    const verifyToken = (req, res, next) => {
      const authHeader = req.headers.authorization;
    
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak ditemukan!' });
      }
    
      const token = authHeader.split(' ')[1];
    
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
    
        if (!decoded.email || !decoded.emailPassword) {
          return res.status(401).json({ message: 'Token tidak valid! Informasi email atau emailPassword hilang.' });
        }
    
        req.user = decoded; // Masukkan data ke req.user
        next();
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token sudah kedaluwarsa!' });
        }
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Token tidak valid!' });
        }
        return res.status(500).json({ message: 'Terjadi kesalahan pada autentikasi.' });
      }
    };
    
    
    
    const verifyRole = (requiredRole) => {
        return (req, res, next) => {
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ message: 'Akses ditolak! Anda tidak memiliki izin.' });
        }
        next();
        };
    };

    module.exports = {
        verifyToken,
        verifyRole
    };
    
