import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import SearchResults from '@/views/SearchResults.vue';

// 其他组员的页面（需要他们提供后导入）
import Login from '@/views/Login.vue';           // 角色一
import Register from '@/views/Register.vue';     // 角色一
import ItemCreate from '@/views/ItemCreate.vue'; // 角色二
import ActivityFeed from '@/views/ActivityFeed.vue'; // 角色四
import UserProfile from '@/views/UserProfile.vue';   // 角色四

const PlaceholderComponent = { template: '<div>功能开发中...</div>' }

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/search',
    name: 'search',
    component: SearchResults
  },
  // 其他组员的路由
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/create',
    name: 'create',
    component: ItemCreate
  },
  {
    path: '/activities',
    name: 'activities',
    component: ActivityFeed
  },
  {
    path: '/users/:id',
    name: 'user-profile',
    component: UserProfile
  },
  {
    path: '/items/:id',
    name: 'item-detail',
    component: () => import('@/views/ItemDetail.vue') // 角色二/三
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;