import Vue from 'vue'
import { API } from './config'

export const authorize = params => Vue.http.get(API.authorize)


// 故障
export const saveFault = params => Vue.http.post(API.fault, params)
export const fetchFaultList = params => Vue.http.get(API.fault + '/' + params.type, { params })
export const fetchFaultDetail = params => Vue.http.get(API.faultDetail + '/' + params.id)
export const fetchfaultCategory = params => Vue.http.get(API.faultCategory, { params })
export const fetchFaultDeviceDesc = params => Vue.http.get(API.faultDeviceDesc + '/' + params.id, { params })