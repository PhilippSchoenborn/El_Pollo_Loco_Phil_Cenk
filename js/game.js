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
    if (isTouchDevice()) handleTouchControlsVisibility();
}

function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

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
    document.getElementById('winAgainButton').classList.remove('hidden');
    document.getElementById('touchControls').style.display = 'none';
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

function setupTouchControls() {
    const btnLeft = document.getElementById("btnLeft");
    const btnRight = document.getElementById("btnRight");
    const btnJump = document.getElementById("btnJump");
    const btnThrow = document.getElementById("btnThrow");

    btnLeft.addEventListener("touchstart", () => keyboard.LEFT = true);
    btnLeft.addEventListener("touchend", () => keyboard.LEFT = false);
    btnLeft.addEventListener("mousedown", () => keyboard.LEFT = true);
    btnLeft.addEventListener("mouseup", () => keyboard.LEFT = false);

    btnRight.addEventListener("touchstart", () => keyboard.RIGHT = true);
    btnRight.addEventListener("touchend", () => keyboard.RIGHT = false);
    btnRight.addEventListener("mousedown", () => keyboard.RIGHT = true);
    btnRight.addEventListener("mouseup", () => keyboard.RIGHT = false);

    btnJump.addEventListener("touchstart", () => keyboard.UP = true);
    btnJump.addEventListener("touchend", () => keyboard.UP = false);
    btnJump.addEventListener("mousedown", () => keyboard.UP = true);
    btnJump.addEventListener("mouseup", () => keyboard.UP = false);

    btnThrow.addEventListener("touchstart", () => keyboard.D = true);
    btnThrow.addEventListener("touchend", () => keyboard.D = false);
    btnThrow.addEventListener("mousedown", () => keyboard.D = true);
    btnThrow.addEventListener("mouseup", () => keyboard.D = false);
}

// === DOM Ready ===
document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('infoModal');
    bindKeyEvents();
    setupTouchControls();
    checkOrientation(); // Show landscape warning immediately
});

// === Legal Notice Events ===
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

// === Game Instructions Events ===
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

// === Resize & Orientation Watchers ===
window.addEventListener("resize", () => {
    checkOrientation(); // Always check orientation
});

window.addEventListener("orientationchange", () => {
    checkOrientation(); // Always check orientation
});
