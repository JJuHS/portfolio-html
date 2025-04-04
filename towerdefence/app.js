function gameInit() {
    var gameIdInput = document.getElementById('game-id')
    var userId = gameIdInput.value;
    console.log(gameIdInput);
    console.log(userId);
    
    if (!userId) {
        alert('닉네임을 입력하세요\n Enter Your Nickname.')
        return;
    }
    var user = new userStatus(userId);
    localStorage.removeItem('userStatus')
    localStorage.setItem('userStatus', JSON.stringify(user))
    
    // TODO: 게임 데이터 집어넣기
    if (!localStorage.getItem('gameDatas')) {
        const gameDatas = [
            new GameData(),
            new GameData()
        ];
        localStorage.setItem('gameDatas', JSON.stringify(gameDatas));
    }
    goMain()
}

function goShop() {
    window.location.href = 'shop.html';
}

function goMain() {
    window.location.href = 'main.html';
}

class GameData {
    static nextlevel = 1;

    constructor(level, enemies = [], cleared = false, stars = 0, thumbail='') {
        this.level = GameData.nextlevel++;
        this.enemies = enemies;
        this.cleared = cleared;
        this.stars = stars;
        this.thumbail = thumbail;
    }
    updateCleared(user, stars) {
        this.cleared = true
        this.stars = stars
        user.maxLevel = this.level
    }
    updateStar(stars) {
        this.stars = stars
    }
}

class userStatus {
    constructor(id='', coin=0, maxLevel=0) {
        this.id = id
        this.coin = coin
        this.maxLevel = maxLevel
    }
    updateCoin(change) {
        this.coin += change
    }

    updateMaxLevel(level) {
        this.maxLevel = level
    }
}

function displayGameData() {
    const gameDataList = document.getElementById('game-list');
    gameDataList.innerHTML = '';

    const gameDatas = JSON.parse(localStorage.getItem('gameDatas'));

    gameDatas.forEach((gameData, index) => {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-data';
        gameDiv.textContent = `level ${gameData.level} - Stars : ${gameData.stars}`;
        gameDiv.onclick = () => enterGame(gameData.level);
        gameDataList.appendChild(gameDiv);
    });
}

function enterGame(level) {
    window.location.href = `game.html?level=${level}`;
}

function updateCoinStatus() {
    const userStatus = JSON.parse(localStorage.getItem('userStatus'));
    if (userStatus && userStatus.coin != undefined) {
        const coinDiv = document.getElementById('coin-status');
        coinDiv.textContent = `${userStatus.coin} coin`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    displayGameData();
    updateCoinStatus();
})