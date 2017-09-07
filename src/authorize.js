import { authorize } from './api'

export default () => new Promise((resolve, reject) => {
  authorize()
    .then(res => {
      console.log(res)
      sessionStorage.authorize = JSON.stringify(res.body.data)
      resolve(res.body.data)
    })
    .catch(res => {
      alert('获取token失败')
      reject(res)
    })
})