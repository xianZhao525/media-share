import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/activities/feed'
  },
  {
    path: '/activities/feed',
    name: 'ActivityFeed',
    component: () => import('@/views/ActivityFeed.vue')
  },
  // {
  //   path: '/dynamic/:id',
  //   name: 'DynamicDetail',
  //   component: () => import('@/views/DynamicDetail.vue') // 如果需要详情页
  // },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router