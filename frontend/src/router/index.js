import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/explore',
    name: 'Explore',
    component: () => import('../views/ExploreView.vue')
  },
  {
    path: '/item/create',
    name: 'ItemCreate',
    component: () => import('../views/ItemCreate.vue')
  },
  {
    path: '/item/:id',
    name: 'ItemDetail',
    component: () => import('../views/ItemDetail.vue')
  },
  {
    path: '/ItemDetail',  // 注意大小写！路径是区分大小写的
    name: 'ItemDetailPage',
    component: () => import('../views/ItemDetail.vue'),
    props: { itemId: 'default-123' }  // 传递默认的 itemId
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue')
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/SearchResults.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router