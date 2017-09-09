// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueResource from 'vue-resource'
import VueEvents from 'vue-events'

import Mint from 'mint-ui'
import 'mint-ui/lib/style.css'
import FE_DEBUG from 'error-report-crab'
FE_DEBUG.init({
  siteId: '47b2f28e-a516-4475-8629-57492b227bf6',
  silent: process.env.NODE_ENV !== 'production'
})
Vue.config.errorHandler = function(err, vm) {
  FE_DEBUG.reportError(err)
}

import App from './App'
import router from './router'
import authorize from './authorize'

Vue.use(Mint)
Vue.use(VueEvents)
Vue.use(VueResource)
Vue.config.productionTip = false
Vue.http.options.emulateJSON = true
Vue.http.interceptors.push(function(request, next) {
  let authorize = {}
  try {
    authorize = JSON.parse(sessionStorage.authorize)
  } catch (e) {}

  if (authorize && authorize.openid) {
    if (request.params) {
      request.params.openid = authorize.openid
    } else {
      request.params = {
        openid: authorize.openid,
      }
    }
  }
  console.log(request)
  for (var key in request.params) {
    if (request.params[key] === null || request.params[key] === undefined || request.params[key] === '') {
      delete request.params[key]
    }
  }
  next((response) => {
    if (response.status === '401') {
      location.href = loginUrl
    }
  })
})




/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})