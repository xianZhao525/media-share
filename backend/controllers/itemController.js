// backend/controllers/itemController.js
const ItemRepository = require('../repositories/ItemRepository');

class ItemController {
  // 创建内容
  async createItem(req, res) {
    try {
      const itemData = req.body;
      
      // 这里应该从认证中间件获取用户ID
      // 为了演示，我们使用一个默认值
      if (!itemData.userId) {
        itemData.userId = '507f1f77bcf86cd799439011'; // 示例用户ID
      }

      const result = await ItemRepository.createItem(itemData);
      
      if (result.success) {
        return res.status(201).json({
          code: 201,
          data: result.data,
          message: '内容创建成功'
        });
      } else {
        return res.status(400).json({
          code: 400,
          data: null,
          message: result.error || '创建失败'
        });
      }
    } catch (error) {
      console.error('Create item controller error:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
      });
    }
  }

  // 获取内容列表
  async getItems(req, res) {
    try {
      const filters = {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc',
        type: req.query.type || '',
        tag: req.query.tag || '',
        userId: req.query.userId || '',
        search: req.query.search || '',
        minRating: parseFloat(req.query.minRating) || 0
      };

      const result = await ItemRepository.getItems(filters);
      
      if (result.success) {
        return res.status(200).json({
          code: 200,
          data: result.data,
          message: '获取内容列表成功'
        });
      } else {
        return res.status(400).json({
          code: 400,
          data: null,
          message: result.error || '获取失败'
        });
      }
    } catch (error) {
      console.error('Get items controller error:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
      });
    }
  }

  // 获取内容详情
  async getItemById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await ItemRepository.getItemById(id);
      
      if (result.success) {
        return res.status(200).json({
          code: 200,
          data: result.data,
          message: '获取内容详情成功'
        });
      } else {
        return res.status(404).json({
          code: 404,
          data: null,
          message: result.error || '内容不存在'
        });
      }
    } catch (error) {
      console.error('Get item by id controller error:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
      });
    }
  }

  // 获取热门内容
  async getHotItems(req, res) {
    try {
      const { type, limit } = req.query;
      
      const result = await ItemRepository.getHotItems(limit || 10, type || '');
      
      if (result.success) {
        return res.status(200).json({
          code: 200,
          data: result.data,
          message: '获取热门内容成功'
        });
      } else {
        return res.status(400).json({
          code: 400,
          data: null,
          message: result.error || '获取失败'
        });
      }
    } catch (error) {
      console.error('Get hot items controller error:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
      });
    }
  }

  // 获取最新内容
  async getLatestItems(req, res) {
    try {
      const { type, limit } = req.query;
      
      const result = await ItemRepository.getLatestItems(limit || 10, type || '');
      
      if (result.success) {
        return res.status(200).json({
          code: 200,
          data: result.data,
          message: '获取最新内容成功'
        });
      } else {
        return res.status(400).json({
          code: 400,
          data: null,
          message: result.error || '获取失败'
        });
      }
    } catch (error) {
      console.error('Get latest items controller error:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
      });
    }
  }

  // 搜索内容
  async searchItems(req, res) {
    try {
      const { q, type, page, limit, minRating } = req.query;
      
      if (!q || q.trim() === '') {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '搜索关键词不能为空'
        });
      }

      const options = {
        page: page || 1,
        limit: limit || 20,
        type: type || '',
        minRating: parseFloat(minRating) || 0
      };

      const result = await ItemRepository.searchItems(q, options);
      
      if (result.success) {
        return res.status(200).json({
          code: 200,
          data: result.data,
          message: '搜索成功'
        });
      } else {
        return res.status(400).json({
          code: 400,
          data: null,
          message: result.error || '搜索失败'
        });
      }
    } catch (error) {
      console.error('Search items controller error:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
      });
    }
  }

  // 更新内容
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // 这里应该从认证中间件获取用户ID
      const userId = '507f1f77bcf86cd799439011'; // 示例用户ID

      const result = await ItemRepository.updateItem(id, updateData, userId);
      
      if (result.success) {
        return res.status(200).json({
          code: 200,
          data: result.data,
          message: '内容更新成功'
        });
      } else {
        const statusCode = result.error.includes('权限') ? 403 : 
                          result.error.includes('不存在') ? 404 : 400;
        return res.status(statusCode).json({
          code: statusCode,
          data: null,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Update item controller error:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
      });
    }
  }

  // 删除内容
  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      
      // 这里应该从认证中间件获取用户ID
      const userId = '507f1f77bcf86cd799439011'; // 示例用户ID

      const result = await ItemRepository.deleteItem(id, userId);
      
      if (result.success) {
        return res.status(200).json({
          code: 200,
          data: null,
          message: result.message || '内容删除成功'
        });
      } else {
        const statusCode = result.error.includes('权限') ? 403 : 
                          result.error.includes('不存在') ? 404 : 400;
        return res.status(statusCode).json({
          code: statusCode,
          data: null,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Delete item controller error:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
      });
    }
  }

  // 获取用户的内容
  async getUserItems(req, res) {
    try {
      const { userId } = req.params;
      const { page, limit, type } = req.query;
      
      const options = {
        page: page || 1,
        limit: limit || 20,
        type: type || ''
      };

      const result = await ItemRepository.getUserItems(userId, options);
      
      if (result.success) {
        return res.status(200).json({
          code: 200,
          data: result.data,
          message: '获取用户内容成功'
        });
      } else {
        return res.status(400).json({
          code: 400,
          data: null,
          message: result.error || '获取失败'
        });
      }
    } catch (error) {
      console.error('Get user items controller error:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
      });
    }
  }

  // 获取相关内容
  async getRelatedItems(req, res) {
    try {
      const { id } = req.params;
      const { limit } = req.query;
      
      const result = await ItemRepository.getRelatedItems(id, limit || 6);
      
      if (result.success) {
        return res.status(200).json({
          code: 200,
          data: result.data,
          message: '获取相关内容成功'
        });
      } else {
        return res.status(400).json({
          code: 400,
          data: null,
          message: result.error || '获取失败'
        });
      }
    } catch (error) {
      console.error('Get related items controller error:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
      });
    }
  }

  // 获取统计数据
  async getStats(req, res) {
    try {
      const result = await ItemRepository.getStats();
      
      if (result.success) {
        return res.status(200).json({
          code: 200,
          data: result.data,
          message: '获取统计数据成功'
        });
      } else {
        return res.status(400).json({
          code: 400,
          data: null,
          message: result.error || '获取失败'
        });
      }
    } catch (error) {
      console.error('Get stats controller error:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
      });
    }
  }

  // 插入示例数据（仅用于开发和测试）
  async seedData(req, res) {
    try {
      // 这里应该添加管理员权限检查
      const result = await ItemRepository.seedSampleData();
      
      if (result.success) {
        return res.status(200).json({
          code: 200,
          data: result.data,
          message: '示例数据插入成功'
        });
      } else {
        return res.status(400).json({
          code: 400,
          data: null,
          message: result.error || '插入失败'
        });
      }
    } catch (error) {
      console.error('Seed data controller error:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = new ItemController();