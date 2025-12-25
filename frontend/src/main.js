import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 创建应用实例
const app = createApp(App)

// 使用 Pinia
const pinia = createPinia()
app.use(pinia)

// 使用路由
if (process.env.NODE_ENV === 'development') {
    const meta = document.createElement('meta');
    meta.httpEquiv = "Content-Security-Policy";
    meta.content = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;";
    document.head.appendChild(meta);
}
app.use(router)

// 挂载应用
app.mount('#app')