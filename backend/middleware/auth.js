// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * JWT认证中间件
 */
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
        message: '无效或过期的令牌',
        data: null 
      });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;