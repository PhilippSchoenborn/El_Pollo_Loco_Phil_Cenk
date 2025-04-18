/**
 * Represents a normal chicken enemy in the game.
 * @extends MovableObject
 */
class Chicken extends MovableObject {
    height = 70;
    width = 65;
    y = 360;
    death_sound = new Audio('./audio/chicken_dead.mp3');

    IMAGES_WALKING = [
        './img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];

    /**
     * @param {number} [x=200 + Math.random() * 500]
     */
    constructor(x = 200 + Math.random() * 500) {
        super().loadImage('./img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
        this.loadImages(this.IMAGES_WALKING);
        this.x = x;
        this.speed = 0.15 + Math.random() * 0.3;
        this.hitboxOffsetX = 5;
        this.hitboxOffsetY = 10;
        this.hitboxWidth = this.width - 10;
        this.hitboxHeight = this.height - 20;
    }

    /**
     * Starts the movement and animation of the character.
     * - Movement occurs 60 times per second (smooth left movement).
     * - Animation changes frames every 125 milliseconds to simulate walking.
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
     * Triggers the character's death sequence.
     * - Changes the image to the "dead" sprite.
     * - Stops movement and animation.
     * - Sets speed to zero.
     * - Plays a death sound at 40% volume.
     */
    die() {
        this.loadImage('./img/3_enemies_chicken/chicken_normal/2_dead/dead.png');
        clearInterval(this.moveInterval);
        clearInterval(this.animationInterval);
        this.speed = 0;
        this.death_sound.volume = 0.4;
        this.death_sound.play();
    }

    /**
     * Mutes or unmutes the death sound.
     * @param {boolean} muted
     */
    setMute(muted) {
        this.death_sound.muted = muted;
    }
}
