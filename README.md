# 影视分享平台 – README

> 基于 Vue 3 + Node.js + MongoDB 的全栈影视社区平台，支持影视内容分享、全文搜索、评论评分、社交动态等功能。

## 📖 项目简介

本项目是一个在线影视分享与社交平台，用户可浏览、发布影视作品，进行评分、评论、点赞、关注等互动操作。系统采用前后端分离架构，前端使用 Vue 3 + Pinia + Element Plus，后端使用 Node.js + Express + MongoDB，实现了完整的用户认证、内容管理、智能搜索和动态信息流等核心功能。

项目由5人团队协作完成，xianZhao525担任组长，负责架构设计、全文搜索模块开发、团队协调及项目文档整合。

---

## ✨ 核心功能

### 用户模块
- 注册/登录（JWT 认证，密码 bcrypt 加密）
- 个人资料编辑（头像、昵称、简介）
- 关注/取关其他用户，查看粉丝与关注列表

### 影视内容模块
- 发布影视内容（标题、类型、封面、描述、标签）
- 内容列表分页、排序（最新/最热/评分）
- 内容详情页（基本信息、评分分布、相关推荐）

### 搜索与发现
- 全局全文搜索（支持标题、描述、标签，权重分配：标题>描述>标签）
- 多维度筛选（类型、年份、评分、标签）
- 热门标签推荐，点击快速搜索

### 社交互动
- 发布评论（1-5星评分，富文本内容）
- 评论点赞、回复、删除
- 动态流（展示用户发布、点赞、评论、关注等行为）
- 收藏影视内容，个人收藏夹展示

### 其他特性
- 响应式布局（PC / 移动端自适应）
- 内容浏览历史记录
- 后台数据统计（内容数量、评分分布等）

---

## 🛠️ 技术栈

| 层级      | 技术                                                     |
| --------- | -------------------------------------------------------- |
| 前端框架  | Vue 3 (Composition API) + Vue Router + Pinia             |
| UI 组件库 | Element Plus                                             |
| 构建工具  | Vite                                                     |
| HTTP 请求 | Axios                                                    |
| 后端框架  | Node.js + Express                                        |
| 数据库    | MongoDB（原生驱动 + Mongoose ODM）                       |
| 安全      | jsonwebtoken（JWT）、bcryptjs（密码加密）                |
| 其他工具  | Git（版本控制）、Postman（接口测试）、ESLint（代码规范） |

---

## 📁 项目结构

```
影视分享平台/
├── frontend/               # Vue 3 前端项目
│   ├── src/
│   │   ├── components/     # 可复用组件（NavBar, SearchResults...）
│   │   ├── views/          # 页面级组件（Home, Explore, ItemCreate...）
│   │   ├── stores/         # Pinia 状态管理（user, content...）
│   │   ├── services/       # API 请求封装
│   │   └── router/         # Vue Router 路由配置
│   └── package.json
├── backend/                # Node.js + Express 后端项目
│   ├── routes/             # 路由模块（auth, items, users, activities, search）
│   ├── models/             # MongoDB 数据模型（User, Item, Review, Activity）
│   ├── middleware/         # 认证、错误处理等中间件
│   ├── config/             # 数据库连接配置
│   └── server.js           # 入口文件
└── README.md
```

---

## 🚀 快速开始

### 前置条件
- Node.js (v16+)
- MongoDB (v6+ 本地或云服务，如 MongoDB Atlas)

### 安装与运行

1. **克隆仓库**
   ```bash
   git clone https://github.com/xianZhao525/media-share.git
   cd media-share
   ```

2. **后端配置与启动**
   ```bash
   cd backend
   npm install
   npm start
   ```
   后端默认运行在 `http://localhost:5000`
   
3. **前端配置与启动**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   前端默认运行在 `http://localhost:5173`

4. **数据初始化**  
   后端启动时会自动检测数据库是否为空，若为空则通过种子脚本插入示例影视内容与测试用户。

---

## 📡 主要 API 端点（示例）

| 模块   | 方法 | 端点                     | 说明               |
| ------ | ---- | ------------------------ | ------------------ |
| 认证   | POST | `/api/auth/register`     | 用户注册           |
|        | POST | `/api/auth/login`        | 用户登录           |
| 内容   | GET  | `/api/items`             | 获取内容列表       |
|        | POST | `/api/items`             | 创建内容（需登录） |
|        | GET  | `/api/items/:id`         | 获取内容详情       |
| 评论   | POST | `/api/items/:id/reviews` | 发表评论           |
|        | GET  | `/api/items/:id/reviews` | 获取评论列表       |
| 搜索   | GET  | `/api/search?q=关键词`   | 全局全文搜索       |
| 用户   | GET  | `/api/users/:id`         | 获取用户信息       |
|        | POST | `/api/users/:id/follow`  | 关注用户           |
| 动态流 | GET  | `/api/activities/feed`   | 获取个人动态流     |

---

## 🎨 效果图（部分示例）

首页轮播与推荐：

![image-20260409233240646](C:\Users\墨懒\AppData\Roaming\Typora\typora-user-images\image-20260409233240646.png)

![image-20260409233310312](C:\Users\墨懒\AppData\Roaming\Typora\typora-user-images\image-20260409233310312.png)

搜索结果页：

![image-20260409233517765](C:\Users\墨懒\AppData\Roaming\Typora\typora-user-images\image-20260409233517765.png)

![image-20260409233528023](C:\Users\墨懒\AppData\Roaming\Typora\typora-user-images\image-20260409233528023.png)

内容发布页：

![image-20260409233607760](C:\Users\墨懒\AppData\Roaming\Typora\typora-user-images\image-20260409233607760.png)

![image-20260409233614767](C:\Users\墨懒\AppData\Roaming\Typora\typora-user-images\image-20260409233614767.png)

评论和评分：

![image-20260409233802659](C:\Users\墨懒\AppData\Roaming\Typora\typora-user-images\image-20260409233802659.png)

登录页：

![image-20260409233707004](C:\Users\墨懒\AppData\Roaming\Typora\typora-user-images\image-20260409233707004.png)

注册页：

![image-20260409233720868](C:\Users\墨懒\AppData\Roaming\Typora\typora-user-images\image-20260409233720868.png)





---

## 👥 团队成员与分工

| 账号         | 角色 | 主要贡献                                                     |
| ------------ | ---- | ------------------------------------------------------------ |
| xianZhao525  | 组长 | 项目架构设计、全文搜索模块（后端索引+前端SearchResults）、Git分支管理、文档整合 |
| Lykke-333    | 组员 | 内容管理模块（Item CRUD）、首页与探索页面开发                |
| LOngst3r     | 组员 | 评论与评分模块（Review 集合、评论组件、评分统计）cch         |
| cchh030308   | 组员 | 用户认证模块（注册/登录、JWT）、用户个人页面                 |
| April-doudou | 组员 | 社交动态模块（Activity 集合、动态流、关注按钮）、系统测试    |

---

## 📚 项目亮点

- **全文搜索优化**：利用 MongoDB 文本索引与聚合管道，实现标题权重3、描述权重2、标签权重1的相关性排序。
- **实时评分更新**：新增或删除评论时，自动重新计算内容的平均评分和评分分布。
- **Activity Streams 标准**：动态模块采用 actor-verb-object 结构，统一处理发布、点赞、评论、关注等多种事件。
- **响应式组件库**：基于 Element Plus 二次封装，适配移动端触摸操作。

---

## ⚠️ 已知不足与改进方向

- **性能**：部分复杂聚合查询在大数据量下响应较慢，计划引入 Redis 缓存。
- **功能**：暂未集成视频播放器，后续可接入 Video.js；社交功能缺少私信。
- **工程化**：缺少单元测试与 CI/CD，未来可加入 Jest + GitHub Actions。
- **部署**：目前仅支持本地运行，可进一步打包为 Docker 镜像并部署到云服务器。

---

## 📄 许可证

本项目仅供学习交流使用，课程作品。

---

## 🙏 致谢

感谢指导老师 **胡乔** 在 MongoDB 课程中的悉心指导，以及团队成员的通力协作。

---

项目仓库：https://github.com/xianZhao525/media-share.git

---

*最后更新：2025年12月*