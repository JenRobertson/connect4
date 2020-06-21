var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

const connect4 = require("./connect4");

app.get('/', function(req, res){
  res.send('Connect 4 server')
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

app.use(express.static('public'));

updateStore(connect4.newGame());

io.on('connection', function(socket){ // someones connected
  io.emit('assignId', socket.id); // tell front end which id they are

  updateStore(connect4.getStore());

  socket.on('newPlayer', function(name){
    updateStore(connect4.onNewPlayer(socket.id, name)); // add new id to the STORE
  });

  socket.on('hoverSegmentChange', function(segment){
    updateStore(connect4.onHoverSegmentChange(segment));
  });

  socket.on('canvasClick', function(cursorX){
    updateStore(connect4.onCanvasClick(cursorX));
  });

  socket.on('restartClick', function(){
    updateStore(connect4.onRestartClick());
  });

  socket.on('resetClick', function(){
    updateStore(connect4.onResetClick());
  });

  socket.on('disconnect', function () {
    updateStore(connect4.onRemovePlayer(socket.id)); // remove disconneted id from STORE
  });
});

function updateStore(STORE) {
  io.emit('updateStore', STORE);
}

