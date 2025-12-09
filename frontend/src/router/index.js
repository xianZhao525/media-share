import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // 将活动流作为首页
  {
    path: '/',
    name: 'ActivityFeed',
    component: () => import('@/views/ActivityFeed.vue')  // 使用 @ 别名
  },
  {
    path: '/feed',
    redirect: '/'  // 重定向到首页
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/explore',
    name: 'Explore',
    component: () => import('@/views/ExploreView.vue')
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue')
  },
  // 其他路由...
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router