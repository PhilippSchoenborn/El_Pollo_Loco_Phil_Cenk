/**
 * Represents a small chick enemy in the game.
 * @extends MovableObject
 */
class Chick extends MovableObject {
    height = 70;
    width = 65;
    y = 360;
    death_sound = new Audio('./audio/chick_dead.mp3');

    IMAGES_WALKING = [
        './img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];

    /**
     * @param {number} [x=200 + Math.random() * 500]
     */
    constructor(x = 200 + Math.random() * 500) {
        super().loadImage('./img/3_enemies_chicken/chicken_small/1_walk/1_w.png');
        this.loadImages(this.IMAGES_WALKING);
        this.x = x;
        this.speed = 0.15 + Math.random() * 0.3;
        this.hitboxOffsetX = 8;
        this.hitboxOffsetY = 10;
        this.hitboxWidth = this.width - 16;
        this.hitboxHeight = this.height - 20;
    }

    /**
     * Initializes the movement and animation intervals for the character.
     * - Movement is updated ~60 times per second (setInterval).
     * - Animation frames are updated every 125 ms (setInterval).
     */
    initMovement() {
        this.moveInterval = setInterval(() => {
            this.moveLeft();
        }, 1000 / 60);
        this.animationInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 125);
    }

    /**
     * Handles the logic when the character dies.
     * - Loads the death image.
     * - Stops movement and animation intervals.
     * - Sets speed to zero.
     * - Plays the death sound with reduced volume.
     */
    die() {
        this.loadImage('./img/3_enemies_chicken/chicken_small/2_dead/dead.png');
        clearInterval(this.moveInterval);
        clearInterval(this.animationInterval);
        this.speed = 0;
        this.death_sound.volume = 0.4;
        this.death_sound.play();
    }

    /**
     * Mutes or unmutes the death sound based on the provided boolean.
     * @param {boolean} muted
     */
    setMute(muted) {
        this.death_sound.muted = muted;
    }
}
