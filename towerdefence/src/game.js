// TODO : 맵그리기 /디자인
// TODO : pause /디자인
// TODO : quit  /디자인
// TODO : 2x    /디자인
// TODO : restart   /디자인
// TODO : 타이머 / 디자인
// TODO : 목숨 수 업데이트 / 디자인
// TODO : 적 5마리 이상 endpoint 지나가면 실패 종료 /디자인
// TODO : 적 나오게 하기 및 이동    /디자인


// TODO : 타워 설치 준비 시간 주기  /기능, 디자인   !CONTINUE
// TODO : 빈 곳 클릭해서 타워 생성  /기능, 디자인   !CONTINUE
// TODO : 타워 업그레이드   /기능, 디자인
// TODO : 타워 범위 표시    /기능, 디자인

// TODO : 공격, 사망 /기능, 디자인  
// TODO : coin 업데이트 /기능, 디자인
// TODO : 적 남은 수 업데이트 / 기능, 디자인

// TODO : 적 다 제압시 승리 종료    /기능, 디자인

document.addEventListener('DOMContentLoaded', function() {
    initGame();
    animationFrame = requestAnimationFrame(updateGame)
})

function initGame() {
    getGamelevel();
    loadGameData();
    drawMap();
    initEnemies();
    startTimer();
    enemyNumberUpdate();
    initGameControls();
}

let life = 5;
let animationFrame;
let frameRate = 30;

let enemySpawnIndex = 0;
let waypoints = [];
let enemies = [];
let totalenemiesNumber = 0;
let remainenemiesNumber = 0;
let moveInfoEnemies = [];
let enemySpawnIntervalTime = 1000;

let map;
let selectedGrid = null;
let selectedRect = null;

let currentLevel;

let installedTower = [];
let towerIdCounter = 3;

let isGamePaused = false;
let isDoubleSpeed = false;
let isGameEnd = false;

const tileWidth = 35;
const tileHeight = 20;

let gameTimer = 0;
let gameInterval;

// 데이터 불러오기
function getGamelevel() {
    const queryParams = new URLSearchParams(window.location.search);
    const level = queryParams.get('level');
    currentLevel = parseInt(level);
    return currentLevel;
}

function loadGameData() {
    const gameData = JSON.parse(localStorage.getItem('gameDatas'));
    
    if (gameData && gameData.length > 0) {
        gameData.forEach(data => {
            if (data.level === currentLevel) {
                enemies = data.enemies;
                map = gameMapDatas[currentLevel];
                waypoints = map.road.map(position => new Waypoint(position[0] * tileWidth + 50, position[1] * tileHeight + 20));
            }
        });
    }
    enemies.forEach(enemy => {
        if (enemy !== 0) {
            totalenemiesNumber++;
        }
        remainenemiesNumber = totalenemiesNumber;
    });
}

function drawMap() {    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    if (!map) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    map.board.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 1) {
                ctx.fillStyle = 'black';
            } else if (cell === 0) {
                ctx.fillStyle = 'lemonchiffon';
            } else {
                ctx.fillStyle = 'white';
            }

            ctx.fillRect(50+x * tileWidth, 20+y * tileHeight, tileWidth, tileHeight)
            ctx.strokeStyle = '#312390';
            ctx.strokeRect(50+x * tileWidth, 20+y * tileHeight, tileWidth, tileHeight)
        })
    })
}
// 버튼에 이벤트 추가
function initGameControls() {
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('quit-btn').addEventListener('click', quitGame);
    document.getElementById('speed-btn').addEventListener('click', toggleSpeed);
}

function togglePause() {
    isGamePaused = !isGamePaused
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.textContent = isGamePaused ? 'Play' : 'Pause';
}

function restartGame() {
    const wasPaused = isGamePaused;
    isGamePaused = true;
    const confirmQuit = confirm("게임을 재시작하시겠습니까?");
    if (confirmQuit) {
        window.location.reload();
    } else {
        isGamePaused = wasPaused;
    }
}
function quitGame() {
    const wasPaused = isGamePaused;
    isGamePaused = true;
    const confirmQuit = confirm("메인페이지로 돌아가시겠습니까?");
    if (confirmQuit) {
        window.location.href = 'main.html';
    } else {
        isGamePaused = wasPaused;
    }
}
function toggleSpeed() {
    isDoubleSpeed = !isDoubleSpeed
    const doubleSpeedBtn = document.getElementById('speed-btn');
    doubleSpeedBtn.textContent = isDoubleSpeed ? '1x Speed' : '2x Speed';
}

// 타이머
function startTimer() {
    const timeDisplay = document.getElementById('game-time');
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    gameTimer = 0;
    gameInterval = setInterval(() => {
        if (!isGamePaused && !isGameEnd) {
            gameTimer++;
        }
        const minutes = Math.floor(gameTimer / 60);
        const seconds = gameTimer % 60;
        timeDisplay.textContent = `${pad(minutes)}:${pad(seconds)}`
    }, 1000);
}

// life 표시
function lifeUpdate () {
    const lifeDisplay = document.getElementById('life-remaining');
    lifeDisplay.textContent = `life : ${life}/5`
}

// 적 수 표시
function enemyNumberUpdate () {
    const enemyDisplay = document.getElementById('enemies-remaining')
    enemyDisplay.textContent = `enemy : ${remainenemiesNumber}/${totalenemiesNumber}`
}

// 적 움직임
function initEnemies() {
    const container = document.getElementById('game-play-container');
    const canvas = document.getElementById('gameCanvas');
    const canvasRect = canvas.getBoundingClientRect();

    const enemyInterval = setInterval(() => {
        if (enemySpawnIndex >= enemies.length) {
            clearInterval(enemyInterval);
            return;
        }

        const enemyId = enemies[enemySpawnIndex++];
        if (enemyId !== 0) {
            const enemyInfo = totalEnemyDatas[enemyId];
            const enemyElement = document.createElement('div');
            enemyElement.classList.add('enemy');
            container.appendChild(enemyElement);
            
            
            const newEnemy = {
                element: enemyElement,
                speed: enemyInfo.speed * (tileWidth / frameRate),
                waypointIndex: 0,
                x: waypoints[0].x,
                y: waypoints[0].y,
                isMoving: true
            };
            enemyElement.style.left = `${newEnemy.x}px`;
            enemyElement.style.top = `${newEnemy.y}px`;
            moveInfoEnemies.push(newEnemy);
        }
    }, enemySpawnIntervalTime);
    console.log(moveInfoEnemies);
}

function updateGame() {
    if (!isGamePaused && !isGameEnd) {
        moveInfoEnemies.forEach(enemy => moveEnemy(enemy));
    }
    animationFrame = requestAnimationFrame(updateGame);
}

function moveEnemy(enemy) {
    if (!enemy.isMoving) {
        return;
    }
    if (enemy.waypointIndex >= waypoints.length - 1) {
        enemyReachedEnd(enemy)
        return;
    }

    const target = waypoints[enemy.waypointIndex + 1];
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const distance = Math.hypot(dx, dy);
    const moveDistance = enemy.speed * (isDoubleSpeed ? 2 : 1);

    if (distance <= moveDistance) {
        enemy.x = target.x;
        enemy.y = target.y;
        enemy.waypointIndex++;
    } else {
        enemy.x += (dx / distance) * moveDistance;
        enemy.y += (dy / distance) * moveDistance;
    }

    enemy.element.style.left = `${enemy.x + 10}px`;
    enemy.element.style.top = `${enemy.y + 250}px`;
}

function enemyReachedEnd(enemy) {
    enemy.isMoving = false;
    enemy.element.remove();

    life--;
    remainenemiesNumber--;
    enemyNumberUpdate();
    lifeUpdate();

    enemy.waypointIndex++;

    if (life <= 0) {
        loseGame();
        moveInfoEnemies.forEach(e => e.isMoving = false);

    }
}
// TODO
// 50 - 750
// 타워
document.getElementById('gameCanvas').addEventListener('click', function(event) {
    if (isGameEnd) return;

    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left ;
    const clickY = event.clientY - rect.top ;
    
    const gridX = Math.round((400/19) * clickX / (rect.right - rect.left))-1;
    const gridY = Math.round(7 * clickY / (rect.height - (canvas.height / 2))) - 1;

    if (!canInstallTower(gridX, gridY)) {
        alert('타워설치불가');
        hideTowerSelectUI();
        return;
    }
    selectedGrid = { gridX, gridY };
    showTowerSelectUI(event.clientX, event.clientY);
})

function canInstallTower(gridX, gridY) {   
    return map.board[gridY] && map.board[gridY][gridX] ===0;
}
function showTowerSelectUI (x, y) {
    const ui = document.getElementById('tower-select');
    ui.style.left = `${x}px`
    ui.style.top = `${y}px`
    ui.style.display = 'block';
}
function hideTowerSelectUI() {
    const ui = document.getElementById('tower-select');
    ui.style.display = 'none';
    selectedGrid = null
}
function selectTowerAttribute(attribute) {
    if (!selectedGrid) return;

    const { gridX, gridY } = selectedGrid;
    
    if (map.board[gridY][gridX] >= 3) {
        hideTowerSelectUI();
        return;
    }
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();

    const towerElement = document.createElement('div');
    towerElement.classList.add('tower');
    towerElement.style.left = `${gridX * tileWidth + 50 + rect.left}px`;
    towerElement.style.top = `${gridY * tileHeight + 20 + rect.top}px`;

    towerElement.dataset.attribute = attribute;

    document.body.appendChild(towerElement);

    // 맵에 설치 정보 반영
    map.board[gridY][gridX] = towerIdCounter;
    installedTowers.push({
        id: towerIdCounter,
        attribute,
        level: 1,
        x: gridX,
        y: gridY,
        element: towerElement
    });
    towerIdCounter++;

    console.log(`타워 설치됨: ${attribute}, (${gridX}, ${gridY})`);
    hideTowerSelectUI();

}

function attack() {

}
function enemyDie () {

}

function victoryGame() {
}
function loseGame() {
    isGameEnd = true;
    cancelAnimationFrame(animationFrame);
}


// DATA
class towerData {
    static water = {
        range:100,
        power:20,
        speed:1
    }
    static fire = {
        range:80,
        power:25,
        speed:0.9
    }
    static wind = {
        range:120,
        power:15,
        speed:1.1
    }
    constructor(level, attribute) {
        this.level = level;
        this.attribute = attribute;
        
        this.range = towerData[attribute].range;
        this.power = towerData[attribute].power;
        this.speed = towerData[attribute].speed;
        
        switch (level) {
            case 2:
                this.power *= 1.2
                break;
            case 3:
                this.power *= 1.5
                break;
        }
    }
}

class enemyData {
    constructor(id, attribute, hp, speed, level) {
        this.id = id
        this.attribute = attribute
        this.hp = hp
        this.speed = speed
        this.level = level
    }
}

const totalEnemyDatas = {
    1: new enemyData(1, 'fire', 200, 1.3, 1),
    2: new enemyData(2, 'fire', 150, 2.0, 2),
    3: new enemyData(3, 'fire', 300, 1.1, 3),
    4: new enemyData(4, 'wind', 180, 1.5, 1),
    5: new enemyData(5, 'wind', 130, 2.3, 2),
    6: new enemyData(6, 'wind', 270, 1.3, 3),
    7: new enemyData(7, 'water', 230, 1.1, 1),
    8: new enemyData(8, 'water', 180, 1.8, 2),
    9: new enemyData(9, 'water', 350, 0.9, 3),
}

class Waypoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Enemy {
    constructor(element, speed) {
        this.element = element;
        this.speed = speed;
        this.currentWaypointIndex = 0;
        this.isMoving = true;
        this.x = 0;
        this.y = 0;
    }

    moveToNextWaypoint(waypoints) {
        if (!this.isMoving || this.currentWaypointIndex >= waypoints.length) {
            this.isMoving = false;
            return;
        }

        const currentWaypoint = waypoints[this.currentWaypointIndex];
        const dx = currentWaypoint.x - this.x;
        const dy = currentWaypoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const moveDistance = this.speed;

        if (distance < moveDistance) {
            this.x = currentWaypoint.x;
            this.y = currentWaypoint.y;
            this.currentWaypointIndex++;
        } else {
            this.x += (dx / distance) * moveDistance;
            this.y += (dy / distance) * moveDistance;
        }
    }

}

class gameMap {
    constructor(level, board, road, start, end) {
        this.level = level
        this.board = board
        this.road = road
        this.start = start
        this.end = end
    }
}

const gameMapDatas = {
    1: new gameMap(1, 
        [
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        ],
        [[0, 3], [20, 3]],
        [3, 0],
        [3, 7],
    ),
    2: new gameMap(2, 
        [
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
        [0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        ],
        [[0, 3], [0, 2], [2, 2], [2, 4], [4, 4], [4, 2], [6, 2], [6, 4], [8, 4], [8, 2], [10, 2], [10, 4], [12, 4], [12, 2], [14, 2], [14, 4], [16, 4], [16, 2], [18, 2], [18, 3], [20, 3]],
        [3, 0],
        [3, 7],
    )
}