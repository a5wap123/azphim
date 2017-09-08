import { Meteor } from 'meteor/meteor';
import http from 'http';
import {findObjectByKey,getRandomIntInclusive} from '../ultis/ulti'
// import socket_io from 'socket.io';
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
  io.on('connection', function (socket) {
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
      let obMobile = findObjectByKey(socketsMobile,'deviceId',deviceId)
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
    socket.on('webcalllink', (mgs) => {
      if(socketsMobile.length != 0){
        let index = getRandomIntInclusive(0,socketsMobile.length - 1)
        console.log(index)
        io.to(socketsMobile[index].socketId).emit('webcalllink', mgs)
      }
      else{
        alert('Khoong co device')
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
