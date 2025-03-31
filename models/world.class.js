/**
 * Represents the main game world, containing the character, enemies, items, and drawing logic.
 */
class World {
    level = level1
    canvas
    ctx
    keyboard
    camera_x = 0
    statusBarCoins = new StatusBarCoins()
    statusBarBottles = new StatusBarBottles()
    throwableObjects = []
    collectableCoins = []
    collectableBottles = []
    gamePaused = false
    soundtrack_sound = new Audio('audio/soundtrack.mp3')
    coin_sound = new Audio('audio/coin.mp3')
    pickup_bottle_sound = new Audio('audio/pickup_bottle.mp3')
    COIN_Y = 350
    COIN_MIN_X = 350
    COIN_MAX_X = 2200
    COIN_SPACING = 120
    COIN_COUNT = 5
    THROW_OFFSET_X = 65
    THROW_OFFSET_Y = 100
    COLLISION_CHECK_INTERVAL = 200
    dWasHeld = false

    /**
     * Initializes the game world.
     * @param {HTMLCanvasElement} canvas - Canvas to render on.
     * @param {Keyboard} keyboard - Keyboard input handler.
     */
    constructor(canvas, keyboard) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.keyboard = keyboard
        this.statusBar = new StatusBar()
        this.character = new Character(this.statusBar)
        this.character.world = this
        this.initSounds()
        this.soundtrack_sound.play()
        this.run()
        this.draw()
        this.spawnCoins()
        this.spawnBottles()
    }

    /**
     * Initializes audio settings.
     */
    initSounds() {
        this.soundtrack_sound.loop = true
        this.soundtrack_sound.volume = 0.05
        this.coin_sound.volume = 0.5
        this.pickup_bottle_sound.volume = 0.5
    }

    /**
     * Mutes or unmutes game audio.
     * @param {boolean} muted - True to mute all sounds, false to unmute.
     */
    setMute(muted) {
        this.soundtrack_sound.muted = muted
        this.coin_sound.muted = muted
        this.pickup_bottle_sound.muted = muted
        if (this.character) {
            this.character.setMute(muted)
        }
    }

    /**
     * Starts the main collision checking interval.
     */
    run() {
        setInterval(() => {
            if (this.gamePaused) return
            this.checkCollisions()
        }, this.COLLISION_CHECK_INTERVAL)
    }

    /**
     * Checks collisions with enemies, coins, and bottles.
     */
    checkCollisions() {
        this.handleEnemyCollisions()
        this.handleCoinCollisions()
        this.handleBottleCollisions()
    }

    /**
     * Handles enemy collisions, stomping, and bottle hits.
     */
    handleEnemyCollisions() {
        this.level.enemies.forEach(enemy => {
            const isColliding = this.character.isColliding(enemy)
            const isStomping = this.character.isAbove(enemy) && this.character.speedY < 0
            if (isColliding) {
                if (isStomping && !(enemy instanceof Endboss)) {
                    this.killEnemy(enemy)
                } else if (!isStomping && !this.character.isInvulnerable) {
                    this.character.hit()
                    this.statusBar.setPercentage(this.character.health)
                }
            }
            this.throwableObjects.forEach((bottle, index) => {
                if (bottle.isColliding(enemy)) {
                    bottle.splash()
                    console.log('💥 Bottle hit enemy:', enemy)
                    if (enemy instanceof Endboss) {
                        if (!enemy.isInvulnerable) {
                            enemy.hitPoints--
                            if (enemy.hitPoints <= 0) {
                                enemy.die()
                            } else {
                                enemy.hit()
                            }
                        }
                    } else {
                        this.killEnemy(enemy)
                    }
                    setTimeout(() => {
                        this.throwableObjects.splice(index, 1)
                    }, 500)
                }
            })
        })
    }

    /**
     * Removes or kills an enemy from the level.
     * @param {Object} enemy - The enemy to remove or kill.
     */
    killEnemy(enemy) {
        if (enemy.die) {
            enemy.die()
            const sound = enemy.death_sound
            const duration = sound?.duration ? sound.duration * 1000 : 500
            setTimeout(() => {
                this.level.enemies = this.level.enemies.filter(e => e !== enemy)
            }, duration)
        } else {
            this.level.enemies = this.level.enemies.filter(e => e !== enemy)
        }
    }

    /**
     * Checks and handles collisions with coins.
     */
    handleCoinCollisions() {
        this.collectableCoins = this.collectableCoins.filter(c => {
            if (this.character.isColliding(c)) {
                this.statusBarCoins.increaseCoins()
                this.coin_sound.play()
                return false
            }
            return true
        })
    }

    /**
     * Checks and handles collisions with bottles.
     */
    handleBottleCollisions() {
        this.collectableBottles = this.collectableBottles.filter(b => {
            if (this.character.isColliding(b)) {
                this.statusBarBottles.increaseBottles()
                this.pickup_bottle_sound.play()
                return false
            }
            return true
        })
    }

    /**
     * Detects a bottle throw input once per key press.
     */
    checkThrowObjects() {
        if (this.keyboard.D && !this.dWasHeld) {
            this.dWasHeld = true
            if (this.statusBarBottles.percentage > 0) {
                this.throwObject()
                this.statusBarBottles.decreaseBottles()
            }
        }
        if (!this.keyboard.D) {
            this.dWasHeld = false
        }
    }

    /**
     * Creates a new ThrowableObject and adds it to the scene.
     */
    throwObject() {
        const x = this.character.x + this.THROW_OFFSET_X
        const y = this.character.y + this.THROW_OFFSET_Y
        this.throwableObjects.push(new ThrowableObject(x, y))
    }

    /**
     * Pauses the game logic.
     */
    pauseGame() {
        this.gamePaused = true
    }

    /**
     * Draw loop that updates the canvas and checks for throw inputs.
     */
    draw() {
        if (this.gamePaused) return
        this.checkThrowObjects()
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.applyCamera(() => this.addObjects([this.level.backgroundObjects]))
        this.drawStatus()
        this.applyCamera(() => {
            this.addObjects([
                this.collectableCoins,
                this.collectableBottles,
                [this.character],
                this.throwableObjects,
                this.level.enemies,
                this.level.clouds
            ])
        })
        requestAnimationFrame(() => this.draw())
    }

    /**
     * Applies camera transformations and restores context afterwards.
     * @param {Function} drawFn - Drawing callback.
     */
    applyCamera(drawFn) {
        this.ctx.save()
        this.ctx.translate(this.camera_x, 0)
        drawFn()
        this.ctx.restore()
    }

    /**
     * Draws status bars on the top of the screen.
     */
    drawStatus() {
        this.addObjects([[this.statusBar, this.statusBarCoins, this.statusBarBottles]])
    }

    /**
     * Adds objects or arrays of objects to be drawn.
     * @param {Array} objectGroups - Arrays of drawable objects.
     */
    addObjects(objectGroups) {
        objectGroups.flat().forEach(obj => this.drawObject(obj))
    }

    /**
     * Draws a MovableObject, flipping if necessary.
     * @param {MovableObject} mo - The object to draw.
     */
    drawObject(mo) {
        this.ctx.save()
        if (mo.otherDirection) {
            this.flipImage(mo)
        }
        mo.draw(this.ctx)
        this.ctx.restore()
    }

    /**
     * Flips an object horizontally before drawing.
     * @param {MovableObject} mo - The object to flip.
     */
    flipImage(mo) {
        this.ctx.translate(mo.x + mo.width / 2, mo.y)
        this.ctx.scale(-1, 1)
        this.ctx.translate(-mo.x - mo.width / 2, -mo.y)
    }

    /**
     * Spawns multiple coins at random positions.
     */
    spawnCoins() {
        this.collectableCoins = []
        let placed = 0
        while (placed < this.COIN_COUNT) {
            let x = this.randomX()
            if (!this.checkOverlap(x)) {
                this.collectableCoins.push(new CollectableCoins(x, this.COIN_Y))
                placed++
            }
        }
    }

    /**
     * Spawns multiple bottles at random positions.
     */
    spawnBottles() {
        const fixedY = 350
        const bottleCount = 6
        this.collectableBottles = []
        let placed = 0
        while (placed < bottleCount) {
            let x = 250 + Math.random() * 2200
            if (!this.checkBottleOverlap(x)) {
                this.collectableBottles.push(new CollectableBottle(x, fixedY))
                placed++
            }
        }
    }

    /**
     * Returns a random x position for a coin within defined bounds.
     * @returns {number}
     */
    randomX() {
        return this.COIN_MIN_X + Math.random() * (this.COIN_MAX_X - this.COIN_MIN_X)
    }

    /**
     * Checks overlap for coins to avoid placing them too close.
     * @param {number} x - X position.
     * @returns {boolean}
     */
    checkOverlap = x => this.collectableCoins.some(c => Math.abs(x - c.x) < this.COIN_SPACING)

    /**
     * Checks overlap for bottles to avoid placing them too close.
     * @param {number} x - X position.
     * @returns {boolean}
     */
    checkBottleOverlap = x => this.collectableBottles.some(b => Math.abs(x - b.x) < 120)
}
