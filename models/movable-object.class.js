/**
 * Represents a movable object that can interact with the game world.
 * This class extends `DrawableObject` and adds movement, collision detection, gravity, and health management features.
 */
class MovableObject extends DrawableObject {
    /**
     * The horizontal speed of the object (default value is 0.15).
     * @type {number}
     */
    speed = 0.15;

    /**
     * A flag indicating whether the object is moving in the opposite direction (default is false).
     * @type {boolean}
     */
    otherDirection = false;

    /**
     * The vertical speed of the object, which is affected by gravity (default is 0).
     * @type {number}
     */
    speedY = 0;

    /**
     * The energy of the object, used to track its health (default is 100).
     * @type {number}
     */
    energy = 100;

    /**
     * The timestamp of the last hit the object took.
     * @type {number}
     */
    lastHit = 0;

    /**
     * The interval ID for the gravity simulation.
     * @type {?number}
     */
    gravityInterval = null;

    /**
     * Starts gravity simulation for the object with a custom acceleration and interval.
     * The object will fall based on its `speedY` and the specified `acceleration`.
     * @param {number} acceleration - Rate at which the object falls (default is 2.5).
     * @param {number} intervalMs - Interval in milliseconds at which gravity is applied (default is 40ms).
     */
    applyGravityWith(acceleration = 2.5, intervalMs = 40) {
        this.gravityInterval = setInterval(() => {
            if (this.shouldFall()) {
                this.y -= this.speedY;
                this.speedY -= acceleration;
            } else {
                // <<< New lines below >>>
                // Force Pepe to snap to the ground and reset vertical speed
                this.y = 210;  // or whatever your "ground" y-level is
                this.speedY = 0;
            }
        }, intervalMs);
    }


    /**
     * Determines if the object should fall, either because it's above the ground or still moving downward.
     * @returns {boolean} `true` if the object should fall, `false` otherwise.
     */
    shouldFall() {
        return this.isAboveGround() || this.speedY > 0;
    }

    /**
     * Determines if the object is above the ground (based on the `y` coordinate).
     * @returns {boolean} `true` if the object is above the ground, `false` otherwise.
     */
    isAboveGround() {
        return this instanceof ThrowableObject || this.y < 193;
    }

    /**
     * Moves the object to the right by its horizontal speed.
     */
    moveRight() {
        this.x += this.speed;
    }

    /**
     * Moves the object to the left by its horizontal speed.
     */
    moveLeft() {
        this.x -= this.speed;
    }

    /**
     * Makes the object jump by setting its vertical speed (`speedY`).
     * A positive `speedY` simulates the jump.
     */
    jump() {
        this.speedY = 30;
    }

    /**
     * Plays the next animation frame from a set of images.
     * @param {Array<string>} images - An array of image paths to display in the animation.
     */
    playAnimation(images) {
        const index = this.currentImage % images.length;
        this.img = this.imageCache[images[index]];
        this.currentImage++;
    }

    /**
     * Checks if the current object is colliding with another movable object.
     * @param {MovableObject} mo - The movable object to check for collision.
     * @returns {boolean} `true` if the objects are colliding, `false` otherwise.
     */
    isColliding(mo) {
        return (
            this.right() > mo.left() &&
            this.bottom() > mo.top() &&
            this.left() < mo.right() &&
            this.top() < mo.bottom()
        );
    }

    /**
  * Gets the left position of the object for collision detection.
  * If a custom hitbox is defined, uses the hitbox offset.
  * @returns {number} The left position.
  */
    left() {
        if (this.hitbox) {
            return this.x + this.hitbox.offsetX;
        }
        return this.x + (this.hitboxOffsetX || 0);
    }

    /**
     * Gets the right position of the object for collision detection.
     * If a custom hitbox is defined, adds the hitbox width.
     * @returns {number} The right position.
     */
    right() {
        if (this.hitbox) {
            return this.x + this.hitbox.offsetX + this.hitbox.width;
        }
        return this.left() + (this.hitboxWidth || this.width);
    }

    /**
     * Gets the top position of the object for collision detection.
     * @returns {number} The top position.
     */
    top() {
        if (this.hitbox) {
            return this.y + this.hitbox.offsetY;
        }
        return this.y + (this.hitboxOffsetY || 0);
    }

    /**
     * Gets the bottom position of the object for collision detection.
     * @returns {number} The bottom position.
     */
    bottom() {
        if (this.hitbox) {
            return this.y + this.hitbox.offsetY + this.hitbox.height;
        }
        return this.top() + (this.hitboxHeight || this.height);
    }


    /**
     * Reduces the energy of the object when it is hit.
     * The energy cannot go below 0.
     */
    hit() {
        this.energy = Math.max(this.energy - 5, 0);
        if (this.energy > 0) {
            this.lastHit = Date.now();
        }
    }

    /**
     * Determines whether the object is currently hurt.
     * An object is considered hurt if it was hit within the last 0.5 seconds.
     * @returns {boolean} `true` if the object is hurt, `false` otherwise.
     */
    isHurt() {
        const timePassed = (Date.now() - this.lastHit) / 1000;
        return timePassed < 0.5;
    }

    /**
     * Checks if the object is dead.
     * The object is considered dead if its energy reaches 0.
     * @returns {boolean} `true` if the object is dead, `false` otherwise.
     */
    isDead() {
        return this.energy === 0;
    }
}
