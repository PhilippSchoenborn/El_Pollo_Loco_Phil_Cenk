class CollectableBottle extends MovableObject {
    constructor(x, y) {
        super().loadImage('./img/6_salsa_bottle/1_salsa_bottle_on_ground.png');
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.initialY = y;
        // Adjust hitbox to be smaller: 50x50 hitbox
        this.hitbox = {
            offsetX: 45,
            offsetY: 30,
            width: 20,
            height: 60
        };
        this.switchImage();
    }

    animate() {
        let direction = 1;
        setInterval(() => {
            this.y += direction * 0.5;
            if (this.y >= this.initialY + 10 || this.y <= this.initialY - 10) {
                direction *= -1;
            }
        }, 1000 / 60);
    }

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
