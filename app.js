var nodemailer = require('nodemailer')
var schedule = require('node-schedule')
var app = require('./getTicket')
var transporter = nodemailer.createTransport({
    host: "smtp.163.com",
    secureConnection: true,
    port: 465,
    secure: true,
    auth: {
        user: 'frontwebvueapp@163.com',
        pass: 'YYYhu0329'
    }
})
var mailoptions = {
    from: 'frontwebvueapp@163.com',
    to: 'frontendwebapp@163.com',
    subject: '有票提醒',
    html: ""
}
let rule = new schedule.RecurrenceRule()
let minute = [1, 16, 31, 46]
rule.second = minute
schedule.scheduleJob(rule, function(){
  app.getTicketsInfo(ticketList => {
    if (typeof ticketList === 'string') {
        mailoptions.subject = '错误提醒'
        mailoptions.html = ticketList
    } else {
        let info = app.getShowText(ticketList)
        if (!info) return
        mailoptions.html = info
    }
    transporter.sendMail(mailoptions, function (err, info) {
      if (err) {
          console.log('邮件发送失败')
      } else {
          console.log('邮件发送成功')
      }
    })
  })
});
