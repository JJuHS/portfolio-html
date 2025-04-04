function getGamelevel() {
    const queryParams = new URLSearchParams(window.location.search);
    const level = queryParams.get('level');
    return level;
}

function initGame() {
    const level = getGamelevel();
}

document.addEventListener('DOMContentLoaded', initGame)