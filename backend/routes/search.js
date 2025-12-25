import express from 'express';
import { getDB } from '../db/connection.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

let indexEnsured = false; // 标记索引是否已创建

/**
 * 初始化文本索引（首次搜索时调用）
 */
const ensureTextIndex = async () => {
    if (indexEnsured) return;

    try {
        const db = getDB();
        const indexes = await db.collection('items').indexes();
        const hasTextIndex = indexes.some(index => index.key && index.key._fts === 'text');

        if (!hasTextIndex) {
            await db.collection('items').createIndex(
                { title: "text", description: "text", tags: "text" },
                { name: "search_index", weights: { title: 3, description: 2, tags: 1 } }
            );
            console.log('✅ 文本索引创建成功');
        }

        indexEnsured = true;
    } catch (error) {
        console.error('文本索引检查失败:', error);
    }
};

/**
 * @route   GET /api/search
 * @desc    全局搜索
 */
router.get('/', async (req, res) => {
    try {
        // 惰性初始化索引
        await ensureTextIndex();

        const { q, type, tag, page = 1, limit = 20 } = req.query;
        const db = getDB();

        // 参数验证
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

        if (!q && !type && !tag) {
            return res.json({
                code: 200,
                data: { results: [], total: 0, page: pageNum, limit: limitNum, pages: 0 },
                message: '请输入搜索关键词或筛选条件'
            });
        }

        const filter = {};
        if (q && q.trim()) filter.$text = { $search: q.trim() };
        if (type && ['movie', 'book', 'music'].includes(type)) filter.type = type;
        if (tag && tag.trim()) filter.tags = { $in: [tag.trim()] };

        const skip = (pageNum - 1) * limitNum;

        const [items, total] = await Promise.all([
            db.collection('items')
                .find(filter)
                .sort(q ? { score: { $meta: "textScore" } } : { createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .toArray(),
            db.collection('items').countDocuments(filter)
        ]);

        if (items.length === 0) {
            return res.json({
                code: 200,
                data: { results: [], total: 0, page: pageNum, limit: limitNum, pages: 0 },
                message: '未找到相关内容'
            });
        }

        // 批量获取作者信息
        const authorIds = items.map(item => new ObjectId(item.userId));
        const authors = await db.collection('users')
            .find({ _id: { $in: authorIds } })
            .project({ username: 1, avatar: 1, _id: 1 })
            .toArray();

        const authorMap = authors.reduce((map, author) => {
            map[author._id.toString()] = { username: author.username, avatar: author.avatar };
            return map;
        }, {});

        const results = items.map(item => ({
            ...item,
            author: authorMap[item.userId.toString()] || null
        }));

        res.json({
            code: 200,
            data: { results, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
            message: '搜索成功'
        });
    } catch (error) {
        console.error('搜索错误:', error);
        res.status(500).json({
            code: 500,
            data: null,
            message: '服务器错误，请稍后重试'
        });
    }
});

/**
 * @route   GET /api/tags/popular
 */
router.get('/tags/popular', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
        const db = getDB();

        const pipeline = [
            { $match: { tags: { $exists: true, $ne: [] } } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limitNum },
            { $project: { _id: 0, name: "$_id", count: 1 } }
        ];

        const tags = await db.collection('items').aggregate(pipeline).toArray();

        res.json({ code: 200, data: tags, message: '获取热门标签成功' });
    } catch (error) {
        console.error('获取标签错误:', error);
        res.status(500).json({ code: 500, data: null, message: '服务器错误' });
    }
});

/**
 * @route   GET /api/tags/suggest
 */
router.get('/tags/suggest', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 1) {
            return res.json({ code: 200, data: [], message: '请输入标签前缀' });
        }

        const db = getDB();
        const pipeline = [
            { $match: { tags: { $exists: true, $ne: [] } } },
            { $unwind: "$tags" },
            { $match: { tags: { $regex: `^${q.trim()}`, $options: 'i' } } },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, name: "$_id" } }
        ];

        const suggestions = await db.collection('items').aggregate(pipeline).toArray();

        res.json({ code: 200, data: suggestions, message: '获取标签建议成功' });
    } catch (error) {
        console.error('获取标签建议错误:', error);
        res.status(500).json({ code: 500, data: null, message: '服务器错误' });
    }
});

export default router;