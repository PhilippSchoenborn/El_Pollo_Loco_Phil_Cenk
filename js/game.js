let canvas;
let world;
let keyboard = new Keyboard();
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

function toggleMute() {
    let muteIcon = document.getElementById('mute-icon');
    // Flip the boolean
    isMuted = !isMuted;
    
    if (isMuted) {
        muteIcon.src = './img/10_interface_icons/mute.png';
        document.querySelectorAll('audio').forEach(a => a.muted = true);

    } else {
        muteIcon.src = './img/10_interface_icons/volume.png';
        backgroundSound.muted = false;
        document.querySelectorAll('audio').forEach(a => a.muted = false);
    }
}


function toggleFullscreen() {
    let gameContainer = document.getElementById('game-container');
    if (!document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement) {
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
    window.addEventListener('keydown', e => setKeyboardState(e, true));
    window.addEventListener('keyup', e => setKeyboardState(e, false));
    document.getElementById('info-icon').addEventListener('click', openModal);
    document.getElementById('mute-icon').addEventListener('click', toggleMute);
    document.getElementById('fullscreen-icon').addEventListener('click', toggleFullscreen);
    document.getElementById('reload-icon').addEventListener('click', reloadGame);
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('info-modal').addEventListener('click', e => {
        if (e.target.id === 'info-modal') {
            closeModal();
        }
    });
});
