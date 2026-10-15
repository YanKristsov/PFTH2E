import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'

import '@/assets/styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

registerSW({
  onNeedRefresh() {
    if (confirm('Доступна новая версия. Перезагрузить?')) {
      window.location.reload()
    }
  },
  onOfflineReady() {
    // App ready for offline use
  }
})

app.mount('#app')