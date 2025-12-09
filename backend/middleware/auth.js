// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * JWT认证中间件
 * 验证请求头中的Authorization token
 */
const authenticateToken = (req, res, next) => {
  // 从请求头获取token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      code: 401,
      data: null,
      message: '访问令牌缺失，请先登录'
    });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 将用户信息添加到请求对象
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username
    };

    next();
  } catch (error) {
    console.error('Token验证失败:', error.message);
    
    let message = '令牌无效或已过期';
    if (error.name === 'TokenExpiredError') {
      message = '令牌已过期，请重新登录';
    } else if (error.name === 'JsonWebTokenError') {
      message = '令牌格式无效';
    }

    return res.status(403).json({
      code: 403,
      data: null,
      message
    });
  }
};

module.exports = authenticateToken;