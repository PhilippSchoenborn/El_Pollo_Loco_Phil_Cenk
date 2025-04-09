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
    statusBar;
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
     * Creates an instance of the game world.
     * 
     * Initializes the canvas context, input controls, game level, UI elements,
     * and core characters including the player and the endboss.
     * Links the character to the current world instance.
     * 
     * @param {HTMLCanvasElement} canvas - The canvas element used to render the game.
     * @param {Object} keyboard - An object handling keyboard input for character control.
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
     * Initializes the game world.
     * 
     * Starts enemy movement, sound settings, background music, and main game loops.
     * Also spawns initial coins and bottles in the world.
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
     * Configures the initial settings for all game-related sounds.
     * 
     * Sets loop behavior and volume levels for soundtrack, boss music,
     * coin collection sound, and bottle pickup sound.
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
     * Mutes or unmutes all sound sources in the game world.
     * 
     * Affects background music, collectible sounds, character sounds,
     * enemy sounds, and throwable object sounds.
     * 
     * @param {boolean} muted - Whether to mute (`true`) or unmute (`false`) all sounds.
     */
    setMute(muted) {
        [this.soundtrack_sound, this.coin_sound, this.pickup_bottle_sound, this.bossMusic].forEach(
            s => (s.muted = muted)
        );
        this.level.enemies.forEach(enemy => enemy.setMute?.(muted));
        this.throwableObjects.forEach(obj => obj.setMute?.(muted));
        this.character.setMute(muted);
    }

    /**
     * Starts the main game logic loop.
     * 
     * Repeatedly checks for collisions and boss fight triggers at a fixed interval,
     * unless the game is paused.
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
     * Checks all collisions in the game world.
     * 
     * This includes collisions with enemies, coins, and bottles. Each type of collision
     * is handled by a specific method.
     */
    checkCollisions() {
        this.handleEnemyCollisions();
        this.handleCoinCollisions();
        this.handleBottleCollisions();
    }

    /**
     * Handles collisions with enemies.
     * 
     * For each enemy, the collision is processed and based on the interaction, 
     * either a jump-on or touch action is taken.
     */
    handleEnemyCollisions() {
        this.level.enemies.forEach(enemy => this.processEnemyCollision(enemy));
    }

    /**
     * Processes the collision with a specific enemy.
     * 
     * This checks whether the character is colliding with an enemy, and determines
     * whether the character is stomping on the enemy or simply touching it.
     * 
     * @param {Object} enemy - The enemy object that the character might collide with.
     */
    processEnemyCollision(enemy) {
        if (enemy.dead) return;
        if (this.character.isColliding(enemy)) {
            if (this.character.isInvulnerable) {
            } else if (this.isStompingOn(enemy)) {
                this.handleJumpOnEnemy(enemy);
            } else {
                this.handleTouchEnemy(enemy);
            }
        }
        this.handleThrowableCollision(enemy);
    }

    /**
     * Checks if the character is stomping on an enemy.
     * 
     * This is determined by the character's position relative to the enemy's top
     * and if the character is moving downward.
     * 
     * @param {Object} enemy - The enemy to check for stomp collision.
     * @returns {boolean} - Returns true if the character is stomping on the enemy.
     */
    isStompingOn(enemy) {
        const tolerance = 30;
        return this.character.bottom() <= enemy.top() + tolerance && this.character.speedY < 0;
    }

    /**
     * Handles the action when the character jumps on an enemy.
     * 
     * This will make the character invulnerable for a short time and "kills" the enemy,
     * unless it's the endboss.
     * 
     * @param {Object} enemy - The enemy object that the character has jumped on.
     */
    handleJumpOnEnemy(enemy) {
        if (enemy instanceof Endboss) return;
        this.character.isInvulnerable = true;
        this.killEnemy(enemy);
        this.character.speedY = 15;
        this.character.bounce_sound.currentTime = 0;
        this.character.bounce_sound.play();
        setTimeout(() => (this.character.isInvulnerable = false), 300);
    }

    /**
     * Handles the action when the character touches an enemy.
     * 
     * The character gets damaged, and the endboss may perform an attack.
     * 
     * @param {Object} enemy - The enemy object that the character touched.
     */
    handleTouchEnemy(enemy) {
        if (enemy instanceof Endboss) {
            enemy.doAttack();
        }
        this.character.hit();
        this.statusBar.setPercentage(this.character.health);
    }

    /**
     * Handles collisions between throwable objects and enemies.
     * 
     * If a throwable object hits an enemy, it will cause damage to the enemy or kill it.
     * 
     * @param {Object} enemy - The enemy to check for collisions with throwable objects.
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
     * Kills an enemy by triggering its death process.
     * 
     * If the enemy has a `die` method, it will be called to handle its death animation
     * and cleanup. After the death animation, the enemy is removed from the level.
     * 
     * @param {Object} enemy - The enemy object to be killed.
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
     * Handles collisions with collectable coins.
     * 
     * This will collect a coin if the character is colliding with it, increase the coin count,
     * and play a sound effect.
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
     * Handles collisions with collectable bottles.
     * 
     * This will collect a bottle if the character is colliding with it and increase the bottle count.
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
     * Checks if the boss fight should be triggered based on the character's position.
     * 
     * If the character reaches a specific X position, the boss fight will begin, 
     * the soundtrack will pause, and the endboss will enter the fight.
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
     * Starts the boss music.
     */
    startBossMusic() {
        this.bossMusic.play();
    }

    /**
     * Unfreezes the player and allows movement.
     */
    unfreezePlayer() {
        this.character.canMove = true;
    }

    /**
     * Draws the game world and updates all objects.
     * 
     * This includes clearing the canvas, drawing background objects, enemies,
     * collectable items, and other game elements.
     */
    draw() {
        if (this.gamePaused) return;
        this.clearCanvas();
        this.handleObjectsDrawing();
        requestAnimationFrame(() => this.draw());
    }

    /**
     * Handles the drawing of all game objects on the canvas.
     * 
     * It first checks throwable objects, applies camera positioning, 
     * and adds objects like background elements, coins, and enemies to the drawing process.
     */
    handleObjectsDrawing() {
        this.checkThrowObjects();
        this.applyCamera(() => {
            this.addObjects([this.level.backgroundObjects, this.level.clouds]);
        });
        this.drawStatus();
        this.applyCamera(() => {
            this.addObjects([
                this.collectableCoins,
                this.collectableBottles,
                [this.character],
                this.throwableObjects,
                this.level.enemies
            ]);
        });
    }

    /**
     * Clears the entire canvas.
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draws the status bars, including health, coin count, and bottle count.
     */
    drawStatus() {
        const bars = [this.statusBar, this.statusBarCoins, this.statusBarBottles];
        if (
            this.endboss &&
            this.endboss.canTakeDamage &&
            this.endboss.currentState !== 'dead'
        ) {
            bars.push(this.endboss.statusBar);
        }
        this.addObjects([bars]);
    }

    /**
     * Applies the camera transformation to the drawing context, 
     * shifting the camera's X position before rendering objects.
     * 
     * @param {Function} drawFn - A function that handles the actual drawing of objects.
     */
    applyCamera(drawFn) {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        drawFn();
        this.ctx.restore();
    }

    /**
     * Adds a group of objects to the canvas for drawing.
     * 
     * @param {Array} groups - A list of object arrays to draw.
     */
    addObjects(groups) {
        groups.flat().forEach(obj => this.drawObject(obj));
    }

    /**
     * Draws a single object on the canvas.
     * 
     * If the object is facing the opposite direction, it will be flipped before drawing.
     * 
     * @param {Object} obj - The object to be drawn.
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
     * Flips an image horizontally on the canvas.
     * 
     * @param {Object} obj - The object whose image will be flipped.
     */
    flipImage(obj) {
        this.ctx.translate(obj.x + obj.width / 2, obj.y);
        this.ctx.scale(-1, 1);
        this.ctx.translate(-obj.x - obj.width / 2, -obj.y);
    }

    /**
     * Checks if the D key is held to trigger the throwing action for throwable objects.
     * 
     * Also handles cooldowns between throws and decreases the number of bottles in the status bar.
     */
    checkThrowObjects() {
        const now = Date.now();
        if (this.keyboard.D && !this.dWasHeld) {
            this.dWasHeld = true;
            this.character.wakeUp();
            if ((now - this.lastThrowTime) >= this.throwCooldown && this.statusBarBottles.percentage > 0) {
                this.throwObject();
                this.statusBarBottles.decreaseBottles();
                this.lastThrowTime = now;
            }
        }
        if (!this.keyboard.D) {
            this.dWasHeld = false;
        }
    }

    /**
     * Throws an object from the character, either to the left or right.
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
     * Spawns collectable coins in the game world.
     * 
     * It places coins at random X positions, ensuring no overlap between coins.
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
     * Spawns collectable bottles in the game world.
     * 
     * It places bottles at random X positions, ensuring no overlap between bottles.
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
     * Returns a random X coordinate within the valid range for coins.
     * 
     * @returns {number} - A random X position for a coin.
     */
    randomX() {
        return this.COIN_MIN_X + Math.random() * (this.COIN_MAX_X - this.COIN_MIN_X);
    }

    /**
     * Checks if a given X coordinate overlaps with any existing coins.
     * 
     * @param {number} x - The X position to check for overlap.
     * @returns {boolean} - Returns true if there is an overlap, false otherwise.
     */
    checkOverlap(x) {
        return this.collectableCoins.some(c => Math.abs(x - c.x) < this.COIN_SPACING);
    }

    /**
     * Checks if a given X coordinate overlaps with any existing bottles.
     * 
     * @param {number} x - The X position to check for overlap.
     * @returns {boolean} - Returns true if there is an overlap, false otherwise.
     */
    checkBottleOverlap(x) {
        return this.collectableBottles.some(b => Math.abs(x - b.x) < 120);
    }

    /**
     * Updates the display of collected coins on the game-over or win screen.
     */
    updateCollectedCoinsDisplay() {
        const msg = `You have collected ${this.collectedCoinsCount} / ${this.COIN_COUNT} coins!`;
        document.getElementById('collectedCoinsGameOver').textContent = msg;
        document.getElementById('collectedCoinsWin').textContent = msg;
    }

    /**
     * Pauses the game.
     */
    pauseGame() {
        this.gamePaused = true;
    }

    /**
     * Cleans up after the game, pausing the game and muting all sounds.
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
