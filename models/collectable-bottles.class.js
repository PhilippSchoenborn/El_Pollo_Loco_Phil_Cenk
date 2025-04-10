/**
 * Represents a collectable salsa bottle with idle animation and image switching.
 * Inherits from MovableObject.
 */
class CollectableBottle extends MovableObject {
    /**
     * Creates a new CollectableBottle.
     * @param {number} x - The x position of the bottle.
     * @param {number} y - The y position of the bottle.
     */
    constructor(x, y) {
        super().loadImage('./img/6_salsa_bottle/1_salsa_bottle_on_ground.png');
        this.x = x;
        this.y = y;
        this.initialY = y;
        this.width = 100;
        this.height = 100;
        this.hitbox = {
            offsetX: 45,
            offsetY: 30,
            width: 20,
            height: 60
        };
        this.switchImage();
    }

    /**
     * Animates the bottle with a gentle up-and-down floating effect.
     */
    animate() {
        let direction = 1;
        setInterval(() => {
            this.y += direction * 0.5;
            if (this.y >= this.initialY + 10 || this.y <= this.initialY - 10) {
                direction *= -1;
            }
        }, 1000 / 60);
    }

    /**
     * Switches the bottle's image periodically to create a subtle idle animation.
     */
    switchImage() {
        let currentImageIndex = 0;
        const images = [
            './img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
            './img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
        ];
        setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            this.loadImage(images[currentImageIndex]);
        }, 700);
    }
}
