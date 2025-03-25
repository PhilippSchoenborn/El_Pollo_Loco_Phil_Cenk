class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    statusBarCoins = new StatusBarCoins();
    statusBarBottles = new StatusBarBottles();
    throwableObjects = [];
    collectableCoins = [];
    collectableBottles = [];

    // Your audio objects:
    soundtrack_sound = new Audio('audio/soundtrack.mp3');
    coin_sound = new Audio('audio/coin.mp3');
    pickup_bottle_sound = new Audio('audio/pickup_bottle.mp3');

    COIN_Y = 350;
    COIN_MIN_X = 350;
    COIN_MAX_X = 2200;
    COIN_SPACING = 120;
    COIN_COUNT = 10;
    THROW_OFFSET_X = 65;
    THROW_OFFSET_Y = 100;
    COLLISION_CHECK_INTERVAL = 200;

    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;

        this.character.world = this;

        // Set up your sounds
        this.soundtrack_sound.loop = true;
        this.soundtrack_sound.volume = 0.05;
        this.coin_sound.volume = 0.5;
        this.pickup_bottle_sound.volume = 0.5;

        // Start background music (usually after a user click)
        this.soundtrack_sound.play();

        // Main game loops
        this.run();
        this.draw();

        // Spawn coins/bottles
        this.spawnCoins();
        this.spawnBottles();
    }

    /**
     * Mute or unmute all sounds in this world.
     * @param {boolean} muted - true to mute, false to unmute
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
            this.checkCollisions();
            this.checkThrowObjects();
        }, this.COLLISION_CHECK_INTERVAL);
    }

    checkCollisions() {
        this.level.enemies.forEach((e) => {
            if (this.character.isColliding(e)) {
                this.character.hit();
                this.statusBar.setPercentage(this.character.energy);
            }
        });

        this.collectableCoins = this.collectableCoins.filter((c) => {
            if (this.character.isColliding(c)) {
                this.statusBarCoins.increaseCoins();
                this.coin_sound.play();
                return false; // remove the coin
            }
            return true;
        });

        this.collectableBottles = this.collectableBottles.filter((bottle) => {
            if (this.character.isColliding(bottle)) {
                this.statusBarBottles.increaseBottles();
                this.pickup_bottle_sound.play();
                return false; // remove the bottle
            }
            return true;
        });
    }

    checkThrowObjects() {
        if (this.keyboard.D && this.statusBarBottles.percentage > 0) {
            this.throwableObjects.push(
                new ThrowableObject(
                    this.character.x + this.THROW_OFFSET_X,
                    this.character.y + this.THROW_OFFSET_Y
                )
            );
            this.statusBarBottles.decreaseBottles();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1) Draw background objects using camera offset
        this.applyCamera(() => {
            this.addObjects([this.level.backgroundObjects]);
        });

        // 2) Draw fixed-position UI (status bars)
        this.drawStatus();

        // 3) Draw other objects with camera offset
        this.applyCamera(() => {
            this.addObjects([
                this.collectableCoins,
                this.collectableBottles,
                [this.character],
                this.throwableObjects,
                this.level.enemies,
                this.level.clouds,
            ]);
        });

        // Keep redrawing
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
        objectGroups.flat().forEach((obj) => this.drawObject(obj));
    }

    drawObject(mo) {
        this.ctx.save();
        if (mo.otherDirection) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);
        this.ctx.restore();
    }

    flipImage(mo) {
        this.ctx.translate(mo.x + mo.width / 2, mo.y);
        this.ctx.scale(-1, 1);
        this.ctx.translate(-mo.x - mo.width / 2, -mo.y);
    }

    spawnCoins() {
        this.collectableCoins = Array.from({ length: this.COIN_COUNT }, () => {
            let x;
            while (
                this.checkOverlap(
                    (x = this.COIN_MIN_X + Math.random() * (this.COIN_MAX_X - this.COIN_MIN_X))
                )
            );
            return new CollectableCoins(x, this.COIN_Y);
        });
    }

    spawnBottles() {
        const fixedY = 350;
        this.collectableBottles = Array.from({ length: 15 }, () => {
            let randomX;
            while (this.checkBottleOverlap((randomX = 250 + Math.random() * 2200)));
            return new CollectableBottle(randomX, fixedY);
        });
    }

    checkOverlap = (x) =>
        this.collectableCoins.some((c) => Math.abs(x - c.x) < this.COIN_SPACING);

    checkBottleOverlap = (newX) =>
        this.collectableBottles.some((bottle) => Math.abs(newX - bottle.x) < 120);
}
