// export const API_ROOT = apiRoot || 'http://192.168.120.236:18088/rwy-service'
export const API_ROOT = apiRoot || 'http://testmpapi.redseawetoo.com'

export const API = {
  // 认证
  authorize: API_ROOT + '/user/fault/authorize',

  // 故障列表
  fault: API_ROOT + '/device/handleFault',
  faultDetail: API_ROOT + '/device/handleFault',
  // 故障描述类目
  faultCategory: API_ROOT + '/device/category',

  //  /rwy-service/device/desc/{terminalId}
  faultDeviceDesc: API_ROOT + '/device/desc'
}