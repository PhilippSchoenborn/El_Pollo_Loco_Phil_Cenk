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

    constructor(x, y) {
        super().loadImage(this.IMAGES_ROTATION[0]);
        this.loadImages(this.IMAGES_ROTATION);
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 70;
        this.throw_sound.volume = 0.5;
        this.throw();
    }

    throw() {
        this.speedY = 15;
        this.applyGravity();
        this.moveInterval = setInterval(() => {
            this.x += 10;
        }, 35);

        this.animateInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_ROTATION);
        }, 100);

        this.throw_sound.play();
    }

    splash() {
        this.loadImages(this.IMAGES_SPLASH);
        this.playAnimation(this.IMAGES_SPLASH);
        clearInterval(this.moveInterval);
        clearInterval(this.animateInterval);
        setTimeout(() => {
            world.throwableObjects.splice(world.throwableObjects.indexOf(this), 1);
        }, 600);
    }
}
