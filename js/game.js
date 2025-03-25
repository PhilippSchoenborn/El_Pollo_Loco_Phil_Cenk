let canvas;
let world;
let keyboard = new Keyboard();
let isMuted = false;

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
}

const keyMap = {
    ArrowRight: 'RIGHT',
    ArrowLeft: 'LEFT',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ' ': 'SPACE',
    d: 'D',
    D: 'D'
};

function setKeyboardState(e, state) {
    if (keyMap[e.key] !== undefined) {
        keyboard[keyMap[e.key]] = state;
    }
}

function toggleMute() {
    const volumeButton = document.getElementById('volume-button');
    if (volumeButton.src.includes('volume.png')) {
        volumeButton.src = './img/10_interface_icons/mute.png';
    } else {
        volumeButton.src = './img/10_interface_icons/volume.png';
    }
}

let modal;

function isFullscreen() {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}

function openModal() {
    modal.style.display = "block";
    if (isFullscreen()) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }
}

function closeModal() {
    modal.style.display = "none";
    if (isFullscreen()) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

window.onclick = function (event) {
    if (event.target === modal) {
        closeModal();
    }
}

function toggleFullscreen() {
    const canvasContainer = document.querySelector('.canvas-container');
    if (isFullscreen()) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    } else {
        if (canvasContainer.requestFullscreen) {
            canvasContainer.requestFullscreen();
        } else if (canvasContainer.mozRequestFullScreen) {
            canvasContainer.mozRequestFullScreen();
        } else if (canvasContainer.webkitRequestFullscreen) {
            canvasContainer.webkitRequestFullscreen();
        } else if (canvasContainer.msRequestFullscreen) {
            canvasContainer.msRequestFullscreen();
        }
    }
}

function reloadGame() {
    location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('infoModal');
    window.addEventListener('keydown', (e) => setKeyboardState(e, true));
    window.addEventListener('keyup', (e) => setKeyboardState(e, false));
});

function startGame() {
    const loadingImage = document.getElementById('loadingImage');
    const gameContainer = document.getElementById('gameContainer');
    const startButton = document.querySelector('.start-screen-icon');
    loadingImage.classList.add('hidden');
    startButton.style.display = 'none';
    startButton.onclick = null;
    gameContainer.style.display = 'block';
    init();
}

function gameOver() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    const tryAgainButton = document.getElementById('tryAgainButton');
    gameOverScreen.classList.remove('hidden');
    tryAgainButton.classList.remove('hidden');
    disableUserInput();
}

function disableUserInput() {
    if (typeof handleKeyDown === 'function') {
        document.removeEventListener('keydown', handleKeyDown);
    }
    if (typeof handleKeyUp === 'function') {
        document.removeEventListener('keyup', handleKeyUp);
    }
}
