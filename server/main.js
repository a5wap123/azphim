import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import http from 'http';
import { findObjectByKey, getRandomIntInclusive } from '../ultis/ulti'
import '../imports/api/phimmoi.js';
import { Films } from '../imports/api/phimmoi';
import { getDetalFilm, getListMovies } from '../imports/api/crawler';
const PORT = 5547;
var socketsMobile = []
Meteor.startup(() => {

// code to run on server at startup
var require = Npm.require;
var socket_io = require('socket.io')
//Khởi tạo socket
const server = http.createServer();
const io = socket_io(server);
// // New client
io.on('connection', async function (socket) {
  console.log(socket.id + ' is connected')

  socket.on('disconnect', function () {
    //check xem nó có phải mobile không, đúng thì remove trong list socketsMobile
    if (socket.isMobile) {
      let index = socketsMobile.indexOf(socket.id)
      if (index > -1) {
        //remove theo index
        socketsMobile.splice(index, 1);
      }
      console.log('sockets mobile count: ' + socketsMobile.length)
    }
    console.log(socket.id + ' is diconnected')

  })

  //lắng nghe sự kiên sendlink từ client
  socket.on('sendLink', (ob) => {
    io.emit('sendLink', ob)
  })

  //Lắng nghe isMobile từ react native
  socket.on('isMobile', (deviceId) => {
    console.log('socket is mobile id: ' + socket.id)

    //Tìm kiếm xem trong socketsMobile đã có device dó chưa? theo deviceId
    let obMobile = findObjectByKey(socketsMobile, 'deviceId', deviceId)
    //Nếu có rồi thì remove nó đi
    if (obMobile != undefined) {
      let index = socketsMobile.indexOf(obMobile)
      socketsMobile.splice(index, 1)
    }
    //khai báo thêm biến isMobile và obj socketOb
    socket.isMobile = true
    let socketOb = {
      deviceId: deviceId,
      socketId: socket.id
    }
    //Add thêm vào array socketsMobile
    socketsMobile.push(socketOb)
    //Log ra giá tri
    console.log('socket is mobile: ' + socket.isMobile)
    console.log('sockets mobile count: ' + socketsMobile.length)
  })

  //Lắng nghe sự kiện web call link
  socket.on('webcalllink', async (mgs) => {
    //check xem arr socketsMobile > 0 
    if (socketsMobile.length != 0) {
      // Get random theo lenght của arr socketsMobile
      let index = getRandomIntInclusive(0, socketsMobile.length - 1)
      //gửi xuống cho client mobile theo socketId
      io.to(socketsMobile[index].socketId).emit('webcalllink', mgs)
    }
    else {
      console.log('Khoong co device')
    }
  })
  //Sự kiện từ gettotalFilm cửa web client
  socket.on('gettotalfilm', async (key,pageIndex,urlLaster) => {
    let total = 0
    try {
      //isW true cho while chạy mãi 
       let isW = true
       while (isW) {
         //getListMovies trong .import/api/crawler
        let lst = await getListMovies(key, pageIndex, '')
        // nếu lst lenght === 0 nghĩa là hết dữ liệu và isW = false cho dừng while
        if (lst.length === 0) {
          console.log('the end')
          isW = false
          return
        }
        //Tìm kiếm trong list xem url đứng thứ lấy
        let obj = findObjectByKey(lst,'url',urlLaster)
        let index = 0
        if(obj != undefined){
          index = lst.indexOf(obj)
        }
        //Chạy theo index
        for (var i = index + 1; i < lst.length; i++) {
          var l = lst[i];
          await updateFilm(l.url)
        }
        total += lst.length
        pageIndex++
        socket.emit('server-send-total', total,pageIndex)
       }
    } catch (error) {
      console.log(error)
    }
  })

  // sự kiện get detail 1 link phim
  socket.on('getLink', async (uri) => {
    try {
      updateFilm(uri)

    } catch (error) {
      console.log(error)
    }
  })

});


// // Start server
try {
  server.listen(PORT);
} catch (e) {
  console.error(e);
}

  

});

updateFilm = async (uri) => {
  //Get data detail trong ./import/api/crawler
  let detail = await getDetalFilm(uri)
  console.log('updatefilm')
  if(detail === undefined) return
  //call to .import/api/phimmoi để insert data
  Meteor.call('films.insert', detail)
  Meteor.call('director.insert', detail.director)
  Meteor.call('country.insert', detail.country)
  Meteor.call('category.insert', detail.cats)
  Meteor.call('episodes.insert', detail.servers, detail.tag)
}