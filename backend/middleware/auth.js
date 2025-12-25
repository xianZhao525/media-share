/**
 * JWT认证中间件
 */
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

// module.exports = authenticateToken;// backend/middleware/auth.js
// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//   try {
//     // 从请求头获取token
//     const token = req.header('Authorization')?.replace('Bearer ', '');

//     if (!token) {
//       return res.status(401).json({
//         code: 401,
//         data: null,
//         message: '访问令牌不存在'
//       });
//     }

//     // 验证token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

//     // 将用户信息添加到请求对象
//     req.user = decoded;

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       code: 401,
//       data: null,
//       message: '无效的访问令牌'
//     });
//   }
// };

// module.exports = authMiddleware;