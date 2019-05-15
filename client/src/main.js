import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuikit from 'vuikit'
// import { Card } from 'vuikit/lib/card'

// 超重要!!!!!
import '@vuikit/theme'

Vue.use(Vuikit)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
