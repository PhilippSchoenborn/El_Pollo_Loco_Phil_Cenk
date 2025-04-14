/**
 * Initializes all event listeners required for the game's UI and interactions.
 * Organizes listeners into modular functions for maintainability.
 */
function setupEventListeners() {
    setupDOMReadyListener();
    setupModalListeners();
    setupOverlayListeners();
    setupOrientationListeners();
}

/**
 * Sets up the DOMContentLoaded listener to initialize key UI elements,
 * input controls, orientation behavior, and UI visibility updates.
 */
function setupDOMReadyListener() {
    document.addEventListener('DOMContentLoaded', () => {
        modal = document.getElementById('infoModal');
        bindKeyEvents();
        setupTouchControls();
        checkOrientation();
        updateFullscreenButtonVisibility();
        window.addEventListener("resize", handleResizeAndOrientation);
        window.addEventListener("orientationchange", handleResizeAndOrientation);
        disableContextMenusOnAllButtons();
    });
}

/**
 * Sets up modal click-to-close behavior for the info modal.
 */
function setupModalListeners() {
    document.getElementById('infoModal').addEventListener('click', (e) => {
        const container = document.querySelector('.info-modal-container');
        if (!container.contains(e.target)) {
            closeModal();
        }
    });
}

/**
 * Sets up event listeners for opening and closing the legal notice
 * and game instruction overlays.
 */
function setupOverlayListeners() {
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
}

/**
 * Sets up additional window listeners for resize and orientation changes,
 * ensuring responsive behavior outside of DOMContentLoaded.
 */
function setupOrientationListeners() {
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
}

/**
 * Handles both window resize and orientation change events
 * to update fullscreen button visibility and touch control layout.
 */
function handleResizeAndOrientation() {
    checkOrientation();
    updateFullscreenButtonVisibility();
}

/**
 * Updates the fullscreen button's visibility depending on screen size and touch input.
 * Hides the button on small touch devices (phones).
 */
function updateFullscreenButtonVisibility() {
    const fullscreenButton = document.getElementById('fullscreen-button');
    if (!fullscreenButton) return;
    const isPhone = window.innerWidth <= 768 && isTouchDevice();
    fullscreenButton.style.display = isPhone ? 'none' : 'inline';
}
