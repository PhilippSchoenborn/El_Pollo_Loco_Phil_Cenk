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

    // (We no longer create a separate statusBarBoss. We rely on endboss.statusBar.)

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

    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;

        // Setup the level, character, etc.
        this.level = createLevel1();

        this.statusBar = new StatusBar();
        this.character = new Character(this.statusBar);
        this.character.world = this;

        // Create an Endboss instance
        this.endboss = new Endboss(3400);
    }

    init() {
        // Some enemies might have custom movement
        this.level.enemies.forEach(e => e.initMovement?.());

        this.initSounds();
        this.soundtrack_sound.play();

        this.run();
        this.draw();
        this.spawnCoins();
        this.spawnBottles();
    }

    initSounds() {
        this.soundtrack_sound.loop = true;
        this.soundtrack_sound.volume = 0.05;

        this.bossMusic.loop = true;
        this.bossMusic.volume = 0.2;

        this.coin_sound.volume = 0.5;
        this.pickup_bottle_sound.volume = 0.5;
    }

    setMute(muted) {
        [this.soundtrack_sound, this.coin_sound, this.pickup_bottle_sound, this.bossMusic].forEach(
            s => (s.muted = muted)
        );

        // Mute all enemies & projectiles
        this.level.enemies.forEach(enemy => enemy.setMute?.(muted));
        this.throwableObjects.forEach(obj => obj.setMute?.(muted));

        // Mute the character
        this.character.setMute(muted);
    }

    run() {
        setInterval(() => {
            if (!this.gamePaused) {
                this.checkCollisions();
                this.checkBossTrigger();
            }
        }, this.COLLISION_CHECK_INTERVAL);
    }

    checkCollisions() {
        this.handleEnemyCollisions();
        this.handleCoinCollisions();
        this.handleBottleCollisions();
    }

    handleEnemyCollisions() {
        this.level.enemies.forEach(enemy => this.processEnemyCollision(enemy));
    }

    processEnemyCollision(enemy) {
        if (enemy.dead) return;

        if (this.character.isColliding(enemy)) {
            if (this.character.isInvulnerable) {
                // no effect if character is temporarily invulnerable
            } else if (this.isStompingOn(enemy)) {
                this.handleJumpOnEnemy(enemy);
            } else {
                this.handleTouchEnemy(enemy);
            }
        }

        this.handleThrowableCollision(enemy);
    }

    isStompingOn(enemy) {
        const tolerance = 30;
        return this.character.bottom() <= enemy.top() + tolerance && this.character.speedY < 0;
    }

    handleJumpOnEnemy(enemy) {
        // If it's the Endboss, we don't kill it by jumping
        if (enemy instanceof Endboss) return;

        // Kill normal enemy
        this.character.isInvulnerable = true;
        this.killEnemy(enemy);
        this.character.speedY = 15;
        this.character.bounce_sound.currentTime = 0;
        this.character.bounce_sound.play();

        // Brief invulnerability so the player isn't immediately hurt
        setTimeout(() => (this.character.isInvulnerable = false), 300);
    }

    handleTouchEnemy(enemy) {
        // Endboss might do an attack
        if (enemy instanceof Endboss) {
            enemy.doAttack();
        }
        this.character.hit();
        this.statusBar.setPercentage(this.character.health);
    }

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
     * If the boss hasn't been triggered yet (global window.bossTriggered is false),
     * and the character's x >= 2800, start the boss intro sequence.
     */
    checkBossTrigger() {
        if (!window.bossTriggered && this.character.x >= 2800) {
            window.bossTriggered = true;
            this.character.canMove = false;

            // Stop normal soundtrack
            this.soundtrack_sound.pause();
            this.soundtrack_sound.currentTime = 0;

            // Add the endboss to the enemies array if not already present
            this.level.enemies.push(this.endboss);

            // Make sure endboss has correct mute state
            this.endboss.setMute?.(this.soundtrack_sound.muted);

            // Start the boss entrance (walk in, alert, chase, etc.)
            this.endboss.doEntrance();
        }
    }

    startBossMusic() {
        this.bossMusic.play();
    }

    unfreezePlayer() {
        this.character.canMove = true;
    }

    /**
     * Main game loop for rendering:
     *  1) Clear the canvas
     *  2) Let handleObjectsDrawing() do all object draws + checks
     *  3) Request next frame
     */
    draw() {
        if (this.gamePaused) return;

        this.clearCanvas();
        this.handleObjectsDrawing();
        requestAnimationFrame(() => this.draw());
    }

    /**
     * Clears canvas, checks user input for throwing, 
     * draws backgrounds/HUD/characters, etc.
     */
    handleObjectsDrawing() {
        // 1) Check if user pressed "D" to throw a bottle
        this.checkThrowObjects();

        // 2) Draw background & clouds behind camera
        this.applyCamera(() => {
            this.addObjects([this.level.backgroundObjects, this.level.clouds]);
        });

        // 3) Draw the status bars (player + coins + bottles + conditionally the boss)
        this.drawStatus();

        // 4) Draw the main action area in front of camera: coins, bottles, character, enemies
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

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Always show the player's HUD (health, coins, bottles).
     * Only draw the Endboss bar if the boss is in a chase state & not dead.
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
      

    applyCamera(drawFn) {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        drawFn();
        this.ctx.restore();
    }

    addObjects(groups) {
        groups.flat().forEach(obj => this.drawObject(obj));
    }

    drawObject(obj) {
        this.ctx.save();
        if (obj.otherDirection) this.flipImage(obj);
        obj.draw(this.ctx);

        // If you have debug mode for bounding boxes
        if (DEBUG_MODE && typeof obj.drawHitbox === 'function') {
            obj.drawHitbox(this.ctx);
        }

        this.ctx.restore();
    }

    flipImage(obj) {
        this.ctx.translate(obj.x + obj.width / 2, obj.y);
        this.ctx.scale(-1, 1);
        this.ctx.translate(-obj.x - obj.width / 2, -obj.y);
    }

    /**
     * Checks keyboard input for "D" to throw a bottle, respecting a cooldown.
     */
    checkThrowObjects() {
        const now = Date.now();
        // If "D" is pressed and wasn't previously pressed
        if (this.keyboard.D && !this.dWasHeld) {
            this.dWasHeld = true;
            this.character.wakeUp();

            // If enough time has passed & we have bottles left
            if ((now - this.lastThrowTime) >= this.throwCooldown && this.statusBarBottles.percentage > 0) {
                this.throwObject();
                this.statusBarBottles.decreaseBottles();
                this.lastThrowTime = now;
            }
        }
        // Reset the flag if "D" is not pressed
        if (!this.keyboard.D) {
            this.dWasHeld = false;
        }
    }

    /**
     * Instantiates a new ThrowableObject (bottle) 
     * at the character's position, with direction.
     */
    throwObject() {
        const facingLeft = this.character.otherDirection;
        const x = this.character.x + (facingLeft ? -30 : 65);
        const y = this.character.y + 100;

        const bottle = new ThrowableObject(x, y, facingLeft);
        // Respect current mute state
        bottle.setMute?.(this.soundtrack_sound.muted);

        this.throwableObjects.push(bottle);
    }

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

    randomX() {
        return this.COIN_MIN_X + Math.random() * (this.COIN_MAX_X - this.COIN_MIN_X);
    }

    checkOverlap(x) {
        return this.collectableCoins.some(c => Math.abs(x - c.x) < this.COIN_SPACING);
    }

    checkBottleOverlap(x) {
        return this.collectableBottles.some(b => Math.abs(x - b.x) < 120);
    }

    updateCollectedCoinsDisplay() {
        const msg = `You have collected ${this.collectedCoinsCount} / ${this.COIN_COUNT} coins!`;
        document.getElementById('collectedCoinsGameOver').textContent = msg;
        document.getElementById('collectedCoinsWin').textContent = msg;
    }

    pauseGame() {
        this.gamePaused = true;
    }

    cleanUp() {
        this.pauseGame();
        this.setMute(true);

        // Reset normal music
        this.soundtrack_sound.pause();
        this.soundtrack_sound.currentTime = 0;

        // Reset boss music
        this.bossMusic.pause();
        this.bossMusic.currentTime = 0;

        // Stop character sounds if needed
        this.character?.stopAllSounds?.();
    }
}
