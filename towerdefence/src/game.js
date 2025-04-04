// TODO : 맵그리기 /디자인
// TODO : 타워 설치 준비 시간 주기  /기능, 디자인
// TODO : 적 나오게 하기 및 이동    /기능, 디자인   !CONTINUE
// TODO : 빈 곳 클릭해서 타워 생성  /기능, 디자인
// TODO : 타워 업그레이드   /기능, 디자인
// TODO : 공격, 사망,   /기능, 디자인
// TODO : coin 업데이트 /기능, 디자인
// TODO : 적 다 제압시 승리 종료    /기능, 디자인
// TODO : 적 5마리 이상 endpoint 지나가면 실패 종료 /기능, 디자인
// TODO : pause /기능, 디자인
// TODO : quit  /디자인
// TODO : 2x    /기능, 디자인
// TODO : restart   /기능, 디자인
// TODO : 타워 범위 표시    /기능, 디자인

function initGame() {
    const level = getGamelevel();
}
const frameRate = 1000;
let enemies = [];
let activeEnemies = [];
let map;
let currentLevel;
let towerPosition = [];
let isGamePaused = false;
let isDoubleSpeed = false;
const tileWidth = 35;
const tileHeight = 20;

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
            }
        });
    }
}

// 버튼에 이벤트 추가
function initGameControls() {
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('quit-btn').addEventListener('click', quitGame);
    document.getElementById('speed-btn').addEventListener('click', toggleSpeed);
}

// TODO
function togglePause() {
    isGamePaused = !isGamePaused
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
}
function drawMap() {    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    if (!map) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    map.board.forEach((row, y) => {
        row.forEach((cell, x) => {
            ctx.fillStyle = cell === 1 ? 'black' : 'white';
            ctx.fillRect(50+x * tileWidth, 20+y * tileHeight, tileWidth, tileHeight)
            ctx.strokeStyle = '#312390';
            ctx.strokeRect(50+x * tileWidth, 20+y * tileHeight, tileWidth, tileHeight)
        })
    })
}
function attack() {

}
function installTower() {

}
function upgradeTower() {

}
function drawTowerRange() {

}

function initEnemies() {
    activeEnemies = [];
    enemies.forEach(id => {
        if (id > 0) {
            const enemyInfo = totalEnemyDatas[id]
            if (enemyInfo) {
                activeEnemies.push({
                    id:id,
                    x:(map.start[0] * tileWidth) + 50,
                    y:(map.start[1] * tileHeight) + 20,
                    hp:enemyInfo.hp,
                    speed:enemyInfo.speed,
                    reachedEnd:false,
                    nextPathIndex:1
                })
            } else {
                activeEnemies.push('no');
            }
        }
    })
}
function enemyMove() {
    const canvas = document.getElementById('gameCanvas');
    activeEnemies.forEach(enemy => {
        if (!enemy.reachedEnd) {
            if (enemy.nextPathIndex < map.road.length) {
                const nextPos = map.road[enemy.nextPathIndex];
                
                const targetX = nextPos[0] * tileWidth + 50;
                const targetY = nextPos[1] * tileHeight + 20;

                const dx = targetX - enemy.x;
                const dy = targetY - enemy.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                const moveDistance = enemy.speed * tileWidth ;
                if (distance < moveDistance) {
                    enemy.x = targetX;
                    enemy.y = targetY;
                    enemy.nextPathIndex++;
                    if (enemy.nextPathIndex >= map.road.length) {
                        enemy.reachedEnd = true;
                        enemyRemove(enemy);
                    }
                } else {
                    const ratio = moveDistance / distance;
                    enemy.x += dx * ratio;
                    enemy.y += dy * ratio;
                }
            }
        }
    })
    drawEnemies();
}
function drawEnemies() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    activeEnemies.forEach(enemy => {
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y, tileWidth/2, tileHeight/2);
    })
}
function enemyRemove(enemy) {
    const index = activeEnemies.indexOf(enemy);
    if (index > -1) {
        activeEnemies.splice(index, 1);
    }
}
function victoryGame() {

}
function loseGame() {

}

document.addEventListener('DOMContentLoaded', function() {
    initGame();
    loadGameData();
    drawMap();
    initEnemies();
    setInterval(enemyMove, 1000/frameRate)
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
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7]],
        [3, 0],
        [3, 7]
    ),
    2: new gameMap(1, 
        [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        ],
        [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7]],
        [3, 0],
        [3, 7]
    )
}