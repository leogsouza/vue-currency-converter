import Vue from 'vue'
import Quotes from '@/components/Quotes.vue'
import router from './router'

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  next()
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(Quotes),
}).$mount('#app')
