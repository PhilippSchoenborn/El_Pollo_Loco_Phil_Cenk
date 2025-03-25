let canvas;
let world;
let keyboard = new Keyboard();

// Track global mute state
let isMuted = false;

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
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

function setKeyboardState(e, state) {
    if (keyMap[e.key] !== undefined) {
        keyboard[keyMap[e.key]] = state;
    }
}

function openModal() {
    let modal = document.getElementById('info-modal');
    modal.style.display = 'flex';
}

function closeModal() {
    let modal = document.getElementById('info-modal');
    modal.style.display = 'none';
}

// Toggle mute
function toggleMute() {
    // Flip the global mute state
    isMuted = !isMuted;
    let muteIcon = document.getElementById('mute-icon');

    if (isMuted) {
        // Switch to the "mute" icon
        muteIcon.src = './img/10_interface_icons/mute.png';
    } else {
        // Switch to the "volume" icon (or whatever unmuted icon you use)
        muteIcon.src = './img/10_interface_icons/volume.png';
    }

    // Tell the world to mute/unmute all its sounds
    // (Only works if 'world' is already created, i.e. after init())
    if (world) {
        world.setMute(isMuted);
    }
}

function toggleFullscreen() {
    let gameContainer = document.getElementById('game-container');
    if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
    ) {
        if (gameContainer.requestFullscreen) {
            gameContainer.requestFullscreen();
        } else if (gameContainer.webkitRequestFullscreen) {
            gameContainer.webkitRequestFullscreen();
        } else if (gameContainer.mozRequestFullScreen) {
            gameContainer.mozRequestFullScreen();
        } else if (gameContainer.msRequestFullscreen) {
            gameContainer.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function reloadGame() {
    location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('keydown', (e) => setKeyboardState(e, true));
    window.addEventListener('keyup', (e) => setKeyboardState(e, false));

    // Icon listeners
    document.getElementById('info-icon').addEventListener('click', openModal);
    document.getElementById('mute-icon').addEventListener('click', toggleMute);
    document.getElementById('fullscreen-icon').addEventListener('click', toggleFullscreen);
    document.getElementById('reload-icon').addEventListener('click', reloadGame);
    document.getElementById('close-modal').addEventListener('click', closeModal);

    // Close modal when clicking outside the modal content
    document.getElementById('info-modal').addEventListener('click', (e) => {
        if (e.target.id === 'info-modal') {
            closeModal();
        }
    });
});
