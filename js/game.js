/**
 * Initializes the global canvas and world, sets mute if needed.
 */
let canvas
let world
let keyboard = new Keyboard()
let isMuted = false
let modal
let handleKeyDown
let handleKeyUp

/**
 * Initializes the canvas and the game world.
 */
function init() {
    canvas = document.getElementById('canvas')
    world = new World(canvas, keyboard)
    if (isMuted && world) {
        world.setMute(true)
    }
}

/**
 * Maps keys to keyboard states.
 */
const keyMap = {
    ArrowRight: 'RIGHT',
    ArrowLeft: 'LEFT',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ' ': 'SPACE',
    d: 'D',
    D: 'D'
}

/**
 * Updates keyboard state for a pressed or released key.
 * @param {KeyboardEvent} e - The keyboard event object.
 * @param {boolean} state - True if key is pressed, false if released.
 */
function setKeyboardState(e, state) {
    if (keyMap[e.key] !== undefined) {
        keyboard[keyMap[e.key]] = state
    }
}

document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('infoModal')
    handleKeyDown = e => setKeyboardState(e, true)
    handleKeyUp = e => setKeyboardState(e, false)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
})

/**
 * Toggles the mute state and updates the icon and world sound.
 */
function toggleMute() {
    const volumeButton = document.getElementById('volume-button')
    isMuted = !isMuted
    volumeButton.src = isMuted
        ? './img/10_interface_icons/mute.png'
        : './img/10_interface_icons/volume.png'
    if (world) {
        world.setMute(isMuted)
    }
}

/**
 * Starts the game by hiding the start screen and showing the game container.
 */
function startGame() {
    const loadingImage = document.getElementById('loadingImage')
    const gameContainer = document.getElementById('gameContainer')
    const startButton = document.querySelector('.start-screen-icon')
    const legalButton = document.querySelector('.legal-notice-section')
    loadingImage.classList.add('hidden')
    startButton.style.display = 'none'
    startButton.onclick = null
    gameContainer.style.display = 'block'
    legalButton.style.display = 'none'
    init()
    if (isMuted && world) {
        world.setMute(true)
    }
    document.querySelector('.reload-button').classList.remove('hidden')
}

/**
 * Shows the game over screen and disables user input.
 */
function gameOver() {
    const gameOverScreen = document.getElementById('gameOverScreen')
    const tryAgainButton = document.getElementById('tryAgainButton')
    gameOverScreen.classList.remove('hidden')
    tryAgainButton.classList.remove('hidden')
    disableUserInput()
}

/**
 * Shows the winning screen, disables user input, and pauses the game if possible.
 */
function win() {
    disableUserInput();
    if (world && world.character) {
        world.character.dead = true;
        world.character.stopSnoring();
    }
    if (world && typeof world.pauseGame === 'function') {
        world.pauseGame();
    }
    const winScreen = document.getElementById('winScreen');
    const winAgainButton = document.getElementById('winAgainButton');
    winScreen.classList.remove('hidden');
    winAgainButton.classList.remove('hidden');
}

/**
 * Removes key listeners to disable user input.
 */
function disableUserInput() {
    if (handleKeyDown) {
        window.removeEventListener('keydown', handleKeyDown)
    }
    if (handleKeyUp) {
        window.removeEventListener('keyup', handleKeyUp)
    }
}

document.querySelector('.legal-notice-link').addEventListener('click', function (event) {
    event.preventDefault()
    document.getElementById('openLegalNotice').classList.remove('hidden')
    document.body.classList.add('no-scroll')
})

document.getElementById('openLegalNotice').addEventListener('click', function (event) {
    const legalNoticeContainer = document.querySelector('.legal-notice-container')
    if (!legalNoticeContainer.contains(event.target)) {
        document.getElementById('openLegalNotice').classList.add('hidden')
        document.body.classList.remove('no-scroll')
    }
})

document.querySelector('.game-instructions-link').addEventListener('click', function (event) {
    event.preventDefault()
    document.getElementById('gameInstructions').classList.remove('hidden')
    document.body.classList.add('no-scroll')
})

document.getElementById('gameInstructions').addEventListener('click', function (event) {
    const legalNoticeContainer = document.querySelector('.game-instructions-container')
    if (!legalNoticeContainer.contains(event.target)) {
        document.getElementById('gameInstructions').classList.add('hidden')
        document.body.classList.remove('no-scroll')
    }
})

/**
 * Opens the controls modal.
 */
function openModal() {
    modal.style.display = 'block'
}

/**
 * Closes the controls modal.
 */
function closeModal() {
    modal.style.display = 'none'
}

/**
 * Checks if the browser is in fullscreen mode.
 * @returns {boolean}
 */
function isFullscreen() {
    return document.fullscreenElement
        || document.mozFullScreenElement
        || document.webkitFullscreenElement
        || document.msFullscreenElement
}

/**
 * Requests fullscreen on a specific element.
 * @param {HTMLElement} elem - The element to go fullscreen.
 */
function requestFullscreen(elem) {
    if (elem.requestFullscreen) elem.requestFullscreen()
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen()
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen()
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen()
}

/**
 * Exits fullscreen if active.
 */
function exitFullscreen() {
    if (document.exitFullscreen) document.exitFullscreen()
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen()
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    else if (document.msExitFullscreen) document.msExitFullscreen()
}

/**
 * Toggles fullscreen on the canvas container.
 */
function toggleFullscreen() {
    const canvasContainer = document.querySelector('.canvas-container')
    isFullscreen() ? exitFullscreen() : requestFullscreen(canvasContainer)
}

/**
 * Reloads the entire game.
 */
function reloadGame() {
    location.reload()
}
