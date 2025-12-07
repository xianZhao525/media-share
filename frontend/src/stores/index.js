import { createPinia } from 'pinia'

// 创建Pinia实例
const pinia = createPinia()

// 可以在这里添加插件
pinia.use(({ store }) => {
  // 在store中访问路由和路由
  store.$router = null
  store.$route = null
})

export default pinia