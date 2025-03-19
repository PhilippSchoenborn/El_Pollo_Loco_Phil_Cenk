let canvas;
let world;
let keyboard = new Keyboard();

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
}

const keyMap = {
    'ArrowRight': 'RIGHT',
    'ArrowLeft': 'LEFT',
    'ArrowUp': 'UP',
    'ArrowDown': 'DOWN',
    ' ': 'SPACE',
    'd': 'D',
    'D': 'D'
};

function setKeyboardState(e, state) {
    if (keyMap[e.key] !== undefined) {
        keyboard[keyMap[e.key]] = state;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('keydown', (e) => setKeyboardState(e, true));
    window.addEventListener('keyup', (e) => setKeyboardState(e, false));
});