/**
 * A movable object that extends DrawableObject and provides movement, collision, gravity, etc.
 */
class MovableObject extends DrawableObject {
    speed = 0.15
    otherDirection = false
    speedY = 0
    energy = 100
    lastHit = 0
    gravityInterval = null

    /**
     * Starts gravity with a given acceleration and interval.
     * @param {number} acceleration
     * @param {number} intervalMs
     */
    applyGravityWith(acceleration = 2.5, intervalMs = 40) {
        this.gravityInterval = setInterval(() => {
            if (this.shouldFall()) {
                this.y -= this.speedY
                this.speedY -= acceleration
            } else {
                this.y = 210
                this.speedY = 0
            }
        }, intervalMs)
    }

    /**
     * Returns true if the object should fall.
     * @returns {boolean}
     */
    shouldFall() {
        return this.isAboveGround() || this.speedY > 0
    }

    /**
     * Checks if object is above ground.
     * @returns {boolean}
     */
    isAboveGround() {
        return this instanceof ThrowableObject || this.y < 193
    }

    /** Moves right by this.speed. */
    moveRight() {
        this.x += this.speed
    }

    /** Moves left by this.speed. */
    moveLeft() {
        this.x -= this.speed
    }

    /** Sets a jump impulse. */
    jump() {
        this.speedY = 30
    }

    /**
     * Plays the next frame in an animation array.
     * @param {string[]} images
     */
    playAnimation(images) {
        const index = this.currentImage % images.length
        this.img = this.imageCache[images[index]]
        this.currentImage++
    }

    /**
     * Checks collision with another MovableObject.
     * @param {MovableObject} mo
     * @returns {boolean}
     */
    isColliding(mo) {
        return this.right() > mo.left() && this.bottom() > mo.top() && this.left() < mo.right() && this.top() < mo.bottom()
    }

    /** @returns {number} Left boundary (with optional offsets). */
    left() {
        if (this.hitbox) {
            return this.x + this.hitbox.offsetX
        }
        return this.x + (this.hitboxOffsetX || 0)
    }

    /** @returns {number} Right boundary (with optional offsets). */
    right() {
        if (this.hitbox) {
            return this.x + this.hitbox.offsetX + this.hitbox.width
        }
        return this.left() + (this.hitboxWidth || this.width)
    }

    /** @returns {number} Top boundary (with optional offsets). */
    top() {
        if (this.hitbox) {
            return this.y + this.hitbox.offsetY
        }
        return this.y + (this.hitboxOffsetY || 0)
    }

    /** @returns {number} Bottom boundary (with optional offsets). */
    bottom() {
        if (this.hitbox) {
            return this.y + this.hitbox.offsetY + this.hitbox.height
        }
        return this.top() + (this.hitboxHeight || this.height)
    }

    /** Lowers energy when hit, can’t go below 0. */
    hit() {
        this.energy = Math.max(this.energy - 5, 0)
        if (this.energy > 0) this.lastHit = Date.now()
    }

    /**
     * Object is hurt if hit within last 0.5s.
     * @returns {boolean}
     */
    isHurt() {
        const timePassed = (Date.now() - this.lastHit) / 1000
        return timePassed < 0.5
    }

    /**
     * Object is dead if energy is 0.
     * @returns {boolean}
     */
    isDead() {
        return this.energy === 0
    }
}
