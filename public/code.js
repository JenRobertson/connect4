
window.addEventListener('load', (event) => {
  var socket = io();
  
  socket.emit('newPlayer', 1);
  socket.on('newPlayer', function(numberOfPlayers){
    alert(numberOfPlayers)
  });
  
  const canvas = document.querySelector('canvas');
  const winsDiv = document.querySelector('#wins-div');
  const winsSpan = document.querySelector('#wins-span');
  const restartSpan = document.querySelector('#restart-button');
  const ctx = canvas.getContext('2d');
  let currentGo = 'y';
  let endScreen = false;
  
  const numOfCirclesX = 6;
  const numOfCirclesY = 7;
  const circleWidth = 30;
  const circlePadding = 10;
  const circleXStart = 75;
  const circleYStart = 75;
  
  let squares;
  initBoard();
  
  function initBoard() {
    squares = [new Array(numOfCirclesX), new Array(numOfCirclesX), new Array(numOfCirclesX), new Array(numOfCirclesX), new    Array(numOfCirclesX), new Array(numOfCirclesX)];
  }
  
  
  function win(winner) {
    const colour = winner === 'r' ? 'Red' : 'Yellow';
    winsDiv.style.display = "block";
    winsDiv.style.backgroundColor = colour;
    winsSpan.innerHTML = `${colour} is the winner!!`;
    endScreen = true;
  }
  
  function detect4() {
    function check(x, y){
      if(!squares[x] || !squares[x][y]) return false;
      if(squares[x][y] === currentGo) return true;
      return false;
    }
    for (var y = 0; y < squares.length; y++) {
      for (var x = 0; x < squares[0].length; x++) {
        const horizontal = check(x, y) && check(x, y + 1) && check(x, y + 2) && check(x, y + 3);
        const vertical = check(x, y) && check(x + 1, y) && check(x + 2, y) && check(x + 3, y);
        const horizontalL = check(x, y) && check(x + 1, y + 1) && check(x + 2, y + 2) && check(x + 3, y + 3);
        const horizontalR = check(x, y) && check(x + 1, y - 1) && check(x + 2, y - 2) && check(x + 3, y - 3);
        if (horizontal || vertical || horizontalL || horizontalR) win(currentGo);
      }
    }
  }
  
  function getSegement(clientX) {
    const startX = circleXStart - circleWidth;
    const widthOfSegment = circleWidth * 2 + (circlePadding);
    for (var x = 0; x < squares.length; x++) {
      const withinSegment = clientX > startX + (widthOfSegment * x) && clientX < startX + (widthOfSegment * (x + 1) );
      if (withinSegment) {
        return x; 
      }
    }
  }
  
  function dropCircle(x) {
    let y = 5;
    while(squares[y][x] && y > 0){
      y--;
    }
    squares[y][x] = currentGo;
    drawBoard();
    detect4();
    currentGo === 'y' ? currentGo = 'r' :  currentGo = 'y';
  }
  
  canvas.onclick = (e) => {
    if(endScreen) return;
    const segment = getSegement(e.clientX);
    if (segment !== null) {
      
      socket.emit('dropCircle', segment);
    }
    drawHoverCircle(segment);
  }
  
  socket.on('dropCircle', function(segment){
    dropCircle(segment);
  });
  
  canvas.onmousemove = (e) => {
    if(endScreen) return;
    const segment = getSegement(e.clientX);
    if (segment === undefined || squares[0][segment]) {
      ctx.clearRect(0, 0, 1000, 1000);
      drawBoard();
      canvas.style.cursor = 'auto';
      return;
    }
    drawHoverCircle(segment);
    canvas.style.cursor = 'pointer';
  }
  
  function drawHoverCircle (segment) {
    const widthOfSegment = circleWidth * 2 + (circlePadding);
    ctx.clearRect(0, 0, 1000, 1000);
    drawBoard();
    drawCircle(30, (segment * widthOfSegment) + circleXStart, currentGo);
  }
  
  drawBoard();
  
  function drawCircle(circleX, circleY, colour) {
    if(!colour) ctx.fillStyle = "#FFFFFF";
    if(colour === 'y') ctx.fillStyle = "#fcba03";
    if(colour === 'r') ctx.fillStyle = "#fc3503";
    
    ctx.beginPath();
    ctx.arc(circleY, circleX, circleWidth, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  function drawBoard() {
    ctx.fillStyle = 'black';
    ctx.fillRect(20, 20, 450, 450);
    let circleX = 75;
    let circleY = 75
    for (var y = 0; y < squares.length; y++) {
      for (var x = 0; x < squares[0].length; x++) {
        
        drawCircle(circleX, circleY, squares[x][y]);
        circleX += circlePadding + (circleWidth * 2);
        
        if(x === 5) {
          circleY += circlePadding + (circleWidth * 2);
          circleX = circleXStart;
        }
        
      }
    }
  }
  
  restartSpan.onclick = function() {
    endScreen = false;
    winsDiv.style.display = "none";
    initBoard();
    drawBoard();
  }
});




