/** Tracks if the game is currently retrying to prevent double-starts. */
let isRetrying = false;

/** Retry the game after Game Over or Win. */
function retryGame() {
    if (isRetrying) return;
    isRetrying = true;

    const retryBtn = document.querySelector('.retry-btn');
    disableRetryButton(retryBtn);

    try {
        resetGameState();
    } catch (error) {
        console.error("Error during retry:", error);
    } finally {
        reenableRetryButton(retryBtn);
    }
}

/**
 * Disables the retry button to avoid spamming.
 * @param {HTMLElement} btn
 */
function disableRetryButton(btn) {
    btn.classList.add('disabled');
    btn.style.pointerEvents = 'none';
}

/**
 * Re-enables retry button after a delay.
 * @param {HTMLElement} btn
 */
function reenableRetryButton(btn) {
    setTimeout(() => {
        isRetrying = false;
        btn.classList.remove('disabled');
        btn.style.pointerEvents = 'auto';
    }, 2000);
}

/** Resets game objects, world state, UI, and listeners. */
function resetGameState() {
    resetWorldForRetry();
    resetBossFlagAndCanvas();
    updateGameListenersForRetry();
    restartWorld();
    updateUIAfterRetry();
}

/** Clean up current world instance. */
function resetWorldForRetry() {
    if (world) {
        world.cleanUp?.();
        world = null;
    }
}

/** Reset canvas and global boss trigger. */
function resetBossFlagAndCanvas() {
    window.bossTriggered = false;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/** Reset orientation listeners for layout consistency. */
function updateGameListenersForRetry() {
    window.removeEventListener("resize", checkOrientation);
    window.removeEventListener("orientationchange", checkOrientation);
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
}

/** Reinitialize input, UI, and world. */
function restartWorld() {
    keyboard = new Keyboard();
    updateFullscreenButtonVisibility();
    setupTouchControls();
    bindKeyEvents();
    createAndInitWorld();
}

/** Create a new World instance and initialize it. */
function createAndInitWorld() {
    world = new World(canvas, keyboard);
    world.setMute(isMuted);
    world.init();
    world.character && (world.character.canMove = true);
}

/** Show game canvas and hide end screens. */
function updateUIAfterRetry() {
    hideElement('gameOverScreen');
    hideElement('winScreen');
    showCanvas();
    handleTouchControlsVisibility();
}

/**
 * Hide a screen by ID.
 * @param {string} id
 */
function hideElement(id) {
    document.getElementById(id).classList.add('hidden');
}

/** Show the main canvas again. */
function showCanvas() {
    document.getElementById('canvas').style.display = 'block';
}
