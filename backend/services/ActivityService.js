// backend/services/ActivityService.js
const { ObjectId } = require('mongodb');

class ActivityService {
  constructor(db) {
    this.db = db;
    this.activities = db.collection('activities');
    this.users = db.collection('users');
    this.posts = db.collection('posts');
    this.comments = db.collection('comments');
    this.follows = db.collection('follows');
    this.likes = db.collection('likes');
  }

  // 1. 插入动态记录
  async createActivity(activityData) {
    try {
      const now = new Date();
      const activity = {
        ...activityData,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await this.activities.insertOne(activity);
      return result.insertedId;
    } catch (error) {
      console.error('创建动态失败:', error);
      throw error;
    }
  }

  // 2. 获取动态详情
  async getActivityById(activityId) {
    try {
      const pipeline = [
        {
          $match: {
            _id: new ObjectId(activityId)
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'actor',
            foreignField: '_id',
            as: 'actorInfo'
          }
        },
        { $unwind: '$actorInfo' },
        {
          $lookup: {
            from: 'likes',
            let: { activityId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$activityId', '$$activityId']
                  }
                }
              }
            ],
            as: 'likes'
          }
        },
        {
          $addFields: {
            likeCount: { $size: '$likes' }
          }
        },
        {
          $project: {
            _id: 1,
            type: 1,
            content: 1,
            images: 1,
            createdAt: 1,
            updatedAt: 1,
            actor: {
              _id: '$actorInfo._id',
              username: '$actorInfo.username',
              avatar: '$actorInfo.avatar'
            },
            object: 1,
            target: 1,
            likeCount: 1
          }
        }
      ];

      const activities = await this.activities.aggregate(pipeline).toArray();
      return activities[0] || null;
    } catch (error) {
      console.error('获取动态详情失败:', error);
      throw error;
    }
  }

  // 3. 获取用户动态流 (优化版)
  async getUserFeed(userId, page = 1, limit = 20, type = null) {
    try {
      const skip = (page - 1) * limit;
      
      // 获取用户关注列表
      const following = await this.follows.find({ 
        follower: new ObjectId(userId) 
      }).project({ following: 1 }).toArray();
      
      const followingIds = following.map(f => f.following);
      followingIds.push(new ObjectId(userId)); // 包括自己
      
      // 构建查询条件
      let matchStage = {
        actor: { $in: followingIds }
      };
      
      if (type) {
        matchStage.type = type;
      }
      
      const pipeline = [
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'actor',
            foreignField: '_id',
            as: 'actorInfo'
          }
        },
        { $unwind: '$actorInfo' },
        {
          $lookup: {
            from: 'likes',
            let: { activityId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$activityId', '$$activityId'] },
                      { $eq: ['$userId', new ObjectId(userId)] }
                    ]
                  }
                }
              }
            ],
            as: 'userLike'
          }
        },
        {
          $lookup: {
            from: 'likes',
            let: { activityId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$activityId', '$$activityId']
                  }
                }
              }
            ],
            as: 'allLikes'
          }
        },
        {
          $lookup: {
            from: 'comments',
            let: { activityId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$activityId', '$$activityId']
                  }
                }
              },
              { $sort: { createdAt: -1 } },
              { $limit: 3 }
            ],
            as: 'recentComments'
          }
        },
        {
          $addFields: {
            isLiked: { $gt: [{ $size: '$userLike' }, 0] },
            likeCount: { $size: '$allLikes' },
            commentCount: {
              $cond: {
                if: { $isArray: '$allComments' },
                then: { $size: '$allComments' },
                else: 0
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            type: 1,
            content: 1,
            images: 1,
            createdAt: 1,
            actor: {
              _id: '$actorInfo._id',
              username: '$actorInfo.username',
              avatar: '$actorInfo.avatar',
              verified: '$actorInfo.verified'
            },
            object: 1,
            target: 1,
            isLiked: 1,
            likeCount: 1,
            commentCount: 1,
            recentComments: {
              $map: {
                input: '$recentComments',
                as: 'comment',
                in: {
                  _id: '$$comment._id',
                  content: '$$comment.content',
                  createdAt: '$$comment.createdAt',
                  user: {
                    _id: '$$comment.userId',
                    username: '$$comment.username',
                    avatar: '$$comment.avatar'
                  }
                }
              }
            }
          }
        }
      ];

      const activities = await this.activities.aggregate(pipeline).toArray();
      return activities;
    } catch (error) {
      console.error('获取动态流失败:', error);
      throw error;
    }
  }

  // 4. 获取指定用户的动态
  async getUserActivities(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const pipeline = [
        {
          $match: {
            actor: new ObjectId(userId)
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'actor',
            foreignField: '_id',
            as: 'actorInfo'
          }
        },
        { $unwind: '$actorInfo' },
        {
          $lookup: {
            from: 'likes',
            let: { activityId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$activityId', '$$activityId']
                  }
                }
              }
            ],
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'comments',
            let: { activityId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$activityId', '$$activityId']
                  }
                }
              }
            ],
            as: 'comments'
          }
        },
        {
          $addFields: {
            likeCount: { $size: '$likes' },
            commentCount: { $size: '$comments' }
          }
        },
        {
          $project: {
            _id: 1,
            type: 1,
            content: 1,
            images: 1,
            createdAt: 1,
            actor: {
              _id: '$actorInfo._id',
              username: '$actorInfo.username',
              avatar: '$actorInfo.avatar'
            },
            object: 1,
            target: 1,
            likeCount: 1,
            commentCount: 1
          }
        }
      ];

      const activities = await this.activities.aggregate(pipeline).toArray();
      return activities;
    } catch (error) {
      console.error('获取用户动态失败:', error);
      throw error;
    }
  }

  // 5. 删除动态
  async deleteActivity(activityId) {
    try {
      const result = await this.activities.deleteOne({
        _id: new ObjectId(activityId)
      });
      
      // 同时删除相关的点赞和评论
      await this.likes.deleteMany({ activityId: new ObjectId(activityId) });
      await this.comments.deleteMany({ activityId: new ObjectId(activityId) });
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error('删除动态失败:', error);
      throw error;
    }
  }

  // 6. 点赞/取消点赞
  async toggleLike(activityId, userId) {
    try {
      const activityObjectId = new ObjectId(activityId);
      const userObjectId = new ObjectId(userId);
      
      // 检查是否已经点赞
      const existingLike = await this.likes.findOne({
        activityId: activityObjectId,
        userId: userObjectId
      });
      
      if (existingLike) {
        // 取消点赞
        await this.likes.deleteOne({
          _id: existingLike._id
        });
      } else {
        // 添加点赞
        await this.likes.insertOne({
          activityId: activityObjectId,
          userId: userObjectId,
          createdAt: new Date()
        });
      }
      
      // 获取更新后的点赞数
      const likeCount = await this.likes.countDocuments({
        activityId: activityObjectId
      });
      
      return {
        isLiked: !existingLike,
        likeCount
      };
    } catch (error) {
      console.error('点赞操作失败:', error);
      throw error;
    }
  }

  // 7. 获取动态评论
  async getActivityComments(activityId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const pipeline = [
        {
          $match: {
            activityId: new ObjectId(activityId),
            parentId: null // 只获取顶级评论
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        { $unwind: '$userInfo' },
        {
          $lookup: {
            from: 'likes',
            let: { commentId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$commentId', '$$commentId']
                  }
                }
              }
            ],
            as: 'commentLikes'
          }
        },
        {
          $lookup: {
            from: 'comments',
            let: { parentId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$parentId', '$$parentId']
                  }
                }
              },
              { $sort: { createdAt: 1 } },
              { $limit: 3 },
              {
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'replyUserInfo'
                }
              },
              { $unwind: '$replyUserInfo' }
            ],
            as: 'replies'
          }
        },
        {
          $addFields: {
            likeCount: { $size: '$commentLikes' },
            replyCount: { $size: '$replies' }
          }
        },
        {
          $project: {
            _id: 1,
            content: 1,
            createdAt: 1,
            user: {
              _id: '$userInfo._id',
              username: '$userInfo.username',
              avatar: '$userInfo.avatar'
            },
            likeCount: 1,
            replyCount: 1,
            replies: {
              $map: {
                input: '$replies',
                as: 'reply',
                in: {
                  _id: '$$reply._id',
                  content: '$$reply.content',
                  createdAt: '$$reply.createdAt',
                  user: {
                    _id: '$$reply.replyUserInfo._id',
                    username: '$$reply.replyUserInfo.username',
                    avatar: '$$reply.replyUserInfo.avatar'
                  }
                }
              }
            }
          }
        }
      ];

      const comments = await this.comments.aggregate(pipeline).toArray();
      return comments;
    } catch (error) {
      console.error('获取评论失败:', error);
      throw error;
    }
  }

  // 8. 添加评论
  async addComment(activityId, userId, content, parentId = null) {
    try {
      const now = new Date();
      const comment = {
        activityId: new ObjectId(activityId),
        userId: new ObjectId(userId),
        content,
        parentId: parentId ? new ObjectId(parentId) : null,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await this.comments.insertOne(comment);
      comment._id = result.insertedId;
      
      // 获取用户信息
      const user = await this.users.findOne(
        { _id: new ObjectId(userId) },
        { projection: { username: 1, avatar: 1 } }
      );
      
      return {
        ...comment,
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar
        }
      };
    } catch (error) {
      console.error('添加评论失败:', error);
      throw error;
    }
  }

  // 9. 获取动态流数量
  async getFeedCount(userId) {
    try {
      // 获取用户关注列表
      const following = await this.follows.find({ 
        follower: new ObjectId(userId) 
      }).project({ following: 1 }).toArray();
      
      const followingIds = following.map(f => f.following);
      followingIds.push(new ObjectId(userId));
      
      const count = await this.activities.countDocuments({
        actor: { $in: followingIds }
      });
      
      return count;
    } catch (error) {
      console.error('获取动态流数量失败:', error);
      throw error;
    }
  }

  // 10. 获取用户动态数量
  async getActivityCount(userId) {
    try {
      const count = await this.activities.countDocuments({
        actor: new ObjectId(userId)
      });
      return count;
    } catch (error) {
      console.error('获取动态数量失败:', error);
      throw error;
    }
  }

  // 11. 获取用户动态统计信息
  async getUserActivityStats(userId) {
    try {
      const pipeline = [
        {
          $match: {
            actor: new ObjectId(userId)
          }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            lastActivity: { $max: '$createdAt' }
          }
        }
      ];

      const stats = await this.activities.aggregate(pipeline).toArray();
      
      // 转换为对象格式
      const result = {
        post: 0,
        like: 0,
        comment: 0,
        follow: 0,
        share: 0,
        total: 0
      };
      
      stats.forEach(stat => {
        result[stat._id] = stat.count;
        result.total += stat.count;
      });
      
      return result;
    } catch (error) {
      console.error('获取用户动态统计失败:', error);
      throw error;
    }
  }

  // 12. 创建不同类型的动态记录（便捷方法）
  async createPostActivity(userId, postId, content = '', images = []) {
    const postObject = await this.posts.findOne(
      { _id: new ObjectId(postId) },
      { projection: { title: 1, cover: 1, type: 1 } }
    );
    
    return this.createActivity({
      type: 'post',
      actor: new ObjectId(userId),
      object: new ObjectId(postId),
      content,
      images,
      metadata: {
        postTitle: postObject?.title,
        postCover: postObject?.cover,
        postType: postObject?.type
      }
    });
  }

  async createLikeActivity(userId, targetId, targetType) {
    const activityData = {
      type: 'like',
      actor: new ObjectId(userId),
      object: new ObjectId(targetId)
    };
    
    if (targetType === 'post') {
      const post = await this.posts.findOne(
        { _id: new ObjectId(targetId) },
        { projection: { title: 1 } }
      );
      activityData.metadata = { postTitle: post?.title };
    }
    
    return this.createActivity(activityData);
  }

  async createCommentActivity(userId, commentId, postId) {
    const post = await this.posts.findOne(
      { _id: new ObjectId(postId) },
      { projection: { title: 1 } }
    );
    
    return this.createActivity({
      type: 'comment',
      actor: new ObjectId(userId),
      object: new ObjectId(commentId),
      target: new ObjectId(postId),
      metadata: {
        postTitle: post?.title
      }
    });
  }

  async createFollowActivity(userId, targetUserId) {
    const targetUser = await this.users.findOne(
      { _id: new ObjectId(targetUserId) },
      { projection: { username: 1 } }
    );
    
    return this.createActivity({
      type: 'follow',
      actor: new ObjectId(userId),
      object: new ObjectId(targetUserId),
      metadata: {
        targetUsername: targetUser?.username
      }
    });
  }
}

module.exports = ActivityService;