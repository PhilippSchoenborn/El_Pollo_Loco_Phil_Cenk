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
    bossMusic = new Audio('audio/EndbossSoundtrack.mp3')
    COIN_Y = 350
    COIN_MIN_X = 350
    COIN_MAX_X = 2200
    COIN_SPACING = 120
    COIN_COUNT = 5
    THROW_OFFSET_X = 65
    THROW_OFFSET_Y = 100
    COLLISION_CHECK_INTERVAL = 200
    dWasHeld = false
    lastThrowTime = 0
    throwCooldown = 1000
    collectedCoinsCount = 0;

    /**
     * Constructs the game world with a character, boss, etc.
     * @param {HTMLCanvasElement} canvas
     * @param {Keyboard} keyboard
     */
    constructor(canvas, keyboard) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.keyboard = keyboard
        this.statusBar = new StatusBar()
        this.character = new Character(this.statusBar)
        this.character.world = this
        this.endboss = new Endboss(3400)
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
        this.bossMusic.loop = true
        this.bossMusic.volume = 0.2
        this.coin_sound.volume = 0.5
        this.pickup_bottle_sound.volume = 0.5
    }

    /**
     * Mutes or unmutes all game sounds.
     * @param {boolean} muted
     */
    setMute(muted) {
        this.soundtrack_sound.muted = muted
        this.coin_sound.muted = muted
        this.pickup_bottle_sound.muted = muted
        this.bossMusic.muted = muted
        this.character.setMute(muted)
    }

    /**
     * Main interval for checking collisions and boss trigger.
     */
    run() {
        setInterval(() => {
            if (this.gamePaused) return
            this.checkCollisions()
            this.checkBossTrigger()
        }, this.COLLISION_CHECK_INTERVAL)
    }

    /**
     * Checks collisions with enemies, coins, bottles.
     */
    checkCollisions() {
        this.handleEnemyCollisions()
        this.handleCoinCollisions()
        this.handleBottleCollisions()
    }

    /**
     * Handles collisions with enemies, including the Endboss.
     */
    handleEnemyCollisions() {
        this.level.enemies.forEach(enemy => {
            const isColliding = this.character.isColliding(enemy)
            const isStomping = this.character.isAbove(enemy) && this.character.speedY < 0
            if (isColliding) {
                if (isStomping && !(enemy instanceof Endboss)) {
                    this.killEnemy(enemy)
                } else if (!isStomping && !this.character.isInvulnerable) {
                    if (enemy instanceof Endboss) {
                        enemy.doAttack()
                    }
                    this.character.hit()
                    this.statusBar.setPercentage(this.character.health)
                }
            }
            this.throwableObjects.forEach((bottle, index) => {
                if (bottle.isColliding(enemy)) {
                    bottle.splash()
                    if (enemy instanceof Endboss) {
                        if (enemy.hitPoints > 0) {
                            enemy.hit()
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
     * Removes an enemy from the level or calls its die() method.
     * @param {Object} enemy
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
        this.collectableCoins = this.collectableCoins.filter(coin => {
            if (this.character.isColliding(coin)) {
                this.collectedCoinsCount++;
                this.statusBarCoins.increaseCoins();
                this.coin_sound.play();
                this.updateCollectedCoinsDisplay();
                return false; // Entfernt die eingesammelte Münze aus dem Array
            }
            return true;
        });
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
     * Detects a bottle throw input with a cooldown timer.
     */
    checkThrowObjects() {
        if (this.keyboard.D && !this.dWasHeld) {
            this.dWasHeld = true
            let now = Date.now()
            if ((now - this.lastThrowTime) >= this.throwCooldown) {
                if (this.statusBarBottles.percentage > 0) {
                    this.throwObject()
                    this.statusBarBottles.decreaseBottles()
                }
                this.lastThrowTime = now
            }
        }
        if (!this.keyboard.D) {
            this.dWasHeld = false
        }
    }

    /**
     * Creates a new bottle thrown in the direction Pepe faces.
     */
    throwObject() {
        const facingLeft = this.character.otherDirection
        const offsetX = facingLeft ? -30 : 65
        const offsetY = 100
        const x = this.character.x + offsetX
        const y = this.character.y + offsetY
        const bottle = new ThrowableObject(x, y, facingLeft)
        this.throwableObjects.push(bottle)
    }

    /**
     * Pauses the game logic.
     */
    pauseGame() {
        this.gamePaused = true
    }

    /**
     * Draw loop for updating the canvas.
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
     * Applies camera transformations and restores context.
     * @param {Function} drawFn
     */
    applyCamera(drawFn) {
        this.ctx.save()
        this.ctx.translate(this.camera_x, 0)
        drawFn()
        this.ctx.restore()
    }

    /**
     * Draws status bars.
     */
    drawStatus() {
        this.addObjects([[this.statusBar, this.statusBarCoins, this.statusBarBottles]])
    }

    /**
     * Adds objects or arrays of objects to be drawn.
     * @param {Array} objectGroups
     */
    addObjects(objectGroups) {
        objectGroups.flat().forEach(obj => this.drawObject(obj))
    }

    /**
     * Draws a MovableObject, flipping if needed.
     * @param {MovableObject} mo
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
     * @param {MovableObject} mo
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
     * Returns a random x position.
     * @returns {number}
     */
    randomX() {
        return this.COIN_MIN_X + Math.random() * (this.COIN_MAX_X - this.COIN_MIN_X)
    }

    checkOverlap = x => this.collectableCoins.some(c => Math.abs(x - c.x) < this.COIN_SPACING)
    checkBottleOverlap = x => this.collectableBottles.some(b => Math.abs(x - b.x) < 120)

    /**
     * If Pepe crosses x=2800, freeze him, remove main music, add boss, start entrance.
     */
    checkBossTrigger() {
        if (!window.bossTriggered && this.character.x >= 2800) {
            window.bossTriggered = true
            this.character.canMove = false
            this.soundtrack_sound.pause()
            this.soundtrack_sound.currentTime = 0
            this.level.enemies.push(this.endboss)
            this.endboss.doEntrance()
        }
    }

    /**
     * Called by the boss after alert, starts EndbossSoundtrack.
     */
    startBossMusic() {
        this.bossMusic.play()
    }

    /**
     * Called by the boss after alert, unfreezes player.
     */
    unfreezePlayer() {
        this.character.canMove = true
    }

    updateCollectedCoinsDisplay() {
        const totalCoins = this.COIN_COUNT;
        document.getElementById('collectedCoinsGameOver').textContent = `You have collected ${this.collectedCoinsCount} / ${totalCoins} coins!`;
        document.getElementById('collectedCoinsWin').textContent = `You have collected ${this.collectedCoinsCount} / ${totalCoins} coins!`;
    }
}
