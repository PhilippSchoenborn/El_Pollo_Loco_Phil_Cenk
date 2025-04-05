/**
 * Represents a collectible coin object that oscillates up and down 
 * and switches images periodically to create an animated effect.
 */
class CollectableCoins extends MovableObject {
    /**
     * Creates a new collectible coin at the specified position.
     * The coin will oscillate up and down and alternate between two images.
     * 
     * @param {number} x - The x-coordinate of the coin's initial position.
     * @param {number} y - The y-coordinate of the coin's initial position.
     */
    constructor(x, y) {
        super().loadImage('./img/8_coin/coin_1.png');
        Object.assign(this, { x, y, width: 100, height: 100, initialY: y });
        this.animate();
        this.switchImage();
    }

    /**
     * Animates the coin's vertical oscillation. The coin moves up and down 
     * by a small amount (10 pixels) and changes direction when reaching the limits.
     * 
     * @private
     */
    animate() {
        let direction = 1;
        setInterval(() => {
            this.y += direction * 0.5;
            if (Math.abs(this.y - this.initialY) >= 10) direction *= -1;
        }, 1000 / 60);
    }

    /**
     * Periodically switches between two images to create an animation effect.
     * The coin alternates between two images every 700ms.
     * 
     * @private
     */
    switchImage() {
        let currentImageIndex = 0;
        const images = [
            '/img/8_coin/coin_1.png',
            '/img/8_coin/coin_2.png'
        ];
        setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            this.loadImage(images[currentImageIndex]);
        }, 700);
    }
}
