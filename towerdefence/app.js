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

function setFocusGameInput() {
    const gameIdInput = document.getElementById('game-id');
    if (gameIdInput) {
        gameIdInput.focus();
    }
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        gameInit()
    } 
}

function goShop() {
    window.location.href = 'shop.html';
}

function goMain() {
    window.location.href = 'main.html';
}

function editNickName() {
    const newNickname = prompt('Enter yout new nickname:', "");
    const maxNicknameLength = 20;
    if (newNickname && newNickname.length <= maxNicknameLength) {
        const userStatus = JSON.parse(localStorage.getItem('userStatus'));
        userStatus.id = newNickname;
        localStorage.setItem('userStatus', JSON.stringify(userStatus));
        updateNicknameDisplay();
    } else if (newNickname.length >= maxNicknameLength) {
        alert(`닉네임 글자수는 ${maxNicknameLength}로 제한되어 있습니다. \n Nickname must be no more than ${maxNicknameLength} characters`)
    } 
}

function updateNicknameDisplay() {
    const userStatus = JSON.parse(localStorage.getItem('userStatus'));
    if (userStatus && userStatus.id !== undefined) {
        document.getElementById('nickname').textContent = userStatus.id
    }
}

// 전체 게임 정보
class GameData {
    static nextlevel = 1;

    constructor(enemies = [], cleared = false, stars = 0, thumbail='') {
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

// 유저 정보
class userStatus {
    constructor(id='', coin=0, maxLevel=0) {
        this.id = id
        this.coin = coin
        this.maxLevel = maxLevel
        this.waterlevel = 1
        this.firelevel = 1
        this.windlevel = 1
        this.towerlevel = {}
    }
    updateCoin(change) {
        this.coin += change
    }

    upgradeTowerLevel(towerId) {
        if (towerId in this.towerlevel) {
            this.towerlevel[towerId]++;
        } else {
            this.towerlevel[towerId] = 1
        }
    }

    upgradeAttributeLevel(attribute) {
        switch (attribute) {
            case 'fire':
                this.firelevel++;
                break;
            case 'water':
                this.waterlevel++;
                break;
            case 'wind':
                this.windlevel++;
                break;
        }
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

window.onload = function() {
    updateNicknameDisplay();
    setFocusGameInput();
}