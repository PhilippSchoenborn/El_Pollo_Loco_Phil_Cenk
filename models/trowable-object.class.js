/**
 * Represents a throwable object, such as a bottle, that can be thrown, rotated, and splashed.
 * Handles the movement, animation, and collision behavior of the thrown object.
 */
class ThrowableObject extends MovableObject {
    /**
     * Sound that plays when the object is thrown.
     * @type {HTMLAudioElement}
     */
    throw_sound = new Audio('audio/throw.mp3')

    /**
     * Sound that plays when the object smashes.
     * @type {HTMLAudioElement}
     */
    smash_sound = new Audio('audio/bottleSmash.mp3')

    /**
     * Array of image paths for the rotation animation of the bottle.
     * @type {Array<string>}
     */
    IMAGES_ROTATION = [
        './img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ]

    /**
     * Array of image paths for the splash animation of the bottle.
     * @type {Array<string>}
     */
    IMAGES_SPLASH = [
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ]

    /**
     * Creates an instance of the ThrowableObject and initializes its properties.
     * The object is thrown in a specified direction and starts its animation and movement.
     *
     * @param {number} x - The starting x-coordinate of the object.
     * @param {number} y - The starting y-coordinate of the object.
     * @param {boolean} facingLeft - A boolean value indicating the direction the object is thrown.
     * If `true`, the object is thrown to the left; if `false`, it is thrown to the right.
     */
    constructor(x, y, facingLeft) {
        super().loadImage(this.IMAGES_ROTATION[0])
        this.loadImages(this.IMAGES_ROTATION) 
        this.x = x
        this.y = y
        this.width = 60
        this.height = 70
        this.speedX = facingLeft ? -14 : 14
        this.throw_sound.volume = 0.5
        this.smash_sound.volume = 0.4
        this.hitboxOffsetX = 5
        this.hitboxOffsetY = 5
        this.hitboxWidth = this.width - 10
        this.hitboxHeight = this.height - 10
        this.throw()
        this.hasHit = false;
    }

    /**
     * Starts the movement and rotation of the bottle.
     * Also applies gravity to the object and plays the throw sound.
     */
    throw() {
        this.speedY = 15
        this.applyGravityWith(3.0)
        this.moveInterval = setInterval(() => {
            this.x += this.speedX
        }, 35)
        this.animateInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_ROTATION)
        }, 100)
        this.throw_sound.play()
    }

    /**
     * Switches the object's animation to a splash effect and stops its movement.
     * After a short delay, the object is removed from the world.
     */
    splash() {
        this.loadImages(this.IMAGES_SPLASH)
        this.playAnimation(this.IMAGES_SPLASH)
        clearInterval(this.moveInterval)
        clearInterval(this.animateInterval)
        this.smash_sound.play()
        setTimeout(() => {
            const index = world.throwableObjects.indexOf(this)
            if (index !== -1) {
                world.throwableObjects.splice(index, 1)
            }
        }, 600)
    }
}
