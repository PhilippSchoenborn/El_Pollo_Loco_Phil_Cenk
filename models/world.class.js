// Refactored World Class
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

    init() {
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
        [this.soundtrack_sound, this.coin_sound, this.pickup_bottle_sound, this.bossMusic].forEach(s => s.muted = muted);
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
        const colliding = this.character.isColliding(enemy);
        const stomping = this.character.isAbove(enemy) && this.character.speedY < 0;

        if (colliding) {
            if (stomping && !(enemy instanceof Endboss)) {
                this.killEnemy(enemy);
            } else if (!stomping && !this.character.isInvulnerable) {
                if (enemy instanceof Endboss) enemy.doAttack();
                this.character.hit();
                this.statusBar.setPercentage(this.character.health);
            }
        }

        this.throwableObjects.forEach((bottle, i) => {
            if (bottle.isColliding(enemy)) {
                bottle.splash();
                enemy instanceof Endboss ? enemy.hit() : this.killEnemy(enemy);
                setTimeout(() => this.throwableObjects.splice(i, 1), 500);
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

    throwObject() {
        const facingLeft = this.character.otherDirection;
        const x = this.character.x + (facingLeft ? -30 : 65);
        const y = this.character.y + 100;
        this.throwableObjects.push(new ThrowableObject(x, y, facingLeft));
    }

    pauseGame() {
        this.gamePaused = true;
    }

    draw() {
        if (this.gamePaused) return;
        this.checkThrowObjects();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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

    addObjects(groups) {
        groups.flat().forEach(obj => this.drawObject(obj));
    }

    drawObject(obj) {
        this.ctx.save();
        if (obj.otherDirection) this.flipImage(obj);
        obj.draw(this.ctx);
        this.ctx.restore();
    }

    flipImage(obj) {
        this.ctx.translate(obj.x + obj.width / 2, obj.y);
        this.ctx.scale(-1, 1);
        this.ctx.translate(-obj.x - obj.width / 2, -obj.y);
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
        const bottleCount = 6;
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

    randomX() {
        return this.COIN_MIN_X + Math.random() * (this.COIN_MAX_X - this.COIN_MIN_X);
    }

    checkOverlap = x => this.collectableCoins.some(c => Math.abs(x - c.x) < this.COIN_SPACING);
    checkBottleOverlap = x => this.collectableBottles.some(b => Math.abs(x - b.x) < 120);

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

    startBossMusic() {
        this.bossMusic.play();
    }

    unfreezePlayer() {
        this.character.canMove = true;
    }

    updateCollectedCoinsDisplay() {
        const msg = `You have collected ${this.collectedCoinsCount} / ${this.COIN_COUNT} coins!`;
        document.getElementById('collectedCoinsGameOver').textContent = msg;
        document.getElementById('collectedCoinsWin').textContent = msg;
    }
}
