// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        data: null,
        message: '请先登录'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error('认证失败:', error);
    res.status(401).json({
      code: 401,
      data: null,
      message: '认证失败，请重新登录'
    });
  }
};

module.exports = auth;