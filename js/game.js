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

/** Initializes the game world and canvas. */
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
    handleKeyDown = e => setKeyboardState(e, true);
    handleKeyUp = e => setKeyboardState(e, false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

/** Removes key event listeners from window. */
function unbindKeyEvents() {
    if (handleKeyDown) window.removeEventListener('keydown', handleKeyDown);
    if (handleKeyUp) window.removeEventListener('keyup', handleKeyUp);
}

/** Toggles game audio mute state and updates the icon. */
function toggleMute() {
    isMuted = !isMuted;
    updateVolumeIcon();
    if (world) world.setMute(isMuted);
}

/** Updates the mute/volume icon on the button. */
function updateVolumeIcon() {
    const btn = document.getElementById('volume-button');
    btn.src = isMuted
        ? './img/10_interface_icons/mute.png'
        : './img/10_interface_icons/volume.png';
}

/** Starts the game and displays the main game screen. */
function startGame() {
    canvas = document.getElementById('canvas');
    document.getElementById('loadingImage').classList.add('hidden');
    document.querySelector('.start-screen-icon').style.display = 'none';
    document.querySelector('.start-screen-icon').onclick = null;
    document.getElementById('gameContainer').style.display = 'block';
    document.querySelector('.legal-notice-section').style.display = 'none';
    document.querySelector('.game-instructions-section').style.display = 'none';
    document.querySelector('.reload-button').classList.remove('hidden');
    document.querySelector('.retry-btn').classList.remove('hidden');
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    keyboard = new Keyboard();
    setupTouchControls();
    bindKeyEvents();
    world = new World(canvas, keyboard);
    world.setMute(isMuted);
    world.init();
    if (world.character) {
        world.character.canMove = true;
    }
    if (isTouchDevice()) {
        handleTouchControlsVisibility();
    }
    checkOrientation();
}

/**
 * Checks if the device supports touch input.
 * @returns {boolean}
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/** Handles the visibility of touch controls based on orientation. */
function handleTouchControlsVisibility() {
    const touchControls = document.getElementById("touchControls");
    const warning = document.getElementById("landscapeWarning");
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
    if (isLandscape) {
        touchControls.style.display = "flex";
    } else {
        warning.style.display = "flex";
    }
}

/** Displays the game over screen and disables input. */
function gameOver() {
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('tryAgainButton').classList.remove('hidden');
    disableUserInput();
    document.getElementById('touchControls').style.display = 'none';
    world.updateCollectedCoinsDisplay();
}

/** Displays the win screen and disables input. */
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

/** Disables user input by unbinding key events. */
function disableUserInput() {
    unbindKeyEvents();
}

/** Opens the info modal. */
function openModal() {
    modal.classList.remove('hidden');
}

/**
 * Closes the info modal.
 */
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

/**
 * Exits fullscreen mode.
 */
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
 * Reloads the current game.
 */
function reloadGame() {
    if (world) {
        world.cleanUp?.();
        world = null;
    }
    window.bossTriggered = false;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    unbindKeyEvents();
    document.getElementById('loadingImage').classList.remove('hidden');
    document.querySelector('.start-screen-icon').style.display = 'inline';
    document.querySelector('.start-screen-icon').onclick = startGame;
    document.querySelector('.legal-notice-section').style.display = 'block';
    document.querySelector('.game-instructions-section').style.display = 'block';
    document.querySelector('.reload-button').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('touchControls').style.display = 'none';
    document.querySelector('.retry-btn').classList.add('hidden');
    setupTouchControls();
    checkOrientation();
}

/**
 * Closes the legal notice overlay.
 */
function closeLegalNotice() {
    document.getElementById('openLegalNotice').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

/**
 * Closes the game instructions overlay.
 */
function closeGameInstructions() {
    document.getElementById('gameInstructions').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

/**
 * Checks screen orientation and adjusts UI accordingly.
 */
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

/**
 * Adds touch and mouse event listeners for a button.
 * @param {string} buttonId - ID of the button element.
 * @param {string} key - Key to toggle in the keyboard object.
 */
function addControlEvents(buttonId, key) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    const activate = () => keyboard[key] = true;
    const deactivate = () => keyboard[key] = false;
    button.addEventListener("touchstart", activate);
    button.addEventListener("touchend", deactivate);
    button.addEventListener("mousedown", activate);
    button.addEventListener("mouseup", deactivate);
}

/**
 * Runs after the DOM content has fully loaded.
 * Initializes modal reference, binds keyboard events, sets up touch controls,
 * and checks screen orientation.
 */
document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('infoModal');
    bindKeyEvents();
    setupTouchControls();
    checkOrientation();
});

/**
 * Closes the info modal if the user clicks outside of its inner container.
 */
document.getElementById('infoModal').addEventListener('click', (e) => {
    const container = document.querySelector('.info-modal-container');
    if (!container.contains(e.target)) {
        closeModal();
    }
});

/**
 * Opens the legal notice modal and disables page scroll when the link is clicked.
 * @param {Event} e - The click event
 */
document.querySelector('.legal-notice-link').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('openLegalNotice').classList.remove('hidden');
    document.body.classList.add('no-scroll');
});

/**
 * Closes the legal notice modal if the user clicks outside of its container.
 * @param {Event} e - The click event
 */
document.getElementById('openLegalNotice').addEventListener('click', e => {
    if (!document.querySelector('.legal-notice-container').contains(e.target)) {
        closeLegalNotice();
    }
});

/**
 * Opens the game instructions modal and disables page scroll when the link is clicked.
 * @param {Event} e - The click event
 */
document.querySelector('.game-instructions-link').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('gameInstructions').classList.remove('hidden');
    document.body.classList.add('no-scroll');
});

/**
 * Closes the game instructions modal if the user clicks outside of its container.
 * @param {Event} e - The click event
 */
document.getElementById('gameInstructions').addEventListener('click', e => {
    if (!document.querySelector('.game-instructions-container').contains(e.target)) {
        closeGameInstructions();
    }
});

/**
 * Re-checks screen orientation when the window is resized.
 */
window.addEventListener("resize", () => {
    checkOrientation();
});

/**
 * Re-checks screen orientation when the device orientation changes.
 */
window.addEventListener("orientationchange", () => {
    checkOrientation();
});

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
        if (world) {
            world.cleanUp?.();
            world = null;
        }
        window.removeEventListener("resize", checkOrientation);
        window.removeEventListener("orientationchange", checkOrientation);
        window.addEventListener("resize", checkOrientation);
        window.addEventListener("orientationchange", checkOrientation);
        window.bossTriggered = false;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        keyboard = new Keyboard();
        setupTouchControls();
        bindKeyEvents();
        world = new World(canvas, keyboard);
        world.setMute(isMuted);
        world.init();
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('winScreen').classList.add('hidden');
        document.getElementById('canvas').style.display = 'block';
        if (world.character) {
            world.character.canMove = true;
        }
        handleTouchControlsVisibility();
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