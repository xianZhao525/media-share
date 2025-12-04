import express from 'express';
import { getDB } from '../db/connection.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    全局搜索（文档指定接口）
 * @access  Public
 * @param   {string} q - 搜索关键词
 * @param   {string} type - 内容类型筛选
 * @param   {string} tag - 标签筛选
 * @param   {number} page - 页码
 * @param   {number} limit - 每页数量
 */
router.get('/search', async (req, res) => {
    try {
        const { q, type, tag, page = 1, limit = 20 } = req.query;
        const db = getDB();

        // 构建查询条件
        const filter = {};
        if (q) {
            filter.$text = { $search: q };
        }
        if (type) {
            filter.type = type;
        }
        if (tag) {
            filter.tags = tag;
        }

        // 分页计算
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // 执行查询
        const [items, total] = await Promise.all([
            db.collection('items')
                .find(filter)
                .sort({ score: { $meta: "textScore" } })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray(),
            db.collection('items').countDocuments(filter)
        ]);

        // 获取作者信息
        const itemsWithAuthor = await Promise.all(
            items.map(async (item) => {
                const author = await db.collection('users').findOne(
                    { _id: new ObjectId(item.userId) },
                    { projection: { username: 1, avatar: 1 } }
                );
                return { ...item, author };
            })
        );

        // 按文档约定格式返回
        res.json({
            code: 200,
            data: {
                results: itemsWithAuthor,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            },
            message: '搜索成功'
        });
    } catch (error) {
        console.error('搜索错误:', error);
        res.status(500).json({
            code: 500,
            data: null,
            message: '服务器错误'
        });
    }
});

/**
 * @route   GET /api/tags/popular
 * @desc    获取热门标签（文档指定接口）
 * @access  Public
 */
router.get('/tags/popular', async (req, res) => {
    try {
        const db = getDB();
        const pipeline = [
            { $match: { tags: { $exists: true, $ne: [] } } },
            { $unwind: "$tags" },
            {
                $group: {
                    _id: "$tags",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { name: "$_id", count: 1 } }
        ];

        const tags = await db.collection('items').aggregate(pipeline).toArray();

        res.json({
            code: 200,
            data: tags,
            message: '获取热门标签成功'
        });
    } catch (error) {
        console.error('获取标签错误:', error);
        res.status(500).json({
            code: 500,
            data: null,
            message: '服务器错误'
        });
    }
});

export default router;