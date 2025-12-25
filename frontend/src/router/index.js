import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// 导入已经存在的文件（只有这两个是确定存在的）
import HomeView from '@/views/HomeView.vue'
import SearchResults from '@/views/SearchResults.vue'

// 删除或注释掉下面所有不存在的导入！！！
// import PlaceholderView from '@/views/PlaceholderView.vue'
// import NavBar from '@/components/NavBar.vue'
// import Login from '@/views/Login.vue'
// import Register from '@/views/Register.vue'
// import ItemCreate from '@/views/ItemCreate.vue'
// import ActivityFeed from '@/views/ActivityFeed.vue'    // 这个文件不存在！
// import UserProfile from '@/views/UserProfile.vue'     // 这个文件不存在！

// 简单的占位组件
const PlaceholderComponent = {
  template: `
    <div style="padding: 3rem; text-align: center; background: #f5f5f5; border-radius: 10px; margin: 2rem;">
      <h2>{{ title || '功能页面' }}</h2>
      <p>👨‍💻 由 <strong>{{ role || '对应角色' }}</strong> 负责开发</p>
      <p>📅 预计完成时间：{{ eta || '开发中' }}</p>
      <router-link to="/" style="color: #42b983;">🏠 返回首页</router-link>
    </div>
  `,
  props: ['title', 'role', 'eta']
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: '首页 - 媒体分享平台',
        requiresAuth: false
      }
    },
    {
      path: '/explore',
      name: 'explore',
      component: () => import('@/views/ExploreView.vue'),
      meta: {
        title: '探索 - 媒体分享平台',
        requiresAuth: false
      }
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('@/views/ItemCreate.vue'),
      meta: {
        title: '创建内容 - 媒体分享平台',
        requiresAuth: false
      }
    },
    {
      path: '/item/:id',
      name: 'item-detail',
      component: () => import('@/views/ItemDetailView.vue'),
      meta: {
        title: '内容详情 - 媒体分享平台',
        requiresAuth: false
      },
      props: true
    },
    {
      path: '/item/:id/edit',
      name: 'item-edit',
      component: () => import('@/views/ItemEdit.vue'),
      meta: {
        title: '编辑内容 - 媒体分享平台',
        requiresAuth: true
      },
      props: true
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: {
        title: '搜索 - 媒体分享平台',
        requiresAuth: false
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: {
        title: '登录 - 媒体分享平台',
        requiresAuth: false
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: {
        title: '注册 - 媒体分享平台',
        requiresAuth: false
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: {
        title: '个人中心 - 媒体分享平台',
        requiresAuth: true
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
      meta: {
        title: '页面未找到 - 媒体分享平台'
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title;
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error);
});

export default router;