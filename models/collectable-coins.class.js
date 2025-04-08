class CollectableCoins extends MovableObject {
    /**
     * Creates a collectible coin at a high, randomized y‑position.
     * @param {number} x - The x-coordinate where the coin will be placed.
     * @param {number} y - The base y-coordinate (ground level) for coin placement.
     */
    constructor(x, y) {
        super().loadImage('./img/8_coin/coin_1.png');
        const randomOffset = Math.floor(Math.random() * 200);
        const newY = y - 50 - randomOffset;
        Object.assign(this, { x, y: newY, width: 150, height: 150, initialY: newY });
        this.hitbox = {
            offsetX: (this.width - 40) / 2,
            offsetY: (this.height - 40) / 2,
            width: 40,
            height: 40
        };
        this.switchImage();
    }

    /**
     * Alternates the coin image for a simple animated effect.
     */
    switchImage() {
        let currentImageIndex = 0;
        const images = [
            './img/8_coin/coin_1.png',
            './img/8_coin/coin_2.png'
        ];
        setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            this.loadImage(images[currentImageIndex]);
        }, 700);
    }
}
