const server = require("./index");
const circleXStart = 75;
const circleWidth = 30;
const circlePadding = 10;

let STORE;
const blankStore = {
    board: getBlankBoard(),
    currentGo: 'r',
    winScreen: false
}
resetStore();

function newGame() {
    STORE = {
        board: getBlankBoard(),
        currentGo: 'r',
        winScreen: false
    } 
    return STORE;
}


function getBlankBoard() {
    const numOfCirclesX = 6;
    return [new Array(numOfCirclesX), new Array(numOfCirclesX), new Array(numOfCirclesX), new Array(numOfCirclesX), new    Array(numOfCirclesX), new Array(numOfCirclesX)];
}

function onCanvasClick(cursorX) {
    if (STORE.winScreen) return;
    const segment = getSegement(cursorX);
    if (segment !== null) {
        dropCircle(segment)
        return STORE;
    }
    // drawHoverCircle(segment);
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
        STORE.currentGo === 'y' ? STORE.currentGo = 'r' :  STORE.currentGo = 'y';
    }
}

function getSegement(clientX) {
    const startX = circleXStart - circleWidth;
    const widthOfSegment = circleWidth * 2 + (circlePadding);
    for (var x = 0; x < STORE.board.length; x++) {
        const withinSegment = clientX > startX + (widthOfSegment * x) && clientX < startX + (widthOfSegment * (x + 1) );
        if (withinSegment) {
            return x; 
        }
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
module.exports = { onCanvasClick, onRestartClick, onResetClick, newGame, getStore };