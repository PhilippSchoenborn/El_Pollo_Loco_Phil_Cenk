class CollectableCoins extends MovableObject {
    constructor(x, y) {
        super().loadImage('./img/8_coin/coin_1.png');
        Object.assign(this, { x, y, width: 100, height: 100, initialY: y});
        this.animate();
        this.switchImage();
    }

    animate() {
        let direction = 1;
        setInterval(() => {
            this.y += direction * 0.5;
            if (Math.abs(this.y - this.initialY) >= 10) direction *= -1;
        }, 1000 / 60);
    }

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