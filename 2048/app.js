const board = document.getElementById("board");
const size = 4;
let score = 0;
const scoreDisplay = document.getElementById("score");
const gameOverDisplay = document.getElementById("game-over");
const restartButton = document.getElementById("restart");
let grid = [];
let timer = null;
let time = 0;
let gameStarted = false;
const timeDisplay = document.getElementById("time");

const colors = {
    2: "#fff9c4",
    4: "#ffe082",
    8: "#ffcc80",
    16: "#ffb74d",
    32: "#ffa726",
    64: "#ff9800",
    128: "#fb8c00",
    256: "#f57c00",
    512: "#ef6c00",
    1024: "#e65100",
    2048: "#dd2c00",
    5096: "#bf360c",
    10192: "#3e2723"
};

function initBoard() {
    grid = [];
    board.innerHTML = "";
    score = 0;
    updateScore();
    for (let i = 0; i < size; i++) {
        let row = [];
        for (let j = 0; j < size; j++) {
            const cell = document.createElement("div");
            cell.classList.add("tile");
            row.push(0);
            board.appendChild(cell);
        }
        grid.push(row);
    }

    time = 0;
    gameStarted = false;
    if (timeDisplay) timeDisplay.textContent = time;
    clearInterval(timer);
    timer = null;

    addRandomTile();
    addRandomTile();
    updateBoard();
    gameOverDisplay.classList.add("hidden");
}

function addRandomTile() {
    const empty = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j] === 0) empty.push({ i, j });
        }
    }
    if (empty.length > 0) {
        const { i, j } = empty[Math.floor(Math.random() * empty.length)];
        grid[i][j] = Math.random() > 0.9 ? 4 : 2;
    }   
}

function updateBoard() {
    const cells = board.children;
    for (let i = 0; i < size * size; i++) {
        const x = Math.floor(i / size);
        const y = i % size;
        const cell = cells[i];
        const value = grid[x][y];
        cell.textContent = value > 0 ? value : "";
        cell.style.background = colors[value] || "#ccc";
        cell.style.color = "black";
    }
}

function slide(row) {
    let arr = row.filter(val => val);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i];
            arr[i + 1] = 0;
        }
    }
    return arr.filter(val => val).concat(Array(size - arr.filter(val => val).length).fill(0));
}

function updateScore() {
    if (scoreDisplay) scoreDisplay.textContent = score;
}

function rotateGrid(clockwise = true) {
    const newGrid = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(clockwise ? grid[size - j - 1][i] : grid[j][size - i - 1]);
        }
        newGrid.push(row);
    }
    grid = newGrid;
}

function handleInput(dir) {
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }
    if (!dir) return;
    let oldGrid = JSON.stringify(grid);
    if (dir === 'ArrowRight') grid = grid.map(row => slide(row.reverse()).reverse());
    else if (dir === 'ArrowLeft') grid = grid.map(row => slide(row));
    else if (dir === 'ArrowUp') {
        rotateGrid(false);
        grid = grid.map(row => slide(row));
        rotateGrid(true);
    } else if (dir === 'ArrowDown') {
        rotateGrid(false);
        grid = grid.map(row => slide(row.reverse()).reverse());
        rotateGrid(true);
    }
    if (JSON.stringify(grid) !== oldGrid) {
        addRandomTile();
        updateBoard();
        updateScore();
        if (isGameOver()) {
            gameOverDisplay.classList.remove("hidden")
        }
    }
}

function isGameOver() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j] === 0) return false;
            if (j < size - 1 && grid[i][j] === grid[i][j + 1]) return false;
            if (i < size - 1 && grid[i][j] === grid[i + 1][j]) return false;
        }
    }
    return true;
}

function startTimer() {
    if (timer) return; 
    timer = setInterval(() => {
        time++;
        if (timeDisplay) timeDisplay.textContent = time;
    }, 1000);
}


document.addEventListener("DOMContentLoaded", () => {
    initBoard();
    window.addEventListener("keydown", (e) => {
        const arrows = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        if (arrows.includes(e.key)) {
            e.preventDefault();
            handleInput(e.key);
        }
    });
    restartButton.addEventListener("click", () => {
        initBoard();
    })
});