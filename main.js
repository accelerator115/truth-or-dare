import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import uniPopup from '@/components/uni-popup/uni-popup.vue'
import uniTransition from '@/components/uni-transition/uni-transition.vue'
import guide from '@/components/guide/guide.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.component('uni-popup', uniPopup)
  app.component('uni-transition', uniTransition)
  app.component('guide', guide)
  return {
    app
  }
}
// #endif