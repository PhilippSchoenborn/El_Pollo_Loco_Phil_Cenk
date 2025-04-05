/**
 * Represents a small enemy chick in the game.
 * It walks left continuously and can be killed by the player.
 */
class Chick extends MovableObject {
    height = 70;
    width = 65;
    y = 360;
    death_sound = new Audio('/audio/chick_dead.mp3');

    /**
     * Array of image paths for the walking animation.
     * @type {string[]}
     */
    IMAGES_WALKING = [
        './img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/3_w.png',
    ];

    /**
     * Creates a new Chick instance at a random horizontal position.
     * @param {number} [x=200 + Math.random() * 500] - The starting x position of the chick.
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
        this.animate();
    }

    /**
     * Starts the movement and walking animation of the chick.
     * Moves left and plays a walking animation in a loop.
     */
    animate() {
        this.moveInterval = setInterval(() => {
            this.moveLeft();
        }, 1000 / 60);
        this.animationInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 125);
    }

    /**
     * Handles the chick's death.
     * Stops all movement and animation, changes image to dead state,
     * and plays the death sound.
     */
    die() {
        this.loadImage('./img/3_enemies_chicken/chicken_small/2_dead/dead.png');
        clearInterval(this.moveInterval);
        clearInterval(this.animationInterval);
        this.speed = 0;
        this.death_sound.play();
        this.death_sound.volume = 0.4;
    }
}
