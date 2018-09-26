import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Datasets from './views/Datasets.vue'
import Dataset from './views/Dataset.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/datasets',
      name: 'datasets',
      component: Datasets
    },
    {
      path: '/datasets/:exchange/:base/:quote/:from/:to',
      name: 'dataset',
      component: Dataset
    }
  ]
})
