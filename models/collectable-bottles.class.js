/**
 * Represents a collectible bottle object that oscillates up and down 
 * and switches images periodically.
 */
class CollectableBottle extends MovableObject {
    /**
     * Creates a new collectible bottle at the specified position.
     * The bottle will oscillate up and down and alternate between two images.
     * 
     * @param {number} x - The x-coordinate of the bottle's initial position.
     * @param {number} y - The y-coordinate of the bottle's initial position.
     */
    constructor(x, y) {
        super().loadImage('./img/6_salsa_bottle/1_salsa_bottle_on_ground.png');
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.initialY = y;
        this.animate(); 
        this.switchImage();
    }

    /**
     * Animates the bottle's vertical oscillation. The bottle moves up and down 
     * by a small amount (10 pixels) and changes direction when reaching the limits.
     * 
     * @private
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
     * Periodically switches between two images to create an animation effect.
     * The bottle alternates between two images every 700ms.
     * 
     * @private
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
