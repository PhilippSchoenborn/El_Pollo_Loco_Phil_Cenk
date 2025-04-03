let canvas;
let world;
let keyboard = new Keyboard();
let isMuted = false;
let modal;
let handleKeyDown;
let handleKeyUp;

const keyMap = {
    ArrowRight: 'RIGHT',
    ArrowLeft: 'LEFT',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ' ': 'SPACE',
    d: 'D',
    D: 'D'
};

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
    if (isMuted) world.setMute(true);
}

function setKeyboardState(e, state) {
    if (keyMap[e.key] !== undefined) {
        keyboard[keyMap[e.key]] = state;
    }
}

function bindKeyEvents() {
    handleKeyDown = e => setKeyboardState(e, true);
    handleKeyUp = e => setKeyboardState(e, false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

function unbindKeyEvents() {
    if (handleKeyDown) window.removeEventListener('keydown', handleKeyDown);
    if (handleKeyUp) window.removeEventListener('keyup', handleKeyUp);
}

function toggleMute() {
    isMuted = !isMuted;
    updateVolumeIcon();
    if (world) world.setMute(isMuted);
}

function updateVolumeIcon() {
    const btn = document.getElementById('volume-button');
    btn.src = isMuted
        ? './img/10_interface_icons/mute.png'
        : './img/10_interface_icons/volume.png';
}

function startGame() {
    document.getElementById('loadingImage').classList.add('hidden');
    document.querySelector('.start-screen-icon').style.display = 'none';
    document.querySelector('.start-screen-icon').onclick = null;
    document.getElementById('gameContainer').style.display = 'block';
    document.querySelector('.legal-notice-section').style.display = 'none';
    document.querySelector('.game-instructions-section').style.display = 'none';
    document.querySelector('.reload-button').classList.remove('hidden');

    init();
    if (isMuted) world.setMute(true);
}

function gameOver() {
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('tryAgainButton').classList.remove('hidden');
    disableUserInput();
    world.updateCollectedCoinsDisplay();
}

function win() {
    disableUserInput();
    if (world?.character) {
        world.character.dead = true;
        world.character.stopSnoring();
    }
    world?.pauseGame?.();
    document.getElementById('winScreen').classList.remove('hidden');
    document.getElementById('winAgainButton').classList.remove('hidden');
    world.updateCollectedCoinsDisplay();
}

function disableUserInput() {
    unbindKeyEvents();
}

function openModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

function isFullscreen() {
    return document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
}

function requestFullscreen(elem) {
    (elem.requestFullscreen ||
        elem.mozRequestFullScreen ||
        elem.webkitRequestFullscreen ||
        elem.msRequestFullscreen)?.call(elem);
}

function exitFullscreen() {
    (document.exitFullscreen ||
        document.mozCancelFullScreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen)?.call(document);
}

function toggleFullscreen() {
    const canvasContainer = document.querySelector('.canvas-container');
    isFullscreen() ? exitFullscreen() : requestFullscreen(canvasContainer);
}

function reloadGame() {
    location.reload();
}

function closeLegalNotice() {
    document.getElementById('openLegalNotice').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

function closeGameInstructions() {
    document.getElementById('gameInstructions').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

// Event Bindings
document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('infoModal');
    bindKeyEvents();
});

// Legal Notice
document.querySelector('.legal-notice-link').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('openLegalNotice').classList.remove('hidden');
    document.body.classList.add('no-scroll');
});

document.getElementById('openLegalNotice').addEventListener('click', e => {
    if (!document.querySelector('.legal-notice-container').contains(e.target)) {
        closeLegalNotice();
    }
});

// Game Instructions
document.querySelector('.game-instructions-link').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('gameInstructions').classList.remove('hidden');
    document.body.classList.add('no-scroll');
});

document.getElementById('gameInstructions').addEventListener('click', e => {
    if (!document.querySelector('.game-instructions-container').contains(e.target)) {
        closeGameInstructions();
    }
});
