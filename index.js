var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

let numberOfPlayers = 0;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

io.on('connection', function(socket){
  socket.on('dropCircle', function(segment){
    io.emit('dropCircle', segment);
  });
  socket.on('newPlayer', function(segment){
    numberOfPlayers++;
    io.emit('newPlayer', numberOfPlayers);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
