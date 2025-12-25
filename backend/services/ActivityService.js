// backend/services/ActivityService.js
import { ObjectId } from 'mongodb';

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

  async createActivity(activityData) {
    try {
      const now = new Date();
      const activity = {
        ...activityData,
        createdAt: now,
        updatedAt: now
      };

      const result = await this.activities.insertOne(activity);
      return result.insertedId.toString();
    } catch (error) {
      console.error('创建动态失败:', error);
      throw error;
    }
  }

  async getActivityById(activityId) {
    try {
      const pipeline = [
        { $match: { _id: new ObjectId(activityId) } },
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
            pipeline: [{ $match: { $expr: { $eq: ['$activityId', '$$activityId'] } } }],
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

  async getUserFeed(userId, page = 1, limit = 20, type = null) {
    try {
      const skip = (page - 1) * limit;

      const following = await this.follows.find({
        follower: new ObjectId(userId)
      }).project({ following: 1 }).toArray();

      const followingIds = following.map(f => f.following);
      followingIds.push(new ObjectId(userId));

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
            pipeline: [{ $match: { $expr: { $eq: ['$activityId', '$$activityId'] } } }],
            as: 'allLikes'
          }
        },
        {
          $addFields: {
            isLiked: { $gt: [{ $size: '$userLike' }, 0] },
            likeCount: { $size: '$allLikes' }
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
            commentCount: { $size: '$allLikes' }
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

  async getUserActivities(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const pipeline = [
        { $match: { actor: new ObjectId(userId) } },
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
            pipeline: [{ $match: { $expr: { $eq: ['$activityId', '$$activityId'] } } }],
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
      return activities;
    } catch (error) {
      console.error('获取用户动态失败:', error);
      throw error;
    }
  }

  async deleteActivity(activityId) {
    try {
      await this.activities.deleteOne({ _id: new ObjectId(activityId) });
      await this.likes.deleteMany({ activityId: new ObjectId(activityId) });
      await this.comments.deleteMany({ activityId: new ObjectId(activityId) });
      return true;
    } catch (error) {
      console.error('删除动态失败:', error);
      throw error;
    }
  }

  async toggleLike(activityId, userId) {
    try {
      const activityObjectId = new ObjectId(activityId);
      const userObjectId = new ObjectId(userId);

      const existingLike = await this.likes.findOne({
        activityId: activityObjectId,
        userId: userObjectId
      });

      if (existingLike) {
        await this.likes.deleteOne({ _id: existingLike._id });
      } else {
        await this.likes.insertOne({
          activityId: activityObjectId,
          userId: userObjectId,
          createdAt: new Date()
        });
      }

      const likeCount = await this.likes.countDocuments({ activityId: activityObjectId });

      return {
        isLiked: !existingLike,
        likeCount
      };
    } catch (error) {
      console.error('点赞操作失败:', error);
      throw error;
    }
  }

  async getActivityComments(activityId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const pipeline = [
        { $match: { activityId: new ObjectId(activityId), parentId: null } },
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
          $addFields: {
            likeCount: 0,
            replyCount: 0
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
            replyCount: 1
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
}

export default ActivityService;