/**
 * Represents a normal enemy chicken in the game.
 * The chicken moves left continuously and can be killed by the player.
 */
class Chicken extends MovableObject {
    height = 70;
    width = 65;
    y = 360;
    death_sound = new Audio('/audio/chicken_dead.mp3');

    /**
     * Array of image paths for the walking animation.
     * @type {string[]}
     */
    IMAGES_WALKING = [
        './img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
    ];

    /**
     * Creates a new Chicken instance at a random horizontal position.
     * The chicken will start walking and play walking animation by default.
     * 
     * @param {number} [x=200 + Math.random() * 500] - The starting x position of the chicken.
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
        this.animate();
    }

    /**
     * Starts the chicken's movement and walking animation.
     * The chicken will move left and play the walking animation in a loop.
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
     * Handles the chicken's death.
     * Stops the chicken's movement and animation, changes the image to the dead state,
     * and plays the death sound effect.
     */
    die() {
        this.loadImage('./img/3_enemies_chicken/chicken_normal/2_dead/dead.png');
        clearInterval(this.moveInterval);
        clearInterval(this.animationInterval);
        this.speed = 0;
        this.death_sound.play();
        this.death_sound.volume = 0.4;
    }
}
