import { Meteor } from 'meteor/meteor';
import http from 'http';
// import socket_io from 'socket.io';
const PORT = 5547;
Meteor.startup(() => {

  // code to run on server at startup
  var require = Npm.require;
  var socket_io = require('socket.io')
  // var socketIO = sio.listen(this.http)
  // socketIO.sockets.on('connection', function (client) {
  //   console.log(client.id + ' is connected')
  //   client.on('disconnect', function () {
  //       console.log(client.id + ' is diconnected')
  //   })
  // })
   const server = http.createServer();
   const io = socket_io(server);
   let counter = 0;
  // // New client
   io.on('connection', function(socket) {
     console.log(socket.id + ' is connected')
     socket.on('disconnect', function () {
            console.log(socket.id + ' is diconnected')
        })
    socket.on('sendLink',(ob)=>{
      io.emit('sendLink',ob)
      console.log(JSON.stringify(ob))
    })
   });
  

  // // Start server
   try {
     server.listen(PORT);
   } catch (e) {
     console.error(e);
   }

});
