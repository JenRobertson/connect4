var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

const connect4 = require("./connect4");

let numberOfPlayers = 0;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

app.use(express.static('public'));

updateStore(connect4.newGame());

io.on('connection', function(socket){ // somones connected
  updateStore(connect4.getStore());

  socket.on('canvasClick', function(cursorX){
    updateStore(connect4.onCanvasClick(cursorX));
  });

  socket.on('restartClick', function(){
    updateStore(connect4.onRestartClick());
  });

  socket.on('newPlayer', function(segment){
    numberOfPlayers++;
    io.emit('newPlayer', numberOfPlayers);
  });
});

function updateStore(STORE) {
  io.emit('updateStore', STORE);
}

