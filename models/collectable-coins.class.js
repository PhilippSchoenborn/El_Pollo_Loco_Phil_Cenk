class CollectableCoins extends MovableObject {
    constructor(x, y) {
        super().loadImage('./img/8_coin/coin_1.png');
        Object.assign(this, { x, y, width: 100, height: 100, initialY: y });
        this.animate();
    }

    animate() {
        let direction = 1;
        setInterval(() => {
            this.y += direction * 0.5;
            if (Math.abs(this.y - this.initialY) >= 10) direction *= -1;
        }, 1000 / 60);
    }
}