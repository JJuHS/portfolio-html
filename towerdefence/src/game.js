// TODO : 맵그리기 /디자인
// TODO : 적 나오게 하기 및 이동    /디자인 
// TODO : pause /디자인
// TODO : quit  /디자인
// TODO : 2x    /디자인
// TODO : restart   /디자인
// TODO : 타이머 / 디자인
// TODO : 목숨 수 업데이트 / 디자인
// TODO : 적 5마리 이상 endpoint 지나가면 실패 종료 /디자인


// TODO : 타워 설치 준비 시간 주기  /기능, 디자인
// TODO : 빈 곳 클릭해서 타워 생성  /기능, 디자인
// TODO : 타워 업그레이드   /기능, 디자인
// TODO : 타워 범위 표시    /기능, 디자인

// TODO : 공격, 사망 /기능, 디자인
// TODO : coin 업데이트 /기능, 디자인
// TODO : 적 남은 수 업데이트 / 기능, 디자인

// TODO : 적 다 제압시 승리 종료    /기능, 디자인

function initGame() {
    getGamelevel();
    loadGameData();
    drawMap();
    initGameControls();
    startTimer();
    enemyNumberUpdate();
    setupCanvasClickListener();
}

let life = 5;
let frameRate = 30;

let enemySpawnIndex = 0;
let waypoints = [];
let enemies = [];
let totalenemiesNumber = 0;
let remainenemiesNumber = 0;
let moveInfoEnemies = [];

let map;

let currentLevel;

let towerPosition = [];

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
    if (isGamePaused) {
        pauseBtn.textContent = 'Play'
    } else {
        pauseBtn.textContent = 'Pause'
    }
}
function restartGame() {
    togglePause()
    const confirmQuit = confirm("게임을 재시작하시겠습니까?");
    if (confirmQuit) {
        window.location.reload();
    }
    togglePause()
}
function quitGame() {
    togglePause()
    const confirmQuit = confirm("메인페이지로 돌아가시겠습니까?");
    if (confirmQuit) {
        window.location.href = 'main.html';
    }
    togglePause()
}
function toggleSpeed() {
    isDoubleSpeed = !isDoubleSpeed
    const doubleSpeedBtn = document.getElementById('speed-btn');
    if (isDoubleSpeed) {
        doubleSpeedBtn.textContent = '1x Speed';
    } else {
        doubleSpeedBtn.textContent = '2x Speed';
    }
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
    const enemySpawnInterval = setInterval(() => {
        if (enemySpawnIndex < enemies.length) {
            let enemyId = enemies[enemySpawnIndex];
            if (enemyId > 0) {
                const enemyInfo = totalEnemyDatas[enemyId];
                const newEnemy = new Enemy(
                    map.start[0] * tileWidth - 60,
                    map.start[1] * tileHeight + 80,
                    enemyInfo.speed
                );
                moveInfoEnemies.push(newEnemy);
            }
            enemySpawnIndex++;
        } else {
            clearInterval(enemySpawnInterval);
        }
    }, 1000);
}

function enemyMove() {
    if (!isGamePaused && moveInfoEnemies.length > 0) {
        moveInfoEnemies.forEach((enemy, index) => {
            if (enemy.isMoving) {
                const currentWaypoint = waypoints[enemy.currentWaypointIndex];
                const dx = currentWaypoint.x - enemy.x;
                const dy = currentWaypoint.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const speedModifier = isDoubleSpeed ? 2 : 1;  // 이중 속도면 2, 아니면 1
                const moveDistance = (enemy.speed * speedModifier) * (tileWidth / frameRate);


                if (distance < moveDistance) {
                    // 다음 웨이포인트에 도달
                    enemy.x = currentWaypoint.x;
                    enemy.y = currentWaypoint.y;
                    enemy.currentWaypointIndex++;
                    if (enemy.currentWaypointIndex >= waypoints.length) {
                        enemy.isMoving = false;  // 마지막 웨이포인트에 도달했으면 이동 중지
                        life--;
                        remainenemiesNumber--;
                        enemyNumberUpdate();
                        if (life === 0) {
                            loseGame();
                        }
                        lifeUpdate();
                    }
                } else {
                    // 선형 이동 계산
                    const ratio = moveDistance / distance;
                    enemy.x += dx * ratio;
                    enemy.y += dy * ratio;
                }
            } else {
                moveInfoEnemies.splice(index, 1);  // 움직이지 않는 적은 리스트에서 제거
            }
        });
    }
}

function drawEnemies() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawMap();
    moveInfoEnemies.forEach(enemy => {
        if (enemy.isMoving) {
            ctx.fillStyle = 'red';
            ctx.fillRect(enemy.x, enemy.y + 5, tileWidth / 2, tileHeight / 2);
        }
    })
}

// TODO
function attack() {

}
function enemyDie () {

}
function setupCanvasClickListener() {
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('click', handleCanvasClick);
}

function handleCanvasClick(event) {
    const canvas = document.getElementById('gameCanvas');
    
    const rect = canvas.getBoundingClientRect();
    console.log(event);
    
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    const gridX = Math.floor((clickX - 50) / tileWidth);
    const gridY = Math.floor((clickY - 20) / tileHeight);
    console.log(map);
    
    if (map && map.board[gridY][gridX] === 0) { // 0은 타워 설치 가능 구역
        if (!towerPosition.find(p => p.x === gridX && p.y === gridY)) {
            installTower(gridX, gridY);
        } else {
            console.log('이미 타워 있음.')
        }
    } else {
        console.log('타워 설치 불가');
        
    }
}
function installTower(gridX, gridY) {
    towerPosition.push({ x: gridX, y: gridY });
    console.log(gridX, gridY);
    
}   

function upgradeTower() {

}
function drawTowerRange() {

}

function victoryGame() {
}
function loseGame() {
    isGameEnd = !isGameEnd
}

setInterval(() => {
    if (isGameEnd) return;
    if (!isGamePaused) {
        enemyMove();
        drawEnemies();
    }
}, 1000/frameRate)

document.addEventListener('DOMContentLoaded', function() {
    initGame();
    initEnemies();
})


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
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.currentWaypointIndex = 0;
        this.isMoving = true;
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
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        [[0, 3], [20, 3]],
        [3, 0],
        [3, 7],
    )
}