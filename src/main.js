import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

window.addEventListener('pageshow', (event) => {
  if (event.persisted) window.location.reload()
})

const app = createApp(App)
app.use(router)
app.mount('#app')