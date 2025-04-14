/** Initialize all game UI and interaction event listeners. */
function setupEventListeners() {
    setupDOMReadyListener();
    setupModalListeners();
    setupOverlayListeners();
    setupOrientationListeners();
}

/** Wait for DOM load, then init UI, input, and orientation logic. */
function setupDOMReadyListener() {
    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
}

/** Run UI setup logic when DOM is ready. */
function handleDOMContentLoaded() {
    modal = document.getElementById('infoModal');
    bindKeyEvents();
    setupTouchControls();
    checkOrientation();
    updateFullscreenButtonVisibility();
    addOrientationResizeListeners();
    disableContextMenusOnAllButtons();
}

/** Add listeners for fullscreen + touch updates. */
function addOrientationResizeListeners() {
    window.addEventListener("resize", handleResizeAndOrientation);
    window.addEventListener("orientationchange", handleResizeAndOrientation);
}

/** Set up click-to-close behavior for the info modal. */
function setupModalListeners() {
    const modalEl = document.getElementById('infoModal');
    modalEl.addEventListener('click', handleModalClick);
}

/** Close modal when clicking outside its content. */
function handleModalClick(e) {
    const container = document.querySelector('.info-modal-container');
    if (!container.contains(e.target)) closeModal();
}

/** Set up listeners for legal notice & instructions overlays. */
function setupOverlayListeners() {
    setupLegalNoticeOverlay();
    setupGameInstructionsOverlay();
}

/** Setup open/close logic for legal notice overlay. */
function setupLegalNoticeOverlay() {
    document.querySelector('.legal-notice-link').addEventListener('click', (e) => {
        e.preventDefault();
        showOverlay('openLegalNotice');
    });
    document.getElementById('openLegalNotice').addEventListener('click', (e) => {
        const container = document.querySelector('.legal-notice-container');
        if (!container.contains(e.target)) closeLegalNotice();
    });
}

/** Setup open/close logic for instructions overlay. */
function setupGameInstructionsOverlay() {
    document.querySelector('.game-instructions-link').addEventListener('click', (e) => {
        e.preventDefault();
        showOverlay('gameInstructions');
    });
    document.getElementById('gameInstructions').addEventListener('click', (e) => {
        const container = document.querySelector('.game-instructions-container');
        if (!container.contains(e.target)) closeGameInstructions();
    });
}

/** Set up screen orientation-related listeners. */
function setupOrientationListeners() {
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
}

/** Resize/orientation handler to update UI elements. */
function handleResizeAndOrientation() {
    checkOrientation();
    updateFullscreenButtonVisibility();
}

/** Show an overlay and prevent background scroll. */
function showOverlay(id) {
    document.getElementById(id).classList.remove('hidden');
    document.body.classList.add('no-scroll');
}

/** Toggle fullscreen button visibility based on device. */
function updateFullscreenButtonVisibility() {
    const btn = document.getElementById('fullscreen-button');
    if (!btn) return;
    const isPhone = window.innerWidth <= 768 && isTouchDevice();
    btn.style.display = isPhone ? 'none' : 'inline';
}
