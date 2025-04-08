class CollectableCoins extends MovableObject {
    constructor(x, y) {
        super().loadImage('./img/8_coin/coin_1.png');
        Object.assign(this, { x, y, width: 150, height: 150, initialY: y });
        // Adjust hitbox to be 50x50 instead of 70x70
        this.hitbox = {
            offsetX: 55,  // Centers a 50-pixel wide hitbox in a 100-pixel frame
            offsetY: 55,  // Centers a 50-pixel tall hitbox
            width: 40,
            height: 40 
        };
        this.animate();
        this.switchImage();
    }
    
    animate() {
        let direction = 1;
        setInterval(() => {
            this.y += direction * 1;
            if (Math.abs(this.y - this.initialY) >= 10) direction *= -1;
        }, 1000 / 60);
    }
    
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
