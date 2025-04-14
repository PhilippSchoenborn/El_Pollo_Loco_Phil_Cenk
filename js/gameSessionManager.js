/**
 * Tracks whether the game is currently retrying.
 * Prevents double-initialization on rapid button presses.
 * @type {boolean}
 */
let isRetrying = false;

/**
 * Fully restarts the game from a Game Over or Win state.
 * Resets world, listeners, UI, and re-initializes the game.
 */
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
 * Clears the current world, resets canvas, and removes boss state.
 */
function resetWorldForRetry() {
    if (world) {
        world.cleanUp?.();
        world = null;
    }
    window.bossTriggered = false;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Removes and re-adds orientation listeners during retry to ensure proper layout.
 */
function updateGameListenersForRetry() {
    window.removeEventListener("resize", checkOrientation);
    window.removeEventListener("orientationchange", checkOrientation);
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
}

/**
 * Reinitializes keyboard, UI, and game world during a retry.
 */
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

/**
 * Resets and displays the main game UI after retrying.
 */
function updateUIAfterRetry() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('canvas').style.display = 'block';
    handleTouchControlsVisibility();
}
