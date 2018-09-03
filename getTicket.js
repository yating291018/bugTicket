var http = require('http')
var params = `/yii.php?r=train/trainTicket/getTickets&primary[departureDate]=2018-09-30&primary[departureCityCode]=2500&primary[departureCityName]=上海&primary[arrivalCityCode]=1217&primary[arrivalCityName]=信阳&
start=0&limit=0`
var options = {
    host:"huoche.tuniu.com",
    port:80,
    path: encodeURI(params),
    method:"get"
}
module.exports = {
  getTicketsInfo (callback) {
    let httreq = http.request(options, (res) => {
        res.setEncoding('utf-8')
        var datalist = ''
        res.on('data', (chunk) => {
          datalist += chunk
        })
        res.on('end', () => {
          let res = JSON.parse(datalist)
          let list = res.data.list
          let ticketList = list.filter(item => {
              if (item.departDepartTime > '13:30') {
                return item
              }
          })
          let newList = []
          ticketList.forEach(item => {
              let obj = {}
              let pricelist = item.prices
              let yinzou = pricelist.find(item => {
                return item.seatName === '硬卧'
              })
              if (yinzou.leftNumber !== 0) {
                obj.seatStatus = yinzou.seatStatus // 是否有票
                obj.leftNumber = yinzou.leftNumber // 余票
                obj.sellOut = item.sellOut // 是否售罄 0 没有
                obj.trainNum = item.trainNum // 车次
                obj.trainTypeName = item.trainTypeName // 车子的类型
                obj.departStationName = item.departStationName // 出发城市车站名
                obj.destStationName = item.destStationName // 到达车站名
                obj.departDepartTime = item.departDepartTime // 出发时间
                obj.destArriveTime = item.destArriveTime // 到达时间
                obj.durationStr = item.durationStr // 历时多长时间
                obj.detail = yinzou.detail
                newList.push(obj)
              }
          })
          if (newList.length > 0) callback(newList)
        })
    })
    httreq.on('error', err => {
      callback('错误提示:' + err.message)
    })
    httreq.end()
  },
  getShowText(ticketLists) {
    let html = ''
    if (ticketLists.length === 0) return html
    ticketLists.forEach(item => {
        html += `车次:${item.trainNum}<br/>
        车型:${item.trainTypeName}<br/>
        出发城市:${item.departStationName}-${item.destStationName}<br/>
        出发时间:${item.departDepartTime}-${item.destArriveTime}<br/>
        历时:${item.durationStr}<br/>
        是否有票: ${item.seatStatus ? '有票' : '无票'}<br/>
        余票: ${item.leftNumber}<br/>
        是否售罄: ${item.sellOut ? '没有售罄' : '已售罄'}
        <p>票的类型:</p>`
        item.detail.forEach(subitem => {
            html += `<p>
                票类型: ${subitem.seatName}
                票价: ${subitem.price}
            </p>`
        })
        html += `<p>-------------------------------</p>`
    })
    return html
  }
}


