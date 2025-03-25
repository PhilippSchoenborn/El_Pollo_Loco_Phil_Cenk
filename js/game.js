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

// Example in game.js:

function showInfo() {
    alert('Game Info: Collect coins, throw bottles, defeat enemies, etc.');
  }
  
  function toggleMute() {
    // your audio handling logic
    console.log('Mute toggled');
  }
  
  function toggleFullscreen() {
    let gameContainer = document.getElementById('game-container');
    if (!document.fullscreenElement) {
      gameContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  
  function reloadGame() {
    // Either reload the entire page or reset the game logic
    // location.reload(); // simplest approach
    console.log('Game reloaded');
  }
  
  // Attach event listeners after DOM is loaded
  window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('info-icon').addEventListener('click', showInfo);
    document.getElementById('mute-icon').addEventListener('click', toggleMute);
    document.getElementById('fullscreen-icon').addEventListener('click', toggleFullscreen);
    document.getElementById('reload-icon').addEventListener('click', reloadGame);
  });
  