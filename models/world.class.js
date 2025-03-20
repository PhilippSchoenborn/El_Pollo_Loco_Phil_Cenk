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

    COIN_Y = 350;
    COIN_MIN_X = 350;
    COIN_MAX_X = 2200;
    COIN_SPACING = 120;
    COIN_COUNT = 10;
    THROW_OFFSET_X = 65;
    THROW_OFFSET_Y = 100;
    COLLISION_CHECK_INTERVAL = 200;

    constructor(canvas, keyboard) {
        Object.assign(this, { ctx: canvas.getContext('2d'), canvas, keyboard });
        this.character.world = this;
        this.run();
        this.spawnCoins();
        this.draw();
        this.spawnBottles();
    }

    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
        }, this.COLLISION_CHECK_INTERVAL);
    }

    checkCollisions() {
        this.level.enemies.forEach(e => this.character.isColliding(e) && (this.character.hit(), this.statusBar.setPercentage(this.character.energy)));
        this.collectableCoins = this.collectableCoins.filter(c => {
            if (this.character.isColliding(c)) {
                this.statusBarCoins.increaseCoins();
                return false;
            }
            return true;
        });
        this.collectableBottles = this.collectableBottles.filter(bottle => {
            if (this.character.isColliding(bottle)) {
                this.statusBarBottles.increaseBottles();
                return false;
            }
            return true;
        });
    }

    checkThrowObjects() {
        if (this.keyboard.D && this.statusBarBottles.percentage > 0) {
            this.throwableObjects.push(new ThrowableObject(this.character.x + this.THROW_OFFSET_X, this.character.y + this.THROW_OFFSET_Y));
            this.statusBarBottles.decreaseBottles();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.applyCamera(() => this.addObjects([this.level.backgroundObjects]));
        this.drawStatus();
        this.applyCamera(() => this.addObjects([this.collectableCoins, this.collectableBottles, [this.character], this.throwableObjects, this.level.enemies, this.level.clouds]));
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
        mo.otherDirection && this.flipImage(mo);
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
            while (this.checkOverlap(x = this.COIN_MIN_X + Math.random() * (this.COIN_MAX_X - this.COIN_MIN_X)));
            return new CollectableCoins(x, this.COIN_Y);
        });
    }

    spawnBottles() {
        const fixedY = 350;
        this.collectableBottles = Array.from({ length: 15 }, () => {
            let randomX;
            while (this.checkBottleOverlap(randomX = 250 + Math.random() * 2200));
            return new CollectableBottle(randomX, fixedY);
        });
    }

    checkOverlap = (x) => this.collectableCoins.some(c => Math.abs(x - c.x) < this.COIN_SPACING);

    checkBottleOverlap = (newX) => this.collectableBottles.some(bottle => Math.abs(newX - bottle.x) < 120);
}