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

function initGame(level = 'beginner') {
    const config = levels[level];
    mineCount = config.mines;
    document.getElementById('mine-count').innerText = `Mines: ${mineCount}`;
    createBoard(config.rows, config.cols, config.mines);
}

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

function openCell(row, col) {
    const cell = board[row][col];
    if (cell.revealed || cell.flagged) {
        return; // 이미 열려있거나 깃발이 표시된 셀은 열지 않음
    }
    if (!isTimerStarted) {
        startTimer();
        isTimerStarted = true;
    }
    cell.revealed = true; // 셀을 열음
    const cellElement = document.querySelector(`#cell-${row}-${col}`);
    if (cell.mine) {
        cellElement.innerHTML = '💣';
        cellElement.style.backgroundColor = 'red';
        gameOver("Game Over! You hit a mine."); // 게임 오버 로직
    } else {
        cellElement.innerHTML = cell.adjacentMines > 0 ? cell.adjacentMines : '';
        cellElement.style.backgroundColor = 'lightgray';
        if (cell.adjacentMines === 0) {
            for (let i = Math.max(0, row-1); i <= Math.min(row+1, board.length-1); i++) {
                for (let j = Math.max(0, col-1); j <= Math.min(col+1, board[0].length-1); j++) {
                    openCell(i, j);
                }
            }
            checkWinCondition();
        }
    }
}

function checkWinCondition() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!board[i][j].mine && !board[i][j].revealed) {
                return; // 아직 열지 않은 지뢰가 아닌 칸이 있음
            }
        }
    }
    gameOver("Congratulations! You've cleared all the mines!");
    disableAllCells();
}


function flagCell(row, col) {
    const cell = board[row][col];
    if (cell.revealed) {
        return; // 이미 열린 셀에는 깃발을 추가하지 않음
    }
    if (!isTimerStarted) {
        startTimer();
        isTimerStarted = true;
    }
    cell.flagged = !cell.flagged; // 깃발 상태 토글
    const cellElement = document.querySelector(`#cell-${row}-${col}`);
    cellElement.innerHTML = cell.flagged ? '🚩' : '';
    updateMineCount(cell.flagged ? -1 : 1); // 남은 지뢰 수 업데이트
}

function updateMineCount(change) {
    mineCount = mineCount + Number(change);
    document.getElementById('mine-count').innerText = `Mines: ${mineCount}`;
}

function gameOver(message) {
    alert(message);
    revealAllMines(); // 모든 지뢰 보여주기
    disableAllCells();
}

function disableAllCells() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.onclick = null; // 클릭 이벤트 리스너 제거
        cell.oncontextmenu = null; // 우클릭 이벤트 리스너 제거
    });
}

function enableAllCells() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        let row = Math.floor(index / cols); // 적절한 row 계산
        let col = index % cols; // 적절한 col 계산
        cell.onclick = () => openCell(row, col);
        cell.oncontextmenu = (e) => {
            e.preventDefault();
            flagCell(row, col);
        };
    });
}

function handleCellClick(e) {
    const cellId = e.target.id.split('-');
    openCell(parseInt(cellId[1]), parseInt(cellId[2]));
}

function handleCellRightClick(e) {
    e.preventDefault();
    const cellId = e.target.id.split('-');
    flagCell(parseInt(cellId[1]), parseInt(cellId[2]));
}

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

function renderBoard(rows, cols) {
    const boardElement = document.getElementById('board');
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`; // 동적으로 열 너비 설정
    boardElement.innerHTML = ''; 

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cellElement = document.createElement('div');
            cellElement.id = `cell-${i}-${j}`;
            cellElement.classList.add('cell');
            // cellElement.addEventListener('click', () => openCell(i, j));
            // cellElement.addEventListener('contextmenu', (e) => {
            //     e.preventDefault();
            //     flagCell(i, j);
            // });
            cellElement.onclick = () => openCell(i, j);
            cellElement.oncontextmenu = (e) => {
                e.preventDefault();
                flagCell(i, j);
            };

            boardElement.appendChild(cellElement);
        }
    }
}

function startCustomGame() {
    const rows = document.getElementById('rows').value || 9; // 입력값이 없으면 기본값 9
    const cols = document.getElementById('cols').value || 9; // 입력값이 없으면 기본값 9
    const mines = Number(document.getElementById('mines').value || Math.floor((rows * cols) / 6)); // 입력값이 없으면 총 셀 수의 약 1/6로 설정

    if (mines > rows * cols) {
        alert("Mines exceed the number of cells! Adjusting to max possible.");
        mines = rows * cols - 1; // 지뢰 수를 최대 가능한 수로 조정
    }
    
    document.getElementById('mine-count').innerText = `Mines: ${mines}`; // 화면에 지뢰 수 업데이트
    
    createBoard(rows, cols, mines);
}



function startTimer() {
    clearInterval(interval);
    timer = 0;
    interval = setInterval(() => {
        timer++;
        document.getElementById('timer').innerText = `Time: ${timer}s`;
    }, 1000);
}

function resetGame() {
    clearInterval(interval);
    document.getElementById('timer').innerText = `Time: 0s`;
    isTimerStarted = false;
    initGame();
}

document.addEventListener('DOMContentLoaded', () => {
    initGame('beginner'); 
});
