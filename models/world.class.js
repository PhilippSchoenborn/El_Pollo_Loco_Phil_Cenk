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

    COIN_Y = 350;
    COIN_MIN_X = 350;
    COIN_MAX_X = 2200;
    COIN_SPACING = 120;
    COIN_COUNT = 5;
    THROW_OFFSET_X = 65;
    THROW_OFFSET_Y = 100;
    COLLISION_CHECK_INTERVAL = 200;

    /**
     * Initializes the game world
     * @param {HTMLCanvasElement} canvas - The canvas element to render on
     * @param {Keyboard} keyboard - Keyboard input controller
     */
    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.statusBar = new StatusBar();
        this.character = new Character(this.statusBar);
        this.character.world = this;
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
        this.coin_sound.volume = 0.5;
        this.pickup_bottle_sound.volume = 0.5;
    }

    /**
     * Mutes or unmutes all audio in the game
     * @param {boolean} muted - True to mute, false to unmute
     */
    setMute(muted) {
        this.soundtrack_sound.muted = muted;
        this.coin_sound.muted = muted;
        this.pickup_bottle_sound.muted = muted;
        if (this.character) {
            this.character.setMute(muted);
        }
    }

    run() {
        setInterval(() => {
            if (this.gamePaused) return;
            this.checkCollisions();
            this.checkThrowObjects();
        }, this.COLLISION_CHECK_INTERVAL);
    }

    checkCollisions() {
        this.handleEnemyCollisions();
        this.handleCoinCollisions();
        this.handleBottleCollisions();
    }

    handleEnemyCollisions() {
        this.level.enemies.forEach((enemy) => {
            const isColliding = this.character.isColliding(enemy);
            const isStomping = this.character.isAbove(enemy) && this.character.speedY < 0;

            if (isColliding) {
                if (isStomping && !(enemy instanceof Endboss)) {
                    this.killEnemy(enemy);
                    // Optionally play stomp sound here
                } else if (!isStomping && !this.character.isInvulnerable) {
                    this.character.hit();
                    this.statusBar.setPercentage(this.character.health);
                }
            }

            // Bottle collision
            this.throwableObjects.forEach((bottle, index) => {
                if (bottle.isColliding(enemy)) {
                    bottle.splash();
                    console.log('💥 Bottle hit enemy:', enemy);

                    if (enemy instanceof Endboss) {
                        enemy.hitPoints = (enemy.hitPoints || 3) - 1;
                        enemy.hit();
                        if (enemy.hitPoints <= 0) {
                            this.killEnemy(enemy);
                        }
                    } else {
                        this.killEnemy(enemy);
                    }

                    setTimeout(() => {
                        this.throwableObjects.splice(index, 1);
                    }, 500);
                }
            });
        });
    }

    killEnemy(enemy) {
        if (enemy.die) {
            enemy.die();

            const sound = enemy.death_sound;
            const duration = sound?.duration ? sound.duration * 1000 : 500;

            setTimeout(() => {
                this.level.enemies = this.level.enemies.filter(e => e !== enemy);
            }, duration);
        } else {
            this.level.enemies = this.level.enemies.filter(e => e !== enemy);
        }
    }

    handleCoinCollisions() {
        this.collectableCoins = this.collectableCoins.filter(c => {
            if (this.character.isColliding(c)) {
                this.statusBarCoins.increaseCoins();
                this.coin_sound.play();
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

    checkThrowObjects() {
        if (this.keyboard.D && this.statusBarBottles.percentage > 0) {
            this.throwObject();
            this.statusBarBottles.decreaseBottles();
        }
    }

    throwObject() {
        const x = this.character.x + this.THROW_OFFSET_X;
        const y = this.character.y + this.THROW_OFFSET_Y;
        this.throwableObjects.push(new ThrowableObject(x, y));
    }

    pauseGame() {
        this.gamePaused = true;
    }

    draw() {
        if (this.gamePaused) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.applyCamera(() => this.addObjects([this.level.backgroundObjects]));
        this.drawStatus();
        this.applyCamera(() => {
            this.addObjects([
                this.collectableCoins,
                this.collectableBottles,
                [this.character],
                this.throwableObjects,
                this.level.enemies,
                this.level.clouds
            ]);
        });
        requestAnimationFrame(() => this.draw());
    }

    applyCamera(drawFn) {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        drawFn();
        this.ctx.restore();
    }

    drawStatus() {
        this.addObjects([[this.statusBar, this.statusBarCoins, this.statusBarBottles]]);
    }

    addObjects(objectGroups) {
        objectGroups.flat().forEach(obj => this.drawObject(obj));
    }

    drawObject(mo) {
        this.ctx.save();

        if (mo.otherDirection) {
            this.flipImage(mo);
        }

        mo.draw(this.ctx);
        mo.drawFrame(this.ctx); // if needed

        // ✅ Hitbox debug (safe)
        if (mo.hitboxOffsetX !== undefined) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'red';
            this.ctx.strokeRect(
                mo.x + mo.hitboxOffsetX,
                mo.y + mo.hitboxOffsetY,
                mo.hitboxWidth,
                mo.hitboxHeight
            );
            this.ctx.closePath();
        }

        this.ctx.restore();
    }


    flipImage(mo) {
        this.ctx.translate(mo.x + mo.width / 2, mo.y);
        this.ctx.scale(-1, 1);
        this.ctx.translate(-mo.x - mo.width / 2, -mo.y);
    }

    spawnCoins() {
        this.collectableCoins = [];
        let placed = 0;

        while (placed < this.COIN_COUNT) {
            let x = this.randomX();
            if (!this.checkOverlap(x)) {
                this.collectableCoins.push(new CollectableCoins(x, this.COIN_Y));
                placed++;
            }
        }
    }

    spawnBottles() {
        const fixedY = 350;
        const bottleCount = 6;
        this.collectableBottles = [];

        let placed = 0;
        while (placed < bottleCount) {
            let x = 250 + Math.random() * 2200;
            if (!this.checkBottleOverlap(x)) {
                this.collectableBottles.push(new CollectableBottle(x, fixedY));
                placed++;
            }
        }
    }


    randomX() {
        return this.COIN_MIN_X + Math.random() * (this.COIN_MAX_X - this.COIN_MIN_X);
    }

    checkOverlap = x => this.collectableCoins.some(c => Math.abs(x - c.x) < this.COIN_SPACING);

    checkBottleOverlap = x => this.collectableBottles.some(b => Math.abs(x - b.x) < 120);
}
