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

    const images = {
        nest_bottom: document.getElementById('nest_bottom'),
        nest_front: document.getElementById('nest_front'),
        grass: document.getElementById('grass'),
        chicken_orange: document.getElementById('chicken_orange'),
        chicken_black: document.getElementById('chicken_black')
    }
    
    const ctx = canvas.getContext('2d');
    
    const circleWidth = 136;
    const circlePadding = 0;
    const circleXStart = 10;
    
    let id, myPlayerDetails, currentGo, localSTORE;
    
    canvas.onclick = (e) => {
        if (localSTORE.winScreen) return;
        if (myPlayerDetails && myPlayerDetails.colour === currentGo) {
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
    
    onboardingButton.onclick = () => {
        socket.emit('newPlayer', onboardingInput.value);
        onboardingDiv.style.display = 'none';
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
        localSTORE = STORE;
        currentGo = STORE.currentGo;
        displayCurrentGo();
        fillIdsDiv(STORE.players);
        if (STORE.winScreen) {
            const colour = STORE.currentGo === 'r' ? 'Red' : 'Yellow';
            winsDiv.style.display = "block";
            winsDiv.style.backgroundColor = colour;
            winsSpan.innerHTML = `${colour} is the winner!!`;
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

    function drawCircle(circleX, circleY, colour, withNest = true) {
        withNest ? ctx.drawImage(images.nest_bottom, circleY, circleX) : '';
        if (colour === 'y'){
            ctx.drawImage(images.chicken_orange, circleY + 8, circleX);
        } 
        
        if (colour === 'r'){
            ctx.drawImage(images.chicken_black, circleY + 8, circleX);
        } 
        withNest ? ctx.drawImage(images.nest_front, circleY, circleX + 50) : '';
        
    }
});
