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
    collectableItems = [];

    COIN_Y = 350;
    COIN_MIN_X = 350;
    COIN_MAX_X = 2200;
    COIN_SPACING = 120;
    COIN_COUNT = 10;
    THROW_OFFSET_X = 65;
    THROW_OFFSET_Y = 100;
    COLLISION_CHECK_INTERVAL = 200;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.character.world = this;
        this.run();
        this.spawnCoins();
        this.draw();
    }

    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
        }, this.COLLISION_CHECK_INTERVAL);
    }

    checkCollisions() {
        this.level.enemies.forEach(e => { if (this.character.isColliding(e)) { this.character.hit(); this.statusBar.setPercentage(this.character.energy); } });
        this.collectableItems.forEach((c, i) => { if (this.character.isColliding(c)) { this.collectableItems.splice(i, 1); this.statusBarCoins.increaseCoins(); } });
    }

    checkThrowObjects() {
        if (this.keyboard.D) this.throwableObjects.push(new ThrowableObject(this.character.x + this.THROW_OFFSET_X, this.character.y + this.THROW_OFFSET_Y));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.applyCamera(() => this.addObjects([this.level.backgroundObjects]));
        this.drawStatus();
        this.applyCamera(() => this.addObjects([this.collectableItems, [this.character], this.throwableObjects, this.level.enemies, this.level.clouds]));
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
        objectGroups.forEach(group => group.forEach(obj => this.drawObject(obj)));
    }

    drawObject(mo) {
        this.ctx.save();
        if (mo.otherDirection) this.flipImage(mo);
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
        for (let i = 0; i < this.COIN_COUNT; i++) {
            let x;
            do { x = this.COIN_MIN_X + Math.random() * (this.COIN_MAX_X - this.COIN_MIN_X); } while (this.checkOverlap(x));
            this.collectableItems.push(new CollectableItems(x, this.COIN_Y));
        }
    }

    checkOverlap(x) {
        return this.collectableItems.some(c => Math.abs(x - c.x) < this.COIN_SPACING);
    }
}