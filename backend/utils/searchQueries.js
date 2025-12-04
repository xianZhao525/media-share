// backend/utils/searchQueries.js
class SearchQueries {
    // 全文搜索（文档要求：$text + $search）
    static fullTextSearch(query) {
        return {
            $text: { $search: query }
        };
    }

    // 热门标签聚合（文档要求：$unwind + $group）
    static popularTagsAggregation(limit = 10) {
        return [
            { $match: { tags: { $exists: true, $ne: [] } } },
            { $unwind: "$tags" },
            {
                $group: {
                    _id: "$tags",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            { $project: { name: "$_id", count: 1 } }
        ];
    }

    // 搜索筛选查询（文档要求：$match）
    static buildSearchFilter(query, type, tag) {
        const filter = {};

        if (query) {
            filter.$text = { $search: query };
        }
        if (type) {
            filter.type = type;
        }
        if (tag) {
            filter.tags = tag;
        }

        return filter;
    }
}