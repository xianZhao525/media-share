/**
 * 搜索相关的MongoDB查询语句（角色五的MongoDB工作）
 */

// 1. 创建文本索引（在MongoDB shell中执行或通过Node.js执行）
const createTextIndex = `
db.items.createIndex(
    { 
        title: "text", 
        description: "text", 
        tags: "text" 
    },
    { 
        name: "search_index",
        weights: { 
            title: 3,    // 标题权重最高
            description: 2, 
            tags: 1 
        }
    }
);
`;

// 2. 高频查询字段索引
const createCommonIndexes = `
// 类型和创建时间索引
db.items.createIndex({ type: 1, createdAt: -1 });

// 用户ID索引（用于关联查询）
db.items.createIndex({ userId: 1 });

// 标签索引
db.items.createIndex({ tags: 1 });

// 评分索引
db.items.createIndex({ averageRating: -1 });
`;

// 3. 搜索查询示例
const searchExamples = {
    // 基础全文搜索
    basicSearch: `
db.items.find(
    { $text: { $search: "电影推荐" } },
    { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } }).limit(20);
    `,

    // 带筛选的搜索
    filteredSearch: `
db.items.find({
    $text: { $search: "科幻" },
    type: "movie",
    tags: "悬疑"
}).sort({ score: { $meta: "textScore" } });
    `,

    // 聚合热门标签
    popularTags: `
db.items.aggregate([
    { $match: { tags: { $exists: true, $ne: [] } } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
]);
    `,

    // 搜索用户相关内容
    searchWithUser: `
db.items.aggregate([
    { $match: { $text: { $search: "纪录片" } } },
    { $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "author"
    }},
    { $unwind: "$author" },
    { $project: {
        title: 1,
        type: 1,
        description: 1,
        cover: 1,
        "author.username": 1,
        "author.avatar": 1,
        score: { $meta: "textScore" }
    }},
    { $sort: { score: { $meta: "textScore" } } }
]);
    `
};

export { createTextIndex, createCommonIndexes, searchExamples };