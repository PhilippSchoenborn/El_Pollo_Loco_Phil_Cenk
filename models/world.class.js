/**
 * Represents the entire game world including canvas rendering,
 * game logic, object handling, collisions, and sounds.
 */
class World {
    canvas;
    ctx;
    keyboard;
    level;
    camera_x = 0;
    statusBarCoins = new StatusBarCoins();
    statusBarBottles = new StatusBarBottles();
    throwableObjects = [];
    collectableCoins = [];
    collectableBottles = [];
    gamePaused = false;
    soundtrack_sound = new Audio('audio/soundtrack.mp3');
    coin_sound = new Audio('audio/coin.mp3');
    pickup_bottle_sound = new Audio('audio/pickup_bottle.mp3');
    bossMusic = new Audio('audio/EndbossSoundtrack.mp3');
    COIN_Y = 350;
    COIN_MIN_X = 350;
    COIN_MAX_X = 2200;
    COIN_SPACING = 120;
    COIN_COUNT = 5;
    THROW_OFFSET_X = 65;
    THROW_OFFSET_Y = 100;
    COLLISION_CHECK_INTERVAL = 40;
    dWasHeld = false;
    lastThrowTime = 0;
    throwCooldown = 1000;
    collectedCoinsCount = 0;

    /**
     * Creates a new World instance.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     * @param {Keyboard} keyboard - The keyboard input object.
     */
    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.level = createLevel1();
        this.statusBar = new StatusBar();
        this.character = new Character(this.statusBar);
        this.character.world = this;
        this.endboss = new Endboss(3400);
    }

    /**
     * Initializes the world: sounds, collisions, rendering, spawns.
     */
    init() {
        this.level.enemies.forEach(e => e.initMovement?.());
        this.initSounds();
        this.soundtrack_sound.play();
        this.run();
        this.draw();
        this.spawnCoins();
        this.spawnBottles();
    }

    /**
     * Sets up sound settings (volume, loop).
     */
    initSounds() {
        this.soundtrack_sound.loop = true;
        this.soundtrack_sound.volume = 0.05;
        this.bossMusic.loop = true;
        this.bossMusic.volume = 0.2;
        this.coin_sound.volume = 0.5;
        this.pickup_bottle_sound.volume = 0.5;
    }

    /**
     * Mutes or unmutes all sounds.
     * @param {boolean} muted 
     */
    setMute(muted) {
        [this.soundtrack_sound, this.coin_sound, this.pickup_bottle_sound, this.bossMusic].forEach(s => s.muted = muted);
        this.level.enemies.forEach(enemy => enemy.setMute?.(muted));
        this.throwableObjects.forEach(obj => obj.setMute?.(muted));
        this.character.setMute(muted);
    }



    /**
     * Begins the game loop for collisions and boss activation.
     */
    run() {
        setInterval(() => {
            if (!this.gamePaused) {
                this.checkCollisions();
                this.checkBossTrigger();
            }
        }, this.COLLISION_CHECK_INTERVAL);
    }

    /**
     * Checks all types of collisions in the game.
     */
    checkCollisions() {
        this.handleEnemyCollisions();
        this.handleCoinCollisions();
        this.handleBottleCollisions();
    }

    /**
     * Handles collision with each enemy.
     */
    handleEnemyCollisions() {
        this.level.enemies.forEach(enemy => this.processEnemyCollision(enemy));
    }

    /**
     * Handles a specific enemy collision with the character or throwable.
     * @param {Enemy} enemy 
     */
    processEnemyCollision(enemy) {
        if (enemy.dead) return;
        if (this.character.isColliding(enemy)) {
            this.character.isInvulnerable
                ? null
                : this.isStompingOn(enemy)
                    ? this.handleJumpOnEnemy(enemy)
                    : this.handleTouchEnemy(enemy);
        }
        this.handleThrowableCollision(enemy);
    }

    /**
     * Executes bounce/jump logic when stomping an enemy.
     * @param {Enemy} enemy 
     */
    handleJumpOnEnemy(enemy) {
        if (enemy instanceof Endboss) return;
        this.character.isInvulnerable = true;
        this.killEnemy(enemy);
        this.character.speedY = 15;
        this.character.bounce_sound.currentTime = 0;
        this.character.bounce_sound.play();
        setTimeout(() => this.character.isInvulnerable = false, 300);
    }

    /**
     * Checks if the character is stomping down on the enemy.
     * @param {Enemy} enemy 
     * @returns {boolean}
     */
    isStompingOn(enemy) {
        const tolerance = 30;
        return this.character.bottom() <= enemy.top() + tolerance && this.character.speedY < 0;
    }

    /**
     * Handles damage to the character when touched by an enemy.
     * @param {Enemy} enemy 
     */
    handleTouchEnemy(enemy) {
        if (enemy instanceof Endboss) enemy.doAttack();
        this.character.hit();
        this.statusBar.setPercentage(this.character.health);
    }

    /**
     * Handles bottles colliding with an enemy.
     * @param {Enemy} enemy 
     */
    handleThrowableCollision(enemy) {
        this.throwableObjects.forEach((bottle, i) => {
            if (!bottle.hasHit && bottle.isColliding(enemy)) {
                bottle.hasHit = true;
                bottle.splash();
                if (enemy instanceof Endboss) {
                    enemy.hit();
                } else {
                    this.killEnemy(enemy);
                }
                setTimeout(() => {
                    this.throwableObjects.splice(i, 1);
                }, 300);
            }
        });
    }

    /**
     * Kills an enemy and removes it from the level.
     * @param {Enemy} enemy 
     */
    killEnemy(enemy) {
        if (enemy.die) {
            enemy.die();
            const delay = enemy.death_sound?.duration ? enemy.death_sound.duration * 1000 : 500;
            setTimeout(() => {
                this.level.enemies = this.level.enemies.filter(e => e !== enemy);
            }, delay);
        } else {
            this.level.enemies = this.level.enemies.filter(e => e !== enemy);
        }
    }

    /**
     * Handles collisions between character and coins.
     */
    handleCoinCollisions() {
        this.collectableCoins = this.collectableCoins.filter(coin => {
            if (this.character.isColliding(coin)) {
                this.collectedCoinsCount++;
                this.statusBarCoins.increaseCoins();
                this.coin_sound.play();
                this.updateCollectedCoinsDisplay();
                return false;
            }
            return true;
        });
    }

    /**
     * Handles collisions between character and bottles.
     */
    handleBottleCollisions() {
        this.collectableBottles = this.collectableBottles.filter(bottle => {
            if (this.character.isColliding(bottle)) {
                this.statusBarBottles.increaseBottles();
                this.pickup_bottle_sound.play();
                return false;
            }
            return true;
        });
    }

    /**
     * Checks if D is pressed and handles throwing bottles.
     */
    checkThrowObjects() {
        const now = Date.now();
        if (this.keyboard.D && !this.dWasHeld) {
            this.dWasHeld = true;
            if ((now - this.lastThrowTime) >= this.throwCooldown && this.statusBarBottles.percentage > 0) {
                this.throwObject();
                this.statusBarBottles.decreaseBottles();
                this.lastThrowTime = now;
            }
        }
        if (!this.keyboard.D) this.dWasHeld = false;
    }

    /**
     * Throws a new bottle object from character's position.
     */
    throwObject() {
        const facingLeft = this.character.otherDirection;
        const x = this.character.x + (facingLeft ? -30 : 65);
        const y = this.character.y + 100;
        const bottle = new ThrowableObject(x, y, facingLeft);
        bottle.setMute?.(this.soundtrack_sound.muted);
        this.throwableObjects.push(bottle);
    }


    /**
     * Pauses the entire game.
     */
    pauseGame() {
        this.gamePaused = true;
    }

    /**
     * Starts draw loop.
     */
    draw() {
        if (this.gamePaused) return;
        this.clearCanvas();
        this.handleObjectsDrawing();
        requestAnimationFrame(() => this.draw());
    }

    /**
     * Clears the canvas.
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Handles drawing of all game objects and layers.
     */
    handleObjectsDrawing() {
        this.checkThrowObjects();
        this.applyCamera(() => this.addObjects([this.level.backgroundObjects, this.level.clouds]));
        this.drawStatus();
        this.applyCamera(() => this.addObjects([
            this.level.clouds,
            this.collectableCoins,
            this.collectableBottles,
            [this.character],
            this.throwableObjects,
            this.level.enemies
        ]));
    }

    /**
     * Applies camera offset while drawing.
     * @param {Function} drawFn 
     */
    applyCamera(drawFn) {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        drawFn();
        this.ctx.restore();
    }

    /**
     * Draws status bars.
     */
    drawStatus() {
        this.addObjects([[this.statusBar, this.statusBarCoins, this.statusBarBottles]]);
    }

    /**
     * Draws multiple objects.
     * @param {Array<Array<Object>>} groups 
     */
    addObjects(groups) {
        groups.flat().forEach(obj => this.drawObject(obj));
    }

    /**
     * Draws a single object to the canvas.
     * @param {Object} obj 
     */
    drawObject(obj) {
        this.ctx.save();
        if (obj.otherDirection) this.flipImage(obj);
        obj.draw(this.ctx);
        if (DEBUG_MODE && typeof obj.drawHitbox === 'function') {
            obj.drawHitbox(this.ctx);
        }
        this.ctx.restore();
    }

    /**
     * Flips image horizontally.
     * @param {Object} obj 
     */
    flipImage(obj) {
        this.ctx.translate(obj.x + obj.width / 2, obj.y);
        this.ctx.scale(-1, 1);
        this.ctx.translate(-obj.x - obj.width / 2, -obj.y);
    }

    /**
     * Spawns random coin objects.
     */
    spawnCoins() {
        this.collectableCoins = [];
        let placed = 0;
        while (placed < this.COIN_COUNT) {
            const x = this.randomX();
            if (!this.checkOverlap(x)) {
                this.collectableCoins.push(new CollectableCoins(x, this.COIN_Y));
                placed++;
            }
        }
    }

    /**
     * Spawns collectible bottles in the world.
     */
    spawnBottles() {
        this.collectableBottles = [];
        let placed = 0;
        while (placed < 5) {
            const x = 250 + Math.random() * 2200;
            if (!this.checkBottleOverlap(x)) {
                this.collectableBottles.push(new CollectableBottle(x, 350));
                placed++;
            }
        }
    }

    /**
     * Generates a random valid coin X position.
     * @returns {number}
     */
    randomX() {
        return this.COIN_MIN_X + Math.random() * (this.COIN_MAX_X - this.COIN_MIN_X);
    }

    /**
     * Checks if a coin overlaps an existing one.
     * @param {number} x 
     * @returns {boolean}
     */
    checkOverlap(x) {
        return this.collectableCoins.some(c => Math.abs(x - c.x) < this.COIN_SPACING);
    }

    /**
     * Checks if a bottle overlaps an existing one.
     * @param {number} x 
     * @returns {boolean}
     */
    checkBottleOverlap(x) {
        return this.collectableBottles.some(b => Math.abs(x - b.x) < 120);
    }

    /**
     * Triggers boss if player reaches threshold.
     */
    checkBossTrigger() {
        if (!window.bossTriggered && this.character.x >= 2800) {
            window.bossTriggered = true;
            this.character.canMove = false;
            this.soundtrack_sound.pause();
            this.soundtrack_sound.currentTime = 0;
            this.level.enemies.push(this.endboss);
            this.endboss.setMute?.(this.soundtrack_sound.muted);
            this.endboss.doEntrance();
        }
    }

    /**
     * Plays boss music.
     */
    startBossMusic() {
        this.bossMusic.play();
    }

    /**
     * Unfreezes player movement.
     */
    unfreezePlayer() {
        this.character.canMove = true;
    }

    /**
     * Updates the coin counter on game over/win screens.
     */
    updateCollectedCoinsDisplay() {
        const msg = `You have collected ${this.collectedCoinsCount} / ${this.COIN_COUNT} coins!`;
        document.getElementById('collectedCoinsGameOver').textContent = msg;
        document.getElementById('collectedCoinsWin').textContent = msg;
    }

    /**
     * Cleans up sounds and pauses game.
     */
    cleanUp() {
        this.pauseGame();
        this.setMute(true);
        this.soundtrack_sound.pause();
        this.soundtrack_sound.currentTime = 0;
        this.bossMusic.pause();
        this.bossMusic.currentTime = 0;
        this.character?.stopAllSounds?.();
    }
}
