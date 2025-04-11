const DEBUG_MODE = false; // Set to true to display hitboxes, false to hide them.

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

/**
 * Updates the keyboard state based on event and state.
 * @param {KeyboardEvent} e - The key event.
 * @param {boolean} state - Whether the key is pressed or released.
 */
function setKeyboardState(e, state) {
    if (keyMap[e.key] !== undefined) {
        keyboard[keyMap[e.key]] = state;
    }
}

/** Binds keydown and keyup events to window. */
function bindKeyEvents() {
    handleKeyDown = (e) => setKeyboardState(e, true);
    handleKeyUp = (e) => setKeyboardState(e, false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

/** Removes key event listeners from window. */
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

/* Helper: Updates UI elements needed when starting the game */
function updateUIForGameStart() {
    document.getElementById('loadingImage').classList.add('hidden');
    const startIcon = document.querySelector('.start-screen-icon');
    startIcon.style.display = 'none';
    startIcon.onclick = null;
    document.getElementById('gameContainer').style.display = 'block';
    document.querySelector('.legal-notice-section').style.display = 'none';
    document.querySelector('.game-instructions-section').style.display = 'none';
    document.querySelector('.reload-button').classList.remove('hidden');
    document.querySelector('.retry-btn').classList.remove('hidden');
}

/* Helper: Binds listeners for screen orientation changes */
function initGameListeners() {
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
}

/* Helper: Initializes and starts the world/game */
function initWorld() {
    keyboard = new Keyboard();
    updateFullscreenButtonVisibility();
    setupTouchControls();
    bindKeyEvents();
    world = new World(canvas, keyboard);
    world.setMute(isMuted);
    world.init();
    if (world.character) {
        world.character.canMove = true;
    }
}

/** Starts the game and displays the main game screen. */
function startGame() {
    canvas = document.getElementById('canvas');
    updateUIForGameStart();
    initGameListeners();
    initWorld();
    if (isTouchDevice()) {
        handleTouchControlsVisibility();
    }
    checkOrientation();
}

/* Helper: Gets the touch controls elements */
function getTouchElements() {
    return {
        touchControls: document.getElementById("touchControls"),
        warning: document.getElementById("landscapeWarning")
    };
}

/** Handles the visibility of touch controls based on orientation. */
function handleTouchControlsVisibility() {
    const { touchControls, warning } = getTouchElements();
    const isTouch = isTouchDevice();
    const isLandscape = window.innerWidth > window.innerHeight;
    const isGameRunning = world && world.character && world.character.canMove;
    touchControls.style.display = "none";
    warning.style.display = "none";
    if (!isTouch || !isGameRunning) {
        if (isTouch && !isLandscape) {
            warning.style.display = "flex";
        }
        return;
    }
    if (isLandscape) touchControls.style.display = "flex";
    else warning.style.display = "flex";
}

/**
 * Checks if the device supports touch input.
 * @returns {boolean}
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function resetWorld() {
    if (world) {
        world.cleanUp?.();
        world = null;
    }
    window.bossTriggered = false;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resetUIForReload() {
    unbindKeyEvents();
    document.getElementById('loadingImage').classList.remove('hidden');
    const startScreenIcon = document.querySelector('.start-screen-icon');
    startScreenIcon.style.display = 'inline';
    startScreenIcon.onclick = startGame;
    document.querySelector('.legal-notice-section').style.display = 'block';
    document.querySelector('.game-instructions-section').style.display = 'block';
    document.querySelector('.reload-button').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('touchControls').style.display = 'none';
    document.querySelector('.retry-btn').classList.add('hidden');
}

function reloadGame() {
    resetWorld();
    resetUIForReload();
    updateFullscreenButtonVisibility();
    setupTouchControls();
    checkOrientation();
}

function gameOver() {
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('tryAgainButton').classList.remove('hidden');
    disableUserInput();
    document.getElementById('touchControls').style.display = 'none';
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
    document.getElementById('touchControls').style.display = 'none';
    world.updateCollectedCoinsDisplay();
}

function disableUserInput() {
    unbindKeyEvents();
}

function openModal() {
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

/**
 * Checks whether the browser is currently in fullscreen mode.
 * @returns {boolean}
 */
function isFullscreen() {
    return document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
}

/**
 * Requests fullscreen mode for a given element.
 * @param {HTMLElement} elem - The element to display in fullscreen.
 */
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

/**
 * Toggles fullscreen mode for the game container.
 */
function toggleFullscreen() {
    const canvasContainer = document.querySelector('.canvas-container');
    isFullscreen() ? exitFullscreen() : requestFullscreen(canvasContainer);
}

/**
 * Closes the legal notice overlay.
 */
function closeLegalNotice() {
    document.getElementById('openLegalNotice').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

function closeGameInstructions() {
    document.getElementById('gameInstructions').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

function checkOrientation() {
    handleTouchControlsVisibility();
}

/**
 * Sets up touch control event listeners.
 */
function setupTouchControls() {
    addControlEvents("btnLeft", "LEFT");
    addControlEvents("btnRight", "RIGHT");
    addControlEvents("btnJump", "UP");
    addControlEvents("btnThrow", "D");
    document.querySelectorAll('.touch-button').forEach(button => {
        button.addEventListener('contextmenu', e => e.preventDefault());
    });
}

function disableContextMenusOnAllButtons() {
    document.querySelectorAll(
        'button, img, a, .img-icon, .start-screen-icon, .pulse-icon, .legal-notice, .game-instructions'
    ).forEach(el => {
        el.addEventListener('contextmenu', e => e.preventDefault());
    });
}

/**
 * Adds touch and mouse event listeners for a button.
 * @param {string} buttonId - ID of the button element.
 * @param {string} key - Key to toggle in the keyboard object.
 */
function addControlEvents(buttonId, key) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    const activate = () => (keyboard[key] = true);
    const deactivate = () => (keyboard[key] = false);
    button.addEventListener("touchstart", activate);
    button.addEventListener("touchend", deactivate);
    button.addEventListener("mousedown", activate);
    button.addEventListener("mouseup", deactivate);
}

document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('infoModal');
    bindKeyEvents();
    setupTouchControls();
    checkOrientation();
    updateFullscreenButtonVisibility();
    window.addEventListener("resize", () => {
        checkOrientation();
        updateFullscreenButtonVisibility();
    });
    window.addEventListener("orientationchange", () => {
        checkOrientation();
        updateFullscreenButtonVisibility();
    });
    disableContextMenusOnAllButtons();
});

document.getElementById('infoModal').addEventListener('click', (e) => {
    const container = document.querySelector('.info-modal-container');
    if (!container.contains(e.target)) {
        closeModal();
    }
});

document.querySelector('.legal-notice-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('openLegalNotice').classList.remove('hidden');
    document.body.classList.add('no-scroll');
});

document.getElementById('openLegalNotice').addEventListener('click', (e) => {
    if (!document.querySelector('.legal-notice-container').contains(e.target)) {
        closeLegalNotice();
    }
});

document.querySelector('.game-instructions-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('gameInstructions').classList.remove('hidden');
    document.body.classList.add('no-scroll');
});

document.getElementById('gameInstructions').addEventListener('click', (e) => {
    if (!document.querySelector('.game-instructions-container').contains(e.target)) {
        closeGameInstructions();
    }
});

window.addEventListener("resize", () => {
    checkOrientation();
});

window.addEventListener("orientationchange", () => {
    checkOrientation();
});

function resetWorldForRetry() {
    if (world) {
        world.cleanUp?.();
        world = null;
    }
    window.bossTriggered = false;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateGameListenersForRetry() {
    window.removeEventListener("resize", checkOrientation);
    window.removeEventListener("orientationchange", checkOrientation);
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
}

function restartWorld() {
    keyboard = new Keyboard();
    updateFullscreenButtonVisibility();
    setupTouchControls();
    bindKeyEvents();
    world = new World(canvas, keyboard);
    world.setMute(isMuted);
    world.init();
    if (world.character) {
        world.character.canMove = true;
    }
}

function updateUIAfterRetry() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('canvas').style.display = 'block';
    handleTouchControlsVisibility();
}

/**
 * Restarts the game without going to the main menu.
 */
let isRetrying = false;
function retryGame() {
    if (isRetrying) return;
    isRetrying = true;
    const retryBtn = document.querySelector('.retry-btn');
    retryBtn.classList.add('disabled');
    retryBtn.style.pointerEvents = 'none';
    try {
        resetWorldForRetry();
        updateGameListenersForRetry();
        restartWorld();
        updateUIAfterRetry();
    } catch (error) {
        console.error("Error during retry:", error);
    } finally {
        setTimeout(() => {
            isRetrying = false;
            retryBtn.classList.remove('disabled');
            retryBtn.style.pointerEvents = 'auto';
        }, 2000);
    }
}

/**
 * Updates the fullscreen button visibility based on device type and screen width.
 * Hides it on phones (<=768px and touch-enabled), shows it otherwise.
 */
function updateFullscreenButtonVisibility() {
    const fullscreenButton = document.getElementById('fullscreen-button');
    if (!fullscreenButton) return;
    const isPhone = window.innerWidth <= 768 && isTouchDevice();
    fullscreenButton.style.display = isPhone ? 'none' : 'inline';
}
