// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        data: null,
        message: '访问令牌不存在'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // 将用户信息添加到请求对象
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      data: null,
      message: '无效的访问令牌'
    });
  }
};

module.exports = authMiddleware;