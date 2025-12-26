// backend/routes/search.js
import express from 'express';
import { getDB } from '../db/connection.js';

const router = express.Router();
let indexEnsured = false;

/**
 * 确保文本索引存在（惰性创建）
 */
const ensureTextIndex = async (db) => {
    if (indexEnsured) return;

    try {
        const indexes = await db.collection('items').indexes();
        const hasTextIndex = indexes.some(idx => idx.name === 'search_index');

        if (!hasTextIndex) {
            console.log('🔧 正在创建文本搜索索引...');
            await db.collection('items').createIndex(
                { title: "text", description: "text", tags: "text" },
                {
                    name: "search_index",
                    weights: { title: 3, description: 2, tags: 1 },
                    default_language: "none"  // 支持中文
                }
            );
            console.log('✅ 文本索引创建成功');
        }
        indexEnsured = true;
    } catch (error) {
        console.error('❌ 索引检查失败:', error);
        // 不抛出错误，允许搜索继续
    }
};

/**
 * @route   GET /api/search
 * @desc    全局搜索
 */
router.get('/', async (req, res) => {
    console.log('📡 API [/api/search]: 搜索请求', req.query);

    try {
        const db = getDB();
        await ensureTextIndex(db);

        const { q, type, tag, page = 1, limit = 20, sort = 'relevance' } = req.query;

        // 参数验证
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

        console.log('搜索参数:', { q, type, tag, pageNum, limitNum, sort });

        // 如果没有搜索词，返回空结果而不是报错
        if (!q || q.trim() === '') {
            return res.json({
                code: 200,
                data: {
                    results: [],
                    total: 0,
                    page: pageNum,
                    limit: limitNum,
                    pages: 0
                },
                message: '请输入搜索关键词'
            });
        }

        const filter = { status: 'active' }; // 只搜索活跃内容

        // 文本搜索（清理特殊字符）
        const searchText = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$text = { $search: searchText };

        // 类型筛选
        if (type && ['movie', 'tv', 'anime', 'variety', 'documentary'].includes(type)) {
            filter.type = type;
        }

        // 标签筛选
        if (tag && tag.trim()) {
            filter.tags = { $in: [tag.trim()] };
        }

        const skip = (pageNum - 1) * limitNum;

        // 构建排序
        let sortOption = {};
        if (sort === 'newest') {
            sortOption = { createdAt: -1 };
        } else if (sort === 'rating') {
            sortOption = { averageRating: -1 };
        } else if (sort === 'relevance') {
            sortOption = { score: { $meta: "textScore" } };
        }

        console.log('查询条件:', JSON.stringify(filter));
        console.log('排序条件:', JSON.stringify(sortOption));

        // 执行查询
        const [items, total] = await Promise.all([
            db.collection('items')
                .find(filter, sort === 'relevance' ? { score: { $meta: "textScore" } } : {})
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum)
                .toArray(),
            db.collection('items').countDocuments(filter)
        ]);

        console.log(`✅ 搜索到 ${total} 条结果，返回第 ${pageNum} 页`);

        // 格式化结果
        const results = items.map(item => ({
            _id: item._id.toString(),
            title: item.title,
            description: item.description,
            cover: item.cover,
            type: item.type,
            tags: item.tags || [],
            viewCount: item.viewCount || 0,
            averageRating: item.averageRating || 0,
            createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
            user: item.user || { username: '匿名' }
        }));

        res.json({
            code: 200,
            data: {
                results,
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            },
            message: '搜索成功'
        });

    } catch (error) {
        console.error('❌ 搜索错误:', error);
        res.status(500).json({
            code: 500,
            data: null,
            message: `搜索失败: ${error.message}`
        });
    }
});

export default router;