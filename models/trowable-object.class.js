class ThrowableObject extends MovableObject {
    throw_sound = new Audio('audio/throw.mp3')
    smash_sound = new Audio('audio/bottleSmash.mp3')

    IMAGES_ROTATION = [
        './img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        './img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ]

    IMAGES_SPLASH = [
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        './img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ]

    /**
     * @param {number} x - Starting x position.
     * @param {number} y - Starting y position.
     * @param {boolean} facingLeft - Direction of throw.
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
    }

    /**
     * Starts movement, rotation and gravity of the bottle.
     */
    throw() {
        this.speedY = 15
        this.applyGravityWith(3.0) // eigene Gravitation für Flaschen

        this.moveInterval = setInterval(() => {
            this.x += this.speedX
        }, 35)

        this.animateInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_ROTATION)
        }, 100)

        this.throw_sound.play()
    }

    /**
     * Switches to splash animation and stops movement.
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
