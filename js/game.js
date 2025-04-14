const DEBUG_MODE = false;

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

/**
 * Initializes the game canvas and world.
 */
function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
    if (isMuted) world.setMute(true);
}

/**
 * Updates the keyboard state based on key press/release.
 * @param {KeyboardEvent} e 
 * @param {boolean} state 
 */
function setKeyboardState(e, state) {
    if (keyMap[e.key] !== undefined) {
        keyboard[keyMap[e.key]] = state;
    }
}

/**
 * Binds keydown and keyup listeners for player input.
 */
function bindKeyEvents() {
    handleKeyDown = (e) => setKeyboardState(e, true);
    handleKeyUp = (e) => setKeyboardState(e, false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

/**
 * Unbinds keydown and keyup listeners.
 */
function unbindKeyEvents() {
    if (handleKeyDown) window.removeEventListener('keydown', handleKeyDown);
    if (handleKeyUp) window.removeEventListener('keyup', handleKeyUp);
}

/**
 * Toggles game audio mute state.
 */
function toggleMute() {
    isMuted = !isMuted;
    updateVolumeIcon();
    if (world) world.setMute(isMuted);
}

/**
 * Updates volume icon based on mute state.
 */
function updateVolumeIcon() {
    const btn = document.getElementById('volume-button');
    btn.src = isMuted
        ? './img/10_interface_icons/mute.png'
        : './img/10_interface_icons/volume.png';
}

/**
 * Updates UI for starting the game.
 */
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

/**
 * Adds screen orientation listeners.
 */
function initGameListeners() {
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
}

/**
 * Initializes game world and input handling.
 */
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

/**
 * Starts the game with UI setup, orientation check and world initialization.
 */
function startGame() {
    canvas = document.getElementById('canvas');
    updateUIForGameStart();
    initGameListeners();
    initWorld();
    if (isTouchDevice()) handleTouchControlsForGameStart();
    checkOrientation();
}

/**
 * Shows or hides touch controls and warnings on game start.
 */
function handleTouchControlsForGameStart() {
    const { touchControls, warning } = getTouchElements();
    const isLandscape = window.innerWidth > window.innerHeight;
    touchControls.style.display = isLandscape ? "flex" : "none";
    warning.style.display = !isLandscape ? "flex" : "none";
}

/**
 * Gets DOM elements related to touch controls.
 * @returns {{ touchControls: HTMLElement, warning: HTMLElement }}
 */
function getTouchElements() {
    return {
        touchControls: document.getElementById("touchControls"),
        warning: document.getElementById("landscapeWarning")
    };
}

/**
 * Checks screen orientation and updates touch control visibility.
 */
function handleTouchControlsVisibility() {
    const { touchControls, warning } = getTouchElements();
    const isTouch = isRealTouchDevice();
    const isLandscape = window.innerWidth > window.innerHeight;
    const isGameRunning = world && world.character && world.character.canMove;
    touchControls.style.display = 'none';
    warning.style.display = 'none';
    if (!isTouch || !isGameRunning) {
        if (isTouch && !isLandscape) warning.style.display = 'flex';
        return;
    }
    touchControls.style.display = isLandscape ? 'flex' : 'none';
    warning.style.display = !isLandscape ? 'flex' : 'none';
}

/**
 * helper functions for detecting touch Devices.
 */
function isRealTouchDevice() {
    const ua = navigator.userAgent;
    const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|Tablet/i.test(ua);
    return isMobileUA && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

/**
 * Detects if the current device is a touch device.
 * @returns {boolean}
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Clears and resets the game world state.
 */
function resetWorld() {
    if (world) {
        world.cleanUp?.();
        world = null;
    }
    window.bossTriggered = false;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Resets all UI elements and interactions to pre-game state.
 */
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

/**
 * Fully reloads the game environment and resets the UI.
 */
function reloadGame() {
    resetWorld();
    resetUIForReload();
    updateFullscreenButtonVisibility();
    setupTouchControls();
    checkOrientation();
}

/**
 * Displays the Game Over screen and disables input.
 */
function gameOver() {
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('tryAgainButton').classList.remove('hidden');
    disableUserInput();
    document.getElementById('touchControls').style.display = 'none';
    world.updateCollectedCoinsDisplay();
}

/**
 * Displays the win screen and stops character interaction.
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
 * Disables all keyboard input.
 */
function disableUserInput() {
    unbindKeyEvents();
}

/**
 * Shows the modal window.
 */
function openModal() {
    modal.classList.remove('hidden');
}

/**
 * Hides the modal window.
 */
function closeModal() {
    modal.classList.add('hidden');
}

/**
 * Checks if the browser is currently in fullscreen mode.
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
 * @param {HTMLElement} elem 
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
 * Toggles fullscreen mode for the canvas container.
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

/**
 * Closes the game instructions overlay.
 */
function closeGameInstructions() {
    document.getElementById('gameInstructions').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

/**
 * Updates touch control visibility based on orientation.
 */
function checkOrientation() {
    handleTouchControlsVisibility();
}

/**
 * Sets up all control event listeners for touch buttons.
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
 * Prevents context menus on all interactive UI elements.
 */
function disableContextMenusOnAllButtons() {
    document.querySelectorAll(
        'button, img, a, .img-icon, .start-screen-icon, .pulse-icon, .legal-notice, .game-instructions'
    ).forEach(el => {
        el.addEventListener('contextmenu', e => e.preventDefault());
    });
}

/**
 * Adds control logic to a touch or mouse button.
 * @param {string} buttonId 
 * @param {string} key 
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

setupEventListeners();