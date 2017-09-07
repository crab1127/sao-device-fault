import Vue from 'vue'
import Router from 'vue-router'

import Index from '@/views/index'
import FaultDetail from '@/views/detail'
import Category from '@/views/category'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/details/:id',
      name: 'detail',
      component: FaultDetail
    },
    {
      path: '/category',
      name: 'category',
      component: Category
    }
  ]
})