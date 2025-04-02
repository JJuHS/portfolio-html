const levels = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 30, cols: 30, mines: 99 }
};

let board = [];
let mineCount = 0;
let timer = 0;
let interval;
let isTimerStarted = false;

// 게임 시작하기기
function initGame(level = 'beginner') {
    const config = levels[level];
    mineCount = config.mines;
    document.getElementById('mine-count').innerText = `Mines: ${mineCount}`;
    createBoard(config.rows, config.cols, config.mines);
}

// 보드판 만들기
function createBoard(rows, cols, mines) {
    mineCount = mines
    board = [];
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i][j] = {
                mine: false,
                revealed: false,
                flagged: false,
                adjacentMines: 0
            };
        }
    }

    let minesPlaced = 0;
    while (minesPlaced < mines) {
        let row = Math.floor(Math.random() * rows);
        let col = Math.floor(Math.random() * cols);
        if (!board[row][col].mine) {
            board[row][col].mine = true;
            minesPlaced++;
        }
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j].mine) {
                for (let k = Math.max(0, i-1); k <= Math.min(i+1, rows-1); k++) {
                    for (let l = Math.max(0, j-1); l <= Math.min(j+1, cols-1); l++) {
                        if (!(k === i && l === j)) {
                            board[k][l].adjacentMines++;
                        }
                    }
                }
            }
        }
    }

    renderBoard(rows, cols);
}
// 지뢰 설정하기
function renderBoard(rows, cols) {
    const boardElement = document.getElementById('board');
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`; 
    boardElement.innerHTML = ''; 

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cellElement = document.createElement('div');
            cellElement.id = `cell-${i}-${j}`;
            cellElement.classList.add('cell');
            cellElement.onclick = () => openCell(i, j);
            cellElement.oncontextmenu = (e) => {
                e.preventDefault();
                flagCell(i, j);
            };

            boardElement.appendChild(cellElement);
        }
    }
}

// 우클릭 -> 깃발
function flagCell(row, col) {
    const cell = board[row][col];
    if (cell.revealed) {
        return; 
    }
    if (!isTimerStarted) {
        startTimer();
        isTimerStarted = true;
    }
    cell.flagged = !cell.flagged; 
    const cellElement = document.querySelector(`#cell-${row}-${col}`);
    cellElement.innerHTML = cell.flagged ? '🚩' : '';
    updateMineCount(cell.flagged ? -1 : 1); 
    checkWinCondition();
}

// 좌클릭 -> 셀 열기
function openCell(row, col) {
    const cell = board[row][col];
    if (cell.revealed || cell.flagged) {
        return;
    }
    if (!isTimerStarted) {
        startTimer();
        isTimerStarted = true;
    }
    cell.revealed = true;
    const cellElement = document.querySelector(`#cell-${row}-${col}`);
    if (cell.mine) {
        cellElement.innerHTML = '💣';
        cellElement.style.backgroundColor = 'red';
        gameOver(false); 
    } else {
        cellElement.innerHTML = cell.adjacentMines > 0 ? cell.adjacentMines : '';
        cellElement.style.backgroundColor = 'lightgray';
        if (cell.adjacentMines === 0) {
            for (let i = Math.max(0, row-1); i <= Math.min(row+1, board.length-1); i++) {
                for (let j = Math.max(0, col-1); j <= Math.min(col+1, board[0].length-1); j++) {
                    openCell(i, j);
                }
            }
        }
    }
    checkWinCondition();
}

// 해치웠나?
function checkWinCondition() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!board[i][j].mine && !board[i][j].revealed) {
                return; 
            }
        }
    }
    gameOver(true);
    disableAllCells();
}

function updateMineCount(change) {
    mineCount = mineCount + Number(change);
    document.getElementById('mine-count').innerText = `Mines: ${mineCount}`;
}

// 게임 종료(승리 패배 모두)
function gameOver(isClear) {
    if (isClear) {
        window.alert('축하합니다. 승리하셨습니다.\nCongratulation. You win')
    } else {
        window.alert('패배하였습니다.\nYou lose.')

    }
    revealAllMines();
    disableAllCells();
}

// 셀 비활성화
function disableAllCells() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.onclick = null; 
        cell.oncontextmenu = null; 
    });
}

// 셀 활성화화
function enableAllCells() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        let row = Math.floor(index / cols); 
        let col = index % cols;
        cell.onclick = () => openCell(row, col);
        cell.oncontextmenu = (e) => {
            e.preventDefault();
            flagCell(row, col);
        };
    });
}

// 셀 좌좌클릭 이벤트
function handleCellClick(e) {
    const cellId = e.target.id.split('-');
    openCell(parseInt(cellId[1]), parseInt(cellId[2]));
}

// 셀 우클릭 이벤트
function handleCellRightClick(e) {
    e.preventDefault();
    const cellId = e.target.id.split('-');
    flagCell(parseInt(cellId[1]), parseInt(cellId[2]));
}

// 모든 지뢰 표시
function revealAllMines() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const cell = board[i][j];
            const cellElement = document.querySelector(`#cell-${i}-${j}`);
            if (cell.mine) {
                cellElement.innerHTML = '💣';
                cellElement.style.backgroundColor = 'red';
            }
        }
    }
}

// 사용자 지정 게임 시작
function startCustomGame() {
    const rows = document.getElementById('rows').value || 9; 
    const cols = document.getElementById('cols').value || 9; 
    const mines = Number(document.getElementById('mines').value || Math.floor((rows * cols) / 6)); 

    if (mines > rows * cols) {
        alert("마인의 최대치를 초과하였습니다. \n Mines exceed the number of cells!");
        window.location.reload()
        return
    }
    
    document.getElementById('mine-count').innerText = `Mines: ${mines}`; 
    createBoard(rows, cols, mines);
}

// 타이머
function startTimer() {
    clearInterval(interval);
    timer = 0;
    interval = setInterval(() => {
        timer++;
        document.getElementById('timer').innerText = `Time: ${timer}s`;
    }, 1000);
}

// 게임 재시작
function resetGame() {
    clearInterval(interval);
    document.getElementById('timer').innerText = `Time: 0s`;
    isTimerStarted = false;
    initGame();
}

document.addEventListener('DOMContentLoaded', () => {
    initGame('beginner'); 
});
