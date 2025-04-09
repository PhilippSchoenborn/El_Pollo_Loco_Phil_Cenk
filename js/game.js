const DEBUG_MODE = false; // Set to true to display hitboxes, false to hide them.

/**
 * Canvas element for rendering the game.
 * @type {HTMLCanvasElement}
 */
let canvas;

/**
 * The main world object controlling the game state.
 * @type {World}
 */
let world;

/**
 * Object representing keyboard input state.
 * @type {Keyboard}
 */
let keyboard = new Keyboard();

/**
 * Indicates whether the game is muted.
 * @type {boolean}
 */
let isMuted = false;

/**
 * Modal element for showing information.
 * @type {HTMLElement}
 */
let modal;

/**
 * Event listener reference for keydown.
 * @type {Function}
 */
let handleKeyDown;

/**
 * Event listener reference for keyup.
 * @type {Function}
 */
let handleKeyUp;

/**
 * Maps key values to keyboard state keys.
 * @type {Object.<string, string>}
 */
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
 * Initializes the game world and canvas.
 */
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

/**
 * Binds keydown and keyup events to window.
 */
function bindKeyEvents() {
    handleKeyDown = e => setKeyboardState(e, true);
    handleKeyUp = e => setKeyboardState(e, false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

/**
 * Removes key event listeners from window.
 */
function unbindKeyEvents() {
    if (handleKeyDown) window.removeEventListener('keydown', handleKeyDown);
    if (handleKeyUp) window.removeEventListener('keyup', handleKeyUp);
}

/**
 * Toggles game audio mute state and updates the icon.
 */
function toggleMute() {
    isMuted = !isMuted;
    updateVolumeIcon();
    if (world) world.setMute(isMuted);
}

/**
 * Updates the mute/volume icon on the button.
 */
function updateVolumeIcon() {
    const btn = document.getElementById('volume-button');
    btn.src = isMuted
        ? './img/10_interface_icons/mute.png'
        : './img/10_interface_icons/volume.png';
}

/**
 * Starts the game and displays the main game screen.
 */
function startGame() {
    canvas = document.getElementById('canvas'); // 🛠️ Re-assign canvas before using it
    document.getElementById('loadingImage').classList.add('hidden');
    document.querySelector('.start-screen-icon').style.display = 'none';
    document.querySelector('.start-screen-icon').onclick = null;
    document.getElementById('gameContainer').style.display = 'block';
    document.querySelector('.legal-notice-section').style.display = 'none';
    document.querySelector('.game-instructions-section').style.display = 'none';
    document.querySelector('.reload-button').classList.remove('hidden');
    document.querySelector('.retry-btn').classList.remove('hidden');

    // 🔥 IMPORTANT: Re-create fresh keyboard
    keyboard = new Keyboard();
    setupTouchControls();

    // ✅ Re-bind key listeners to new keyboard
    bindKeyEvents();

    // 🎮 Create and init world with fresh keyboard
    world = new World(canvas, keyboard);
    world.setMute(isMuted);
    world.init();

    // 🕹️ Just in case
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

/**
 * Handles the visibility of touch controls based on orientation.
 */
function handleTouchControlsVisibility() {
    if (!isTouchDevice()) return;
    if (window.innerWidth > window.innerHeight) {
        document.getElementById("landscapeWarning").style.display = "none";
        document.getElementById("touchControls").setAttribute("style", "display: flex !important");
    } else {
        document.getElementById("landscapeWarning").style.display = "flex";
        document.getElementById("touchControls").style.display = "none";
    }
}

/**
 * Displays the game over screen and disables input.
 */
function gameOver() {
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('tryAgainButton').classList.remove('hidden');
    disableUserInput();
    document.getElementById('touchControls').style.display = 'none';
    world.updateCollectedCoinsDisplay();
}

/**
 * Displays the win screen and disables input.
 */
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

/**
 * Disables user input by unbinding key events.
 */
function disableUserInput() {
    unbindKeyEvents();
}

/**
 * Opens the modal window.
 */
function openModal() {
    modal.style.display = 'block';
}

/**
 * Closes the modal window.
 */
function closeModal() {
    modal.style.display = 'none';
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
    document.getElementById('tryAgainButton').classList.add('hidden');
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('touchControls').style.display = 'none';
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
    const mobileThreshold = 768;
    const isTouch = isTouchDevice();
    if (window.innerWidth < mobileThreshold || isTouch) {
        if (window.innerWidth < window.innerHeight) {
            document.getElementById("landscapeWarning").style.display = "flex";
            document.getElementById("touchControls").style.display = "none";
        } else {
            document.getElementById("landscapeWarning").style.display = "none";
            document.getElementById("touchControls").style.display = "flex";
        }
    } else {
        document.getElementById("landscapeWarning").style.display = "none";
        document.getElementById("touchControls").style.display = "none";
    }
}

/**
 * Sets up touch control event listeners.
 */
function setupTouchControls() {
    addControlEvents("btnLeft", "LEFT");
    addControlEvents("btnRight", "RIGHT");
    addControlEvents("btnJump", "UP");
    addControlEvents("btnThrow", "D");
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

// Event bindings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('infoModal');
    bindKeyEvents();
    setupTouchControls();
    checkOrientation();
});

// Event listener for opening legal notice
document.querySelector('.legal-notice-link').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('openLegalNotice').classList.remove('hidden');
    document.body.classList.add('no-scroll');
});

// Close legal notice on outside click
document.getElementById('openLegalNotice').addEventListener('click', e => {
    if (!document.querySelector('.legal-notice-container').contains(e.target)) {
        closeLegalNotice();
    }
});

// Event listener for opening game instructions
document.querySelector('.game-instructions-link').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('gameInstructions').classList.remove('hidden');
    document.body.classList.add('no-scroll');
});

// Close game instructions on outside click
document.getElementById('gameInstructions').addEventListener('click', e => {
    if (!document.querySelector('.game-instructions-container').contains(e.target)) {
        closeGameInstructions();
    }
});

// Update UI on resize and orientation change
window.addEventListener("resize", () => {
    checkOrientation();
});

window.addEventListener("orientationchange", () => {
    checkOrientation();
});

/**
 * Restarts the game without going to the main menu.
 */
function retryGame() {
    if (world) {
        world.cleanUp?.();
        world = null;
    }
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
    if (isTouchDevice()) {
        handleTouchControlsVisibility();
    }
    checkOrientation();
}
