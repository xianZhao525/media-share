// backend/middleware/auth.js
import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供访问令牌',
      data: null
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this', (err, user) => {
    if (err) {
      return res.status(403).json({
        code: 403,
        message: '无效的访问令牌',
        data: null
      });
    }
    req.user = user;
    next();
  });
};

export default authenticateToken;