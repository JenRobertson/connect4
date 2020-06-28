let id, currentGo, localSTORE;
let myPlayerDetails = {};
window.addEventListener('load', (event) => {
    const socket = io('http://localhost:3000');
    // const socket = io('https://waving-walrus-connect4.herokuapp.com');
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

    const chickenButtons = document.querySelectorAll('.chicken-button');
    chickenButtons.forEach((chickenButton, index) => {
        chickenButton.onclick = () => {
            myPlayerDetails.chickenId = index + 1;
            socket.emit('newPlayer', myPlayerDetails.chickenId);
            onboardingDiv.style.display = 'none';
        };
    });

    const images = {
        nest_bottom: document.getElementById('nest_bottom'),
        nest_front: document.getElementById('nest_front'),
        grass: document.getElementById('grass'),
        chickens: []
    }
    
    for (let i = 1; i < 11; i++) {
        images.chickens.push(document.getElementById(`chicken_${i}`));
    }

    const ctx = canvas.getContext('2d');
    
    const circleWidth = 136;
    const circlePadding = 0;
    const circleXStart = 10;
    
    
    canvas.onclick = (e) => {
        if (localSTORE.winScreen) return;
        console.log(localSTORE)
        if (myPlayerDetails && myPlayerDetails.chickenId === localSTORE.currentGo.chickenId) {
            const segment = getSegment(e.clientX);
            if (segment !== undefined) {
                socket.emit('canvasClick', segment);
            }
        }
    }
    
    restartButton.onclick = (e) => {
        socket.emit('restartClick');
    }
    
    resetButton.onclick = (e) => {
        socket.emit('resetClick');
    }
    
    canvas.onmousemove = (e) => {
        if (!myPlayerDetails || myPlayerDetails.colour !== currentGo || localSTORE.winScreen) { // not my go
            removeHoverCircle();
            return;
        };
        const segment = getSegment(e.clientX);
        if (localSTORE.hoverSegment !== segment) { // if hover segment changed, send to server
            socket.emit('hoverSegmentChange', segment);
        }
    }
    
    function addOrRemoveHoverSegment() {
        if (localSTORE.hoverSegment === undefined || localSTORE.hoverSegment === null || localSTORE.board[0][localSTORE.hoverSegment]) {
            removeHoverCircle();
            return;
        }
        drawHoverCircle(localSTORE.hoverSegment, currentGo);
    }
    
    function getSegment(clientX) {
        const startX = circleXStart;
        const widthOfSegment = circleWidth + circlePadding;
        for (var x = 0; x < localSTORE.board[0].length; x++) {
            const withinSegment = clientX > startX + (widthOfSegment * x) && clientX < startX + (widthOfSegment * (x + 1) );
            if (withinSegment) {
                return x; 
            }
        }
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
        players.forEach((player, index) => {
            
            if (player.socketId === id){
                myPlayerDetails = player;
                html+=`<span><img src="img/chicken_${player.chickenId}.png"> (You)</span>`;
            } else {
                html+=`<span><img src="img/chicken_${player.chickenId}.png"></span>`;
            }
            if (index === 0){
                html += `<span id="current-go">${currentGo.chickenId === player.chickenId ? '<' : '>'}</span>`;
            } 
        });
        idsDiv.innerHTML = html;
    }
    
    socket.on('updateStore', function(STORE){
        localSTORE = STORE;
        currentGo = STORE.currentGo;
        fillIdsDiv(STORE.players);
        if (STORE.winScreen) {
            winsDiv.style.display = "block";
            winsSpan.innerHTML = `
            <img style="width: 225px" src="img/chicken_${currentGo.chickenId}.png">
            <br>
             is the winner!`;
        } else {
            winsDiv.style.display = "none";
        }
        drawBoard(STORE.board);
        addOrRemoveHoverSegment();        
    });
    
    function drawHoverCircle (segment, currentGo) {
        const widthOfSegment = circleWidth + circlePadding;
        ctx.clearRect(0, 0, 1000, 1000);
        drawBoard(localSTORE.board);
        drawCircle(30, (segment * widthOfSegment) + circleXStart, currentGo, false);
        canvas.style.cursor = 'pointer';
    }
    
    function removeHoverCircle () {
        ctx.clearRect(0, 0, 1000, 1000);
        if (localSTORE) drawBoard(localSTORE.board);
        canvas.style.cursor = 'auto';
    }
    
    function drawBoard(board) {
        const numOfCirclesX = 6;
        ctx.drawImage(images.grass, 0, 0);
        const circleHeight = 112;
        let circleX = circleXStart;
        let circleY = circleXStart;
        for (var y = 0; y < board[0].length; y++) {
            for (var x = 0; x < board.length; x++) {
                
                drawCircle(circleX, circleY, board[x][y]);
                circleX += circlePadding + circleHeight;
                if(x === numOfCirclesX - 1) {
                    circleY += circlePadding + (circleWidth);
                    circleX = circleXStart;
                }
                
            }
        }
    }

    function drawCircle(circleX, circleY, player, withNest = true) {
        withNest ? ctx.drawImage(images.nest_bottom, circleY, circleX) : '';
        if (player) ctx.drawImage(images.chickens[player.chickenId - 1], circleY + 8, circleX);
        withNest ? ctx.drawImage(images.nest_front, circleY, circleX + 50) : '';
        
    }
});
