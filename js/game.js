let canvas;
let world;
let keyboard = new Keyboard();
let isMuted = false;

/**
 * Initializes the canvas and game world
 */
function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
    if (isMuted && world) {
        world.setMute(true);
    }
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

/**
 * Updates keyboard state on keydown or keyup
 * @param {KeyboardEvent} e 
 * @param {boolean} state 
 */
function setKeyboardState(e, state) {
    if (keyMap[e.key] !== undefined) {
        keyboard[keyMap[e.key]] = state;
    }
}

/**
 * Toggles mute state and updates icon and game sound
 */
function toggleMute() {
    const volumeButton = document.getElementById('volume-button');
    isMuted = !isMuted;
    volumeButton.src = isMuted
        ? './img/10_interface_icons/mute.png'
        : './img/10_interface_icons/volume.png';
    if (world) {
        world.setMute(isMuted);
    }
}

let modal;

/**
 * Checks if the browser is currently in fullscreen mode
 * @returns {boolean}
 */
function isFullscreen() {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}

/**
 * Opens the controls modal and requests fullscreen if needed
 */
function openModal() {
    modal.style.display = "block";
    requestFullscreen(document.documentElement);
}

/**
 * Closes the modal and exits fullscreen if active
 */
function closeModal() {
    modal.style.display = "none";
    exitFullscreen();
}

/**
 * Request fullscreen for an element
 * @param {HTMLElement} elem 
 */
function requestFullscreen(elem) {
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

/**
 * Exit fullscreen if active
 */
function exitFullscreen() {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
}

window.onclick = function (event) {
    if (event.target === modal) {
        closeModal();
    }
};

/**
 * Toggles fullscreen on the canvas container
 */
function toggleFullscreen() {
    const canvasContainer = document.querySelector('.canvas-container');
    isFullscreen() ? exitFullscreen() : requestFullscreen(canvasContainer);
}

/**
 * Reloads the entire game
 */
function reloadGame() {
    location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('infoModal');
    window.addEventListener('keydown', e => setKeyboardState(e, true));
    window.addEventListener('keyup', e => setKeyboardState(e, false));
});

/**
 * Starts the game by hiding the start screen and initializing game
 */
function startGame() {
    const loadingImage = document.getElementById('loadingImage');
    const gameContainer = document.getElementById('gameContainer');
    const startButton = document.querySelector('.start-screen-icon');
    const legalButton = document.querySelector('.legal-notice-section');
    loadingImage.classList.add('hidden');
    startButton.style.display = 'none';
    startButton.onclick = null;
    gameContainer.style.display = 'block';
    legalButton.style.display = 'none';
    init();
    if (isMuted && world) {
        world.setMute(true);
    }
    document.querySelector('.reload-button').classList.remove('hidden');
}

/**
 * Shows the game over screen and disables input
 */
function gameOver() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    const tryAgainButton = document.getElementById('tryAgainButton');
    gameOverScreen.classList.remove('hidden');
    tryAgainButton.classList.remove('hidden');
    disableUserInput();
}

/**
 * Detaches any global key listeners
 */
function disableUserInput() {
    if (typeof handleKeyDown === 'function') {
        document.removeEventListener('keydown', handleKeyDown);
    }
    if (typeof handleKeyUp === 'function') {
        document.removeEventListener('keyup', handleKeyUp);
    }
}
