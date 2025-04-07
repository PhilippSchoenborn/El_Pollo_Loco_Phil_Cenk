class World {
    level = level1;
    canvas;
    ctx;
    keyboard;
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
    COLLISION_CHECK_INTERVAL = 200;
    dWasHeld = false;
    lastThrowTime = 0;
    throwCooldown = 1000;
    collectedCoinsCount = 0;

    /**
     * Initializes the game world with a given canvas and keyboard.
     * @param {HTMLCanvasElement} canvas - The canvas element for rendering the game.
     * @param {Keyboard} keyboard - The keyboard input handler.
     */
    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.statusBar = new StatusBar();
        this.character = new Character(this.statusBar);
        this.character.world = this;
        this.endboss = new Endboss(3400);
        this.init();
    }

    /**
     * Initializes the game world, sets up sounds, and starts the game.
     */
    init() {
        this.initSounds();
        this.soundtrack_sound.play();
        this.run();
        this.draw();
        this.spawnCoins();
        this.spawnBottles();
    }

    /**
     * Initializes the audio settings for the game.
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
     * Mutes or unmutes all game sounds.
     * @param {boolean} muted - Whether the sounds should be muted or not.
     */
    setMute(muted) {
        [this.soundtrack_sound, this.coin_sound, this.pickup_bottle_sound, this.bossMusic].forEach(s => s.muted = muted);
        this.character.setMute(muted);
    }

    /**
     * Starts a regular check for collisions and boss trigger.
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
     * Checks all collisions in the game.
     */
    checkCollisions() {
        this.handleEnemyCollisions();
        this.handleCoinCollisions();
        this.handleBottleCollisions();
    }

    /**
     * Checks and processes enemy collisions.
     */
    handleEnemyCollisions() {
        this.level.enemies.forEach(enemy => this.processEnemyCollision(enemy));
    }

    /**
     * Processes a single enemy collision with the character.
     * @param {Enemy} enemy - The enemy to check collisions with.
     */
    processEnemyCollision(enemy) {
        if (enemy.dead) return;
        if (this.character.isColliding(enemy)) {
            if (this.isStompingOn(enemy)) {
                this.handleJumpOnEnemy(enemy);
            } else if (!this.character.isInvulnerable) {
                this.handleTouchEnemy(enemy);
            }
        }
        this.handleThrowableCollision(enemy);
    }

    /**
     * Handles the case where the character jumps on an enemy.
     * @param {Enemy} enemy - The enemy that the character jumped on.
     */
    handleJumpOnEnemy(enemy) {
        if (!(enemy instanceof Endboss)) {
            this.character.isInvulnerable = true;
            const delay = enemy.death_sound?.duration ? enemy.death_sound.duration * 1000 : 500;
            this.killEnemy(enemy);
            this.character.y = 400 - (this.character.hitboxOffsetY + this.character.hitboxHeight);
            this.character.speedY = 0;
            setTimeout(() => {
                this.character.isInvulnerable = false;
            }, delay);
        }
    }

    /**
     * Checks if the character is stomping on an enemy.
     * @param {Enemy} enemy - The enemy to check for.
     * @returns {boolean} - Whether the character is stomping on the enemy.
     */
    isStompingOn(enemy) {
        const tolerance = 30;
        const characterBottom = this.character.bottom();
        const enemyTop = enemy.top();
        console.log("Character Bottom:", characterBottom, "Enemy Top:", enemyTop, "SpeedY:", this.character.speedY);
        return characterBottom <= enemyTop + tolerance && this.character.speedY < 0;
    }

    /**
     * Handles the case where the character touches an enemy.
     * @param {Enemy} enemy - The enemy that the character touched.
     */
    handleTouchEnemy(enemy) {
        if (enemy instanceof Endboss) {
            enemy.doAttack();
        }
        this.character.hit();
        this.statusBar.setPercentage(this.character.health);
    }

    /**
     * Handles collisions between throwable objects (bottles) and enemies.
     * @param {Enemy} enemy - The enemy to check for collisions with throwable objects.
     */
    handleThrowableCollision(enemy) {
        this.throwableObjects.forEach((bottle, i) => {
            if (bottle.isColliding(enemy)) {
                bottle.splash();
                enemy instanceof Endboss ? enemy.hit() : this.killEnemy(enemy);
                setTimeout(() => this.throwableObjects.splice(i, 1), 500);
            }
        });
    }

    /**
     * Kills an enemy and removes it from the level.
     * @param {Enemy} enemy - The enemy to kill.
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
     * Handles collisions with collectible coins.
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
     * Handles collisions with collectible bottles.
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
     * Checks if the D key is pressed to throw objects.
     */
    checkThrowObjects() {
        if (this.keyboard.D && !this.dWasHeld) {
            this.dWasHeld = true;
            const now = Date.now();
            if ((now - this.lastThrowTime) >= this.throwCooldown && this.statusBarBottles.percentage > 0) {
                this.throwObject();
                this.statusBarBottles.decreaseBottles();
                this.lastThrowTime = now;
            }
        }
        if (!this.keyboard.D) this.dWasHeld = false;
    }

    /**
     * Throws a bottle object.
     */
    throwObject() {
        const facingLeft = this.character.otherDirection;
        const x = this.character.x + (facingLeft ? -30 : 65);
        const y = this.character.y + 100;
        this.throwableObjects.push(new ThrowableObject(x, y, facingLeft));
    }

    /**
     * Pauses the game.
     */
    pauseGame() {
        this.gamePaused = true;
    }

    /**
     * Draws the game world to the canvas.
     */
    draw() {
        if (this.gamePaused) return;
        this.clearCanvas();
        this.handleObjectsDrawing();
        requestAnimationFrame(() => this.draw());
    }

    /**
     * Clears the entire canvas.
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Handles drawing of background, status, and game objects.
     */
    handleObjectsDrawing() {
        this.checkThrowObjects();
        this.applyCamera(() => this.addObjects([this.level.backgroundObjects]));
        this.drawStatus();
        this.applyCamera(() => this.addObjects([
            this.collectableCoins,
            this.collectableBottles,
            [this.character],
            this.throwableObjects,
            this.level.enemies,
            this.level.clouds
        ]));
    }

    /**
     * Applies camera translation and draws objects on the canvas.
     * @param {function} drawFn - Function that draws the objects.
     */
    applyCamera(drawFn) {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        drawFn();
        this.ctx.restore();
    }

    /**
     * Draws the status bars on the canvas.
     */
    drawStatus() {
        this.addObjects([[this.statusBar, this.statusBarCoins, this.statusBarBottles]]);
    }

    /**
     * Adds a list of objects to be drawn on the canvas.
     * @param {Array<Array<Object>>} groups - Groups of objects to be drawn.
     */
    addObjects(groups) {
        groups.flat().forEach(obj => this.drawObject(obj));
    }

    /**
     * Draws a single object on the canvas.
     * @param {Object} obj - The object to be drawn.
     */
    drawObject(obj) {
        this.ctx.save();
        if (obj.otherDirection) this.flipImage(obj);
        obj.draw(this.ctx);
        this.ctx.restore();
    }

    /**
     * Flips an image horizontally for objects facing the other direction.
     * @param {Object} obj - The object whose image should be flipped.
     */
    flipImage(obj) {
        this.ctx.translate(obj.x + obj.width / 2, obj.y);
        this.ctx.scale(-1, 1);
        this.ctx.translate(-obj.x - obj.width / 2, -obj.y);
    }

    /**
     * Spawns collectible coins in the world.
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
        const bottleCount = 5;
        this.collectableBottles = [];
        let placed = 0;
        while (placed < bottleCount) {
            const x = 250 + Math.random() * 2200;
            if (!this.checkBottleOverlap(x)) {
                this.collectableBottles.push(new CollectableBottle(x, 350));
                placed++;
            }
        }
    }

    /**
     * Generates a random X position for a coin.
     * @returns {number} - A random X position for a coin.
     */
    randomX() {
        return this.COIN_MIN_X + Math.random() * (this.COIN_MAX_X - this.COIN_MIN_X);
    }

    /**
     * Checks if a given X position overlaps with existing coins.
     * @param {number} x - The X position to check.
     * @returns {boolean} - Whether the position overlaps with any coin.
     */
    checkOverlap(x) {
        return this.collectableCoins.some(c => Math.abs(x - c.x) < this.COIN_SPACING);
    }

    /**
     * Checks if a given X position overlaps with existing bottles.
     * @param {number} x - The X position to check.
     * @returns {boolean} - Whether the position overlaps with any bottle.
     */
    checkBottleOverlap(x) {
        return this.collectableBottles.some(b => Math.abs(x - b.x) < 120);
    }

    /**
     * Triggers the boss battle when the character reaches a certain point.
     */
    checkBossTrigger() {
        if (!window.bossTriggered && this.character.x >= 2800) {
            window.bossTriggered = true;
            this.character.canMove = false;
            this.soundtrack_sound.pause();
            this.soundtrack_sound.currentTime = 0;
            this.level.enemies.push(this.endboss);
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
     * Unfreezes the player and allows movement again.
     */
    unfreezePlayer() {
        this.character.canMove = true;
    }

    /**
     * Updates the display for collected coins.
     */
    updateCollectedCoinsDisplay() {
        const msg = `You have collected ${this.collectedCoinsCount} / ${this.COIN_COUNT} coins!`;
        document.getElementById('collectedCoinsGameOver').textContent = msg;
        document.getElementById('collectedCoinsWin').textContent = msg;
    }
}
