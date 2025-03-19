class World {
    character = new Character();
    level = level1;
    camera_x = 0;
    throwableObjects = [new ThrowableObject()];

    constructor(canvas, keyboard) {
        Object.assign(this, { canvas, keyboard, ctx: canvas.getContext('2d'),
            statusBar: new StatusBar(),
            statusBarCoins: new StatusBarCoins(),
            statusBarBottles: new StatusBarBottles()
        });
        this.setWorld();
        this.run();
        this.draw();
    }

    setWorld() {
        this.character.world = this;
    }

    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
        }, 200);
    }

    checkCollisions() {
        this.level.enemies.forEach(enemy => {
            if (this.character.isColliding(enemy)) {
                this.character.hit();
                this.statusBar.setPercentage(this.character.energy);
            }
        });
    }

    checkThrowObjects() {
        if (this.keyboard.D) {
            console.log('Throwing bottle');
            this.throwableObjects.push(new ThrowableObject(this.character.x, this.character.y));
        }
    }

    draw() {
        const drawElements = (elements, translate = false) => {
            if (translate) this.ctx.translate(this.camera_x, 0);
            elements.forEach(obj => this.addToMap(obj));
            if (translate) this.ctx.translate(-this.camera_x, 0);
        };

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        drawElements(this.level.backgroundObjects, true);
        drawElements([this.statusBar, this.statusBarCoins, this.statusBarBottles]);
        drawElements([this.character, ...this.throwableObjects, ...this.level.enemies, ...this.level.clouds], true);

        requestAnimationFrame(() => this.draw());
    }

    addObjectsToMap(objects) {
        objects.forEach(obj => this.addToMap(obj));
    }

    addToMap(mo) {
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
}