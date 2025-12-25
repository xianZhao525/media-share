import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// 导入所有已存在的页面
import HomeView from '@/views/HomeView.vue'
import SearchResults from '@/views/SearchResults.vue'
import ExploreView from '@/views/ExploreView.vue'
import ItemCreate from '@/views/ItemCreate.vue'
import ItemDetailView from '@/views/ItemDetailView.vue'
import ItemEdit from '@/views/ItemEdit.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import ProfileView from '@/views/ProfileView.vue'
import NotFound from '@/views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '首页 - 媒体分享平台',
        requiresAuth: false
      }
    },
    {
      path: '/explore',
      name: 'explore',
      component: ExploreView,
      meta: {
        title: '探索 - 媒体分享平台',
        requiresAuth: false
      }
    },
    {
      path: '/create',
      name: 'create',
      component: ItemCreate,
      meta: {
        title: '创建内容 - 媒体分享平台',
        requiresAuth: false
      }
    },
    {
      path: '/item/:id',
      name: 'item-detail',
      component: ItemDetailView,
      meta: {
        title: '内容详情 - 媒体分享平台',
        requiresAuth: false
      },
      props: true
    },
    {
      path: '/item/:id/edit',
      name: 'item-edit',
      component: ItemEdit,
      meta: {
        title: '编辑内容 - 媒体分享平台',
        requiresAuth: true
      },
      props: true
    },
    {
      path: '/search',  // ✅ 修复：直接指向 SearchResults
      name: 'search',
      component: SearchResults,  // ✅ 不再使用 SearchView.vue
      meta: {
        title: '搜索 - 媒体分享平台',
        requiresAuth: false
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: '登录 - 媒体分享平台',
        requiresAuth: false
      }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: {
        title: '注册 - 媒体分享平台',
        requiresAuth: false
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        title: '个人中心 - 媒体分享平台',
        requiresAuth: true
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
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

  if (to.meta.title) {
    document.title = to.meta.title;
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

router.onError((error) => {
  console.error('路由错误:', error);
});

export default router;