export const getTimeArr = (now = new Date()): number[] => {
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()
  return [
    ...toArr(h),
    ...toArr(m),
    ...toArr(s)
  ]
}

export const toArr = (n: number): Array<number> => {
  return n >= 10 ? ('' + n).split('').map(item => Number(item)) : [0, n]
}

export const getDate = (time?: Date | number | string, cFormat?: string): string => {
  if (!time) {
    time = new Date()
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // 支持苹果端 safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatlocation: any = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  return format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatlocation[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
}

interface Weather {
  location?: string,
  city?: string,
  temp?: string | number,
  icon?: string | number,
  text?: string,
  errorMsg?: string
}

const weatherKey = '8422af80844d4badbd7f599eb42f0a33'
const weatherUrl = 'https://devapi.qweather.com/v7/weather/now'
const cityUrl = 'https://geoapi.qweather.com/v2/city/lookup'

export const getLocation = (): Promise<any> => {
  const weather: Weather = {}
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(false)
    navigator.geolocation.getCurrentPosition((position) => {
      weather.location = `${position.coords.longitude},${position.coords.latitude}`
      fetch(weatherUrl + `?key=${weatherKey}&location=${position.coords.longitude},${position.coords.latitude}`)
      .then(response => response.json())
      .then(res => {
        if (res.code === '200') {
          weather.temp = res.now.temp
          weather.icon = res.now.icon
          weather.text = res.now.text
        }
        fetch(cityUrl + `?key=${weatherKey}&location=${position.coords.longitude},${position.coords.latitude}`)
        .then(response => response.json())
        .then(res => {
          if (res.code === '200') {
            weather.city = `${res.location[0].adm1 ? res.location[0].adm1 : ''} ${res.location[0].adm2 ? res.location[0].adm2 : ''} ${res.location[0].name ? res.location[0].name : ''}`
          }
          resolve(weather)
        })
      })
      .catch(err => {
        console.log(err)
        reject(false)
      })
    }, (err) => {
      console.log(err)
      reject(false)
    })
  })
}
