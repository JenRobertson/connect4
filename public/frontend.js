window.addEventListener('load', (event) => {
    var socket = io();
    const canvas = document.querySelector('canvas');
    const winsDiv = document.querySelector('#wins-div');
    const winsSpan = document.querySelector('#wins-span');
    const restartButton = document.querySelector('#restart-button');
    const resetButton = document.querySelector('#reset-button');
    const idsDiv = document.querySelector('#ids-div');
    const currentGoSpan = document.querySelector('#currentgo-span');

    const onboardingDiv = document.querySelector('#onboarding-div');
    const onboardingInput = document.querySelector('#onboarding-div__input');
    const onboardingButton = document.querySelector('#onboarding-div__button');

    const ctx = canvas.getContext('2d');

    const circleWidth = 30;
    const circlePadding = 10;
    const circleXStart = 75;

    let id, myPlayerDetails, currentGo;
    
    canvas.onclick = (e) => {
        if (myPlayerDetails && myPlayerDetails.colour === currentGo) {
            socket.emit('canvasClick', e.clientX);
        }
    }

    restartButton.onclick = (e) => {
        socket.emit('restartClick');
    }

    resetButton.onclick = (e) => {
        socket.emit('resetClick');
    }

    onboardingButton.onclick = () => {
        socket.emit('newPlayer', onboardingInput.value);
        onboardingDiv.style.display = 'none';
    }
    
    socket.on('assignId', function(newId) {
        if(!id) id=newId;
    });

    const colourMap = {
        r: 'red',
        y: 'yellow',
        audience: 'null'
    }
    
    function fillIdsDiv(players) {
        let html = '';
        players.forEach(player => {
    
            if (player.socketId === id){
                myPlayerDetails = player;
                html+=`<span style="background-color: ${colourMap[player.colour]}">${player.name} (You)</span><br>`;
            } else {
                html+=`<span style="background-color: ${colourMap[player.colour]}">${player.name}</span><br>`;
            }
        });
        idsDiv.innerHTML = html;
    }

    function displayCurrentGo(){
        currentGoSpan.innerHTML = `It's ${colourMap[currentGo]}'s go`;
    }
    
    socket.on('updateStore', function(STORE){
        currentGo = STORE.currentGo;
        displayCurrentGo();
        fillIdsDiv(STORE.players);
        
        if (STORE.hoverSegment) {
            drawHoverCircle(STORE.hoverSegment, STORE.currentGo)
        }
        if (STORE.winScreen) {
            const colour = STORE.currentGo === 'r' ? 'Red' : 'Yellow';
            winsDiv.style.display = "block";
            winsDiv.style.backgroundColor = colour;
            winsSpan.innerHTML = `${colour} is the winner!!`;
        } else {
            winsDiv.style.display = "none";
        }
        drawBoard(STORE.board);
    });

    function drawHoverCircle (segment, currentGo) {
        const widthOfSegment = circleWidth * 2 + (circlePadding);
        ctx.clearRect(0, 0, 1000, 1000);
        // drawBoard(STORE.board);
        drawCircle(30, (segment * widthOfSegment) + circleXStart, currentGo);
    }
    
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
