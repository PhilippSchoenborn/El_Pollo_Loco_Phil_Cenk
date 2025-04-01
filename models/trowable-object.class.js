class ThrowableObject extends MovableObject {
    throw_sound = new Audio('audio/throw.mp3');
    smash_sound = new Audio('audio/bottleSmash.mp3');

    IMAGES_ROTATION = [
        './img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ];

    IMAGES_SPLASH = [
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png',
    ];

    /**
     * @param {number} x - Starting x position.
     * @param {number} y - Starting y position.
     * @param {boolean} facingLeft - If true, throw left; else right.
     */
    constructor(x, y, facingLeft) {
        super().loadImage(this.IMAGES_ROTATION[0]);
        this.loadImages(this.IMAGES_ROTATION);

        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 70;

        this.throw_sound.volume = 0.5;
        this.smash_sound.volume = 0.4;

        // If facing left, speedX = -10; else +10
        this.speedX = facingLeft ? -10 : 10;

        this.throw();

        // Hitbox tuning
        this.hitboxOffsetX = 5;
        this.hitboxOffsetY = 5;
        this.hitboxWidth = this.width - 10;
        this.hitboxHeight = this.height - 10;
    }

    /**
     * Starts the bottle movement (with gravity) and rotation.
     */
    throw() {
        // Give it some upward velocity so it "arcs"
        this.speedY = 15;
        this.applyGravity();

        // Move horizontally with speedX
        this.moveInterval = setInterval(() => {
            this.x += this.speedX;
        }, 35);

        // Rotate the bottle
        this.animateInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_ROTATION);
        }, 100);

        // Play throw sound
        this.throw_sound.play();
    }

    /**
     * Plays the splash animation, stops intervals, then removes itself.
     */
    splash() {
        this.loadImages(this.IMAGES_SPLASH);
        this.playAnimation(this.IMAGES_SPLASH);

        clearInterval(this.moveInterval);
        clearInterval(this.animateInterval);

        this.smash_sound.play();

        setTimeout(() => {
            world.throwableObjects.splice(world.throwableObjects.indexOf(this), 1);
        }, 600);
    }
}
