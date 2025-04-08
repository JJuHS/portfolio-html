// TODO : 맵그리기 /디자인
// TODO : pause /디자인
// TODO : quit  /디자인
// TODO : 2x    /디자인
// TODO : restart   /디자인
// TODO : 타이머 / 디자인
// TODO : 목숨 수 업데이트 / 디자인
// TODO : 적 5마리 이상 endpoint 지나가면 실패 종료 /디자인
// TODO : 적 나오게 하기 및 이동    /디자인
// TODO : 적 남은 수 업데이트 / 디자인


// TODO : 타워 설치 준비 시간 주기  /기능, 디자인   !CONTINUE
// TODO : 빈 곳 클릭해서 타워 생성  /기능, 디자인   !CONTINUE
// TODO : 타워 업그레이드   /기능, 디자인
// TODO : 타워 범위 표시    /기능, 디자인

// TODO : 공격, 사망 /기능, 디자인  
// TODO : coin 업데이트 /기능, 디자인

// TODO : 적 다 제압시 승리 종료    /기능, 디자인




// ////////////////////////////////////
// 기본 변수 구역
// ////////////////////////////////////
let life = 5;   // 총 라이프
let animationFrame; // 에니메이션 설정
let frameRate = 60; // 프레임

let enemySpawnIndex = 0;    // 생성되는 적 번호
let waypoints = []; // 적 경로
let enemies = [];   // 적 정보
let moveInfoEnemies = [];   // 현재 움직이는 적 정보
let totalenemiesNumber = 0; // 총 적 수
let remainenemiesNumber = -1;   // 남은 적 수
let enemySpawnIntervalTime = 1000;  // 적 스폰 간격 (ms)
let enemyRadius = 5;

let map;    // 맵 정보
let selectedGrid = null;    // 선택된 그리드
let selectedRect = null;    // 선택된 캔버스

let currentLevel;   // 게임 레벨

let installedTowers = [];   // 설치된 타워 목록
let towerIdCounter = 3; // 생성될 타워 번호

let isGamePaused = false;   // 게임 중지 여부
let isDoubleSpeed = false;  // 게임 배속 여부
let isGameEnd = false;  // 게임 종료 여부

const tileWidth = 35;
const tileHeight = 20;

let gameTimer = 0;

// ////////////////////////////////////
// class 선언 구역, 및 기초 데이터
// ////////////////////////////////////
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

class Waypoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Enemy {
    constructor(id, info) {
        this.id = id;

        this.attribute = info.attribute;
        this.hp = 0;
        this.speed = info.speed;
        this.level = info.level;

        this.waypointIndex = 0;
        this.x = waypoints[0].x;
        this.y = waypoints[0].y;

        this.isMoving = true;
        this.isDead = false;
    }

    move() {
        if (!this.isMoving || this.isDead || this.waypointIndex >= waypoints.length - 1) {
            if (!this.isDead && this.isMoving) {
                this.reachEnd();
            }
            return;
        }

        let moveDist = this.speed * (isDoubleSpeed ? 2 : 1);
        while (moveDist > 0 && this.waypointIndex < waypoints.length - 1) {
            const target = waypoints[this.waypointIndex + 1];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist <= moveDist) {
                this.x = target.x;
                this.y = target.y;
                this.waypointIndex++;
                moveDist -= dist;
            } else {
                this.x += (dx / dist) * moveDist;
                this.y += (dy / dist) * moveDist;
                moveDist = 0;
            }
        }
    }

    draw(ctx) {
        if (this.isDead) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, enemyRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
    }

    reachEnd() {
        this.isMoving = false;
        this.isDead = true;
        life--;
        lifeUpdate();
        remainenemiesNumber--;
        enemyNumberUpdate();
        if (life <= 0) {
            loseGame();
            moveInfoEnemies.forEach(enemy => enemy.isMoving = false);
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

// ///////////////////////////////////////
// 함수구역
// ///////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    animationFrame = requestAnimationFrame(updateGame)
})

function initGame() {
    getGamelevel(); // 게임 레벨 불러오기
    loadGameData(); // 데이터 불러오기
    drawMap();  // 맵 그리기
    initEnemies();  //
    startTimer();   // 타이머 시작하기기
    enemyNumberUpdate();    // 데이터 -> 적 수 설정하기
    initGameControls(); // 버튼에 이벤트 설정하기기
}

// 게임 레벨 불러오기
function getGamelevel() {
    const queryParams = new URLSearchParams(window.location.search);
    const level = queryParams.get('level');
    currentLevel = parseInt(level);
    const levelDisplay = document.getElementById('current-level');
    levelDisplay.textContent = `Level: ${currentLevel}`
    return currentLevel;
}

// 데이터 불러오기
function loadGameData() {
    const gameData = JSON.parse(localStorage.getItem('gameDatas'));
    
    if (gameData && gameData.length > 0) {
        gameData.forEach(data => {
            if (data.level === currentLevel) {
                enemies = data.enemies;
                map = gameMapDatas[currentLevel];
                waypoints = map.road.map(position => new Waypoint(
                    position[0] * tileWidth + 50 + tileWidth / 2, 
                    position[1] * tileHeight + 30 + tileHeight / 2
                ));
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

// 맵 그리기기
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

            ctx.fillRect(50+x * tileWidth, 30+y * tileHeight, tileWidth, tileHeight)
            ctx.strokeStyle = '#312390';
            ctx.strokeRect(50+x * tileWidth, 30+y * tileHeight, tileWidth, tileHeight)
        })
    })
    function drawWaypointDots() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'blue';
        waypoints.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    } 
    drawWaypointDots();
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
    setInterval(() => {
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
function getScreenPosition(gameX, gameY) {
    const canvas = document.getElementById('gameCanvas');
    const canvasRect = canvas.getBoundingClientRect();
    
    return {
        x: canvasRect.left + window.scrollX + gameX -10,
        y: canvasRect.top + window.scrollY + gameY -10
    }
}
function initEnemies() {

    const enemyInterval = setInterval(() => {
        if (enemySpawnIndex >= enemies.length) {
            clearInterval(enemyInterval);
            return;
        }

        const enemyId = enemies[enemySpawnIndex++];
        if (enemyId !== 0) {
            const enemyInfo = totalEnemyDatas[enemyId];
            moveInfoEnemies.push(new Enemy(enemyId, enemyInfo));
        }
    }, enemySpawnIntervalTime);
}

// 게임 루프
function updateGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();

    if (!isGamePaused && !isGameEnd) {
        moveInfoEnemies.forEach(enemy => enemy.move());
    }

    moveInfoEnemies.forEach(enemy => enemy.draw(ctx));

    animationFrame = requestAnimationFrame(updateGame);
}
// TODO
// 타워
function attack() {

}
function enemyDie () {

}

// 게임 승리
function victoryGame() {
    if (remainenemiesNumber === 0) {
        return;
    }
}
function loseGame() {
    isGameEnd = true;
    cancelAnimationFrame(animationFrame);
}

