let STORE;
const blankStore = {
    board: getBlankBoard(),
    hoverSegment: null,
    currentGo: null,
    winScreen: false,
    players: []
}
resetStore();

function newGame() {
    resetStore();
    return STORE;
}

function onNewPlayer (socketId, chickenId) {
    STORE.players.push({chickenId, socketId});
    if (STORE.players.length === 1) STORE.currentGo = STORE.players[0];
    return STORE;
}

function onRemovePlayer(socketId){
    STORE.players.forEach((player, index) => {
        if (player.socketId === socketId) {
           STORE.players.splice(index, 1);
        }
    });
    return STORE;
}

function getBlankBoard() {
    const numOfCirclesY = 7;
    //const numOfCirclesX = 6;
    return [new Array(numOfCirclesY),new Array(numOfCirclesY),new Array(numOfCirclesY),new Array(numOfCirclesY), new Array(numOfCirclesY),new Array(numOfCirclesY)];
}

function onCanvasClick(segment) {
    if (STORE.winScreen) return;
    STORE.hoverSegment = null;
    if (segment !== null) {
        dropCircle(segment)
        return STORE;
    }
}

function onHoverSegmentChange(segment) {
    STORE.hoverSegment = segment;
    return STORE;
}

function onRestartClick() {
    resetStore();
    return STORE;
}

function onResetClick() {
    resetStore();
    return STORE;
}

function resetStore() {
    STORE = JSON.parse(JSON.stringify(blankStore));
}

function dropCircle(x) {
    let y = 5;
    while(STORE.board[y][x] && y > 0){
        y--;
    }
    STORE.board[y][x] = STORE.currentGo;
    if(detect4()) {
        win()
    } else {
        STORE.currentGo === STORE.players[0] ? STORE.currentGo = STORE.players[1] : STORE.currentGo = STORE.players[0];
    }
}

function detect4() {
    function check(x, y){
        if(!STORE.board[x] || !STORE.board[x][y]) return false;
        if(STORE.board[x][y] === STORE.currentGo) return true;
        return false;
    }
    for (var y = 0; y < STORE.board.length; y++) {
        for (var x = 0; x < STORE.board[0].length; x++) {
            const horizontal = check(x, y) && check(x, y + 1) && check(x, y + 2) && check(x, y + 3);
            const vertical = check(x, y) && check(x + 1, y) && check(x + 2, y) && check(x + 3, y);
            const horizontalL = check(x, y) && check(x + 1, y + 1) && check(x + 2, y + 2) && check(x + 3, y + 3);
            const horizontalR = check(x, y) && check(x + 1, y - 1) && check(x + 2, y - 2) && check(x + 3, y - 3);
            if (horizontal || vertical || horizontalL || horizontalR) return true;
        }
    }
}

function win() {
    STORE.winScreen = true;
}
  
function getStore() {
    return STORE;
}
module.exports = { onCanvasClick, onHoverSegmentChange, onRestartClick, onResetClick, onNewPlayer, onRemovePlayer, newGame, getStore };