window.addEventListener('load', (event) => {
    var socket = io();
    const canvas = document.querySelector('canvas');
    const winsDiv = document.querySelector('#wins-div');
    const winsSpan = document.querySelector('#wins-span');
    const restartButton = document.querySelector('#restart-button');
    const resetButton = document.querySelector('#reset-button');
    const ctx = canvas.getContext('2d');

    const circleWidth = 30;
    const circlePadding = 10;
    const circleXStart = 75;
    
    canvas.onclick = (e) => {
        socket.emit('canvasClick', e.clientX);
    }

    restartButton.onclick = (e) => {
        socket.emit('restartClick');
    }

    resetButton.onclick = (e) => {
        socket.emit('resetClick');
    }
    
    socket.on('updateStore', function(STORE){
        drawBoard(STORE.board);
        if (STORE.winScreen) {
            const colour = STORE.currentGo === 'r' ? 'Red' : 'Yellow';
            winsDiv.style.display = "block";
            winsDiv.style.backgroundColor = colour;
            winsSpan.innerHTML = `${colour} is the winner!!`;
        } else {
            winsDiv.style.display = "none";
        }
    });
    
    function drawBoard(board) {
        ctx.fillStyle = 'black';
        ctx.fillRect(20, 20, 450, 450);
        let circleX = 75;
        let circleY = 75
        for (var y = 0; y < board.length; y++) {
            for (var x = 0; x < board[0].length; x++) {
                
                drawCircle(circleX, circleY, board[x][y]);
                circleX += circlePadding + (circleWidth * 2);
                
                if(x === 5) {
                    circleY += circlePadding + (circleWidth * 2);
                    circleX = circleXStart;
                }
                
            }
        }
    }

    function drawCircle(circleX, circleY, colour) {
        if(!colour) ctx.fillStyle = "#FFFFFF";
        if(colour === 'y') ctx.fillStyle = "#fcba03";
        if(colour === 'r') ctx.fillStyle = "#fc3503";
        
        ctx.beginPath();
        ctx.arc(circleY, circleX, circleWidth, 0, 2 * Math.PI);
        ctx.fill();
      }
});
