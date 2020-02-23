import Vue from 'vue'
//import App from './App.vue'
import Echarts from './Echarts.vue'
// 引入echarts
//import echarts from 'echarts'
//Vue.prototype.$echarts = echarts
Vue.config.productionTip = false

new Vue({
  render: h => h(Echarts),
}).$mount('#myChartChina')
