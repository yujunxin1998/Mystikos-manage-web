import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
window.addEventListener('auth:expired', () => {
  void router.replace('/login')
})
app.mount('#app')
