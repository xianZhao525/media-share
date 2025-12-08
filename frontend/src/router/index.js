import { createRouter, createWebHistory } from 'vue-router'

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

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: '首页' }
  },
  {
    path: '/search',
    name: 'search',
    component: SearchResults,  // 这是你负责的页面
    meta: { title: '搜索' }
  },
  {
    path: '/login',
    name: 'login',
    component: PlaceholderComponent,
    props: {
      title: '用户登录',
      role: '角色一（用户认证）',
      eta: '本周内'
    },
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: PlaceholderComponent,
    props: {
      title: '用户注册',
      role: '角色一（用户认证）',
      eta: '本周内'
    },
    meta: { title: '注册' }
  },
  {
    path: '/explore',
    name: 'explore',
    component: PlaceholderComponent,
    props: {
      title: '内容探索',
      role: '角色二（内容管理）',
      eta: '本周内'
    },
    meta: { title: '探索' }
  },
  {
    path: '/create',
    name: 'create',
    component: PlaceholderComponent,
    props: {
      title: '内容创建',
      role: '角色二（内容管理）',
      eta: '本周内'
    },
    meta: { title: '创建' }
  },
  {
    path: '/activities',
    name: 'activities',
    component: PlaceholderComponent,
    props: {
      title: '社交动态',
      role: '角色四（社交动态）',
      eta: '下周'
    },
    meta: { title: '动态' }
  },
  {
    path: '/profile/:id?',
    name: 'profile',
    component: PlaceholderComponent,
    props: {
      title: '用户主页',
      role: '角色四（社交动态）',
      eta: '下周'
    },
    meta: { title: '个人主页' }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: {
      template: '<div style="padding: 3rem; text-align: center;"><h1>404</h1><p>页面不存在</p><router-link to="/">返回首页</router-link></div>'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 设置页面标题
router.beforeEach((to, from, next) => {
  const title = to.meta.title || '在线影视分享平台'
  document.title = `${title} - 影视分享平台`
  next()
})

export default router