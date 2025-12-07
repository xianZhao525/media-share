// backend/routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// 公开路由
router.get('/', itemController.getItems);
router.get('/hot', itemController.getHotItems);
router.get('/latest', itemController.getLatestItems);
router.get('/search', itemController.searchItems);
router.get('/stats', itemController.getStats);
router.get('/:id', itemController.getItemById);
router.get('/:id/related', itemController.getRelatedItems);
router.get('/user/:userId', itemController.getUserItems);

// 需要认证的路由（简化版）
router.post('/', itemController.createItem);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

// 开发工具路由（仅用于测试）
router.post('/dev/seed', itemController.seedData);

module.exports = router;