/**
 * 时间格式化
 * @param  {[Number]} date 时间戳
 * @param  {[DateString]} fmt  时间格式
 * dateFormat('yyyy-MM-dd hh:mm:ss.S') => 2016-03-12 20:13:32.232
 * @return {[date]} 时间
 */
export const dateFormat = (date, fmt = 'yyyy-MM-dd') => {
  let date1 = date
  try {
    if (!(date instanceof Date)) {
      if (typeof date === 'string') {
        date.replace(/-/g, '/')
      }
      date1 = new Date(date)
    }
    const o = {
      'M+': date1.getMonth() + 1, // 月
      'd+': date1.getDate(), // 日
      'h+': date1.getHours(), // 小时
      'm+': date1.getMinutes(), // 分
      's+': date1.getSeconds(), // 秒
      'q+': Math.floor((date1.getMonth() + 3) / 3), // 季度S
      'S': date1.getMilliseconds() // 毫秒
    }
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date1.getFullYear() + '').substr(4 - RegExp.$1.length))
    }

    for (let k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      }
    }
    return fmt
  } catch (err) {
    console.log('时间格式错了')
    return ''
  }
}