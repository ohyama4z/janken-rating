import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuikit from 'vuikit'
import VueSocketIO from 'vue-socket.io'

Vue.use(new VueSocketIO({
  debug: true,
  connection: 'https://api.jankenrating.tk'
}))

// import { Card } from 'vuikit/lib/card'

// 超重要!!!!!
import '@vuikit/theme'
import { IconUser } from '@vuikit/icons'

// register globally
Vue.component('VkIconsUser', IconUser)
// Vue.component('VkIconsClose', IconClose)



Vue.use(Vuikit)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
