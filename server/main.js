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

  const server = http.createServer();
  const io = socket_io(server);
  let counter = 0;
  // // New client
  io.on('connection', async function (socket) {
    console.log(socket.id + ' is connected')

    socket.on('disconnect', function () {
      if (socket.isMobile) {
        let index = socketsMobile.indexOf(socket.id)
        if (index > -1) {
          socketsMobile.splice(index, 1);
        }
        console.log('sockets mobile count: ' + socketsMobile.length)
      }
      console.log(socket.id + ' is diconnected')

    })
    socket.on('sendLink', (ob) => {
      io.emit('sendLink', ob)
    })
    socket.on('isMobile', (deviceId) => {
      console.log('socket is mobile id: ' + socket.id)
      let obMobile = findObjectByKey(socketsMobile, 'deviceId', deviceId)
      console.log(obMobile)
      if (obMobile != undefined) {
        let index = socketsMobile.indexOf(obMobile)
        socketsMobile.splice(index, 1)
      }
      socket.isMobile = true
      let socketOb = {
        deviceId: deviceId,
        socketId: socket.id
      }
      socketsMobile.push(socketOb)
      console.log('socket is mobile: ' + socket.isMobile)
      console.log('sockets mobile count: ' + socketsMobile.length)
    })
    socket.on('webcalllink', async (mgs) => {
      if (socketsMobile.length != 0) {
        let index = getRandomIntInclusive(0, socketsMobile.length - 1)
        console.log(index)
        io.to(socketsMobile[index].socketId).emit('webcalllink', mgs)
      }
      else {
        console.log('Khoong co device')
      }
    })
    socket.on('gettotalfilm', async (key,pageIndex) => {
      let total = 0
      try {
        // let isW = true
        // while (isW) {
          let lst = await getListMovies(key, pageIndex, '')
          // console.log(lst.length)
          // if (lst.length === 0) {
          //   isW = false
          // }
          for (var i = 0; i < lst.length; i++) {
            var l = lst[i];
            await updateFilm(l.url)
          }
          total += lst.length
          pageIndex++
          socket.emit('server-send-total', total,pageIndex)
        // }
      } catch (error) {
        console.log(error)
      }
    })
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
  let detail = await getDetalFilm(uri)
  console.log('updatefilm')
  //socket.emit('server-send-detail',detail)
  Meteor.call('films.insert', detail)
  Meteor.call('director.insert', detail.director)
  Meteor.call('country.insert', detail.country)
  Meteor.call('category.insert', detail.cats)
  Meteor.call('episodes.insert', detail.servers, detail.tag)
}