class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    energy = 100;
    lastHit = 0;
    gravityInterval = null;

    /**
     * Starts gravity simulation with custom acceleration and frame rate.
     * @param {number} acceleration - Rate at which object falls (e.g. 2.5).
     * @param {number} intervalMs - How often to apply gravity (default 40ms).
     */
    applyGravityWith(acceleration = 2.5, intervalMs = 40) {
        this.gravityInterval = setInterval(() => {
            if (this.shouldFall()) {
                this.y -= this.speedY;
                this.speedY -= acceleration;
            }
        }, intervalMs);
    }

    /**
     * Determines whether the object should fall.
     * @returns {boolean}
     */
    shouldFall() {
        return this.isAboveGround() || this.speedY > 0;
    }

    isAboveGround() {
        return this instanceof ThrowableObject || this.y < 193;
    }

    moveRight() {
        this.x += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    jump() {
        this.speedY = 30;
    }

    playAnimation(images) {
        const index = this.currentImage % images.length;
        this.img = this.imageCache[images[index]];
        this.currentImage++;
    }

    isColliding(mo) {
        return (
            this.right() > mo.left() &&
            this.bottom() > mo.top() &&
            this.left() < mo.right() &&
            this.top() < mo.bottom()
        );
    }

    left() {
        return this.x + (this.hitboxOffsetX || 0);
    }

    right() {
        return this.left() + (this.hitboxWidth || this.width);
    }

    top() {
        return this.y + (this.hitboxOffsetY || 0);
    }

    bottom() {
        return this.top() + (this.hitboxHeight || this.height);
    }

    hit() {
        this.energy = Math.max(this.energy - 5, 0);
        if (this.energy > 0) {
            this.lastHit = Date.now();
        }
    }

    isHurt() {
        const timePassed = (Date.now() - this.lastHit) / 1000;
        return timePassed < 0.5;
    }

    isDead() {
        return this.energy === 0;
    }
}
