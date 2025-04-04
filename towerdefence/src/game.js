function initGame() {
    const level = getGamelevel();
}

function getGamelevel() {
    const queryParams = new URLSearchParams(window.location.search);
    const level = queryParams.get('level');
    return level;
}

function loadGameData() {
    const gameData = JSON.parse(localStorage.getItem('gameData'));
}

// 버튼에 이벤트 추가
function initGameControls() {
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('quit-btn').addEventListener('click', quitGame);
    document.getElementById('speed-btn').addEventListener('click', toggleSpeed);
}

function togglePause() {

}
function restartGame() {

}
function quitGame() {

}
function toggleSpeed() {

}

document.addEventListener('DOMContentLoaded', function() {
    initGame();
    loadGameData();
})