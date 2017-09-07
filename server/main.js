import { Meteor } from 'meteor/meteor';
import http from 'http';
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
    socket.on('isMobile', (isMobile) => {
      console.log('socket is mobile id: ' + socket.id)
      let index = socketsMobile.indexOf(socket.id)
      if (index === -1) {
        socket.isMobile = isMobile
        socketsMobile.push(socket.id)
        console.log('socket is mobile: ' + socket.isMobile)
        console.log('sockets mobile count: ' + socketsMobile.length)
      }

    })
    socket.on('webcalllink', (mgs) => {
      io.to(socketsMobile[0]).emit('webcalllink', mgs)
    })
  });


  // // Start server
  try {
    server.listen(PORT);
  } catch (e) {
    console.error(e);
  }

});
