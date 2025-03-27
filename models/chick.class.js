class Chick extends MovableObject {
    height = 70;
    width = 65;
    y = 360;
    IMAGES_WALKING = [
        './img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/3_w.png',
    ];

    constructor(x = 200 + Math.random() * 500) {
        super().loadImage('./img/3_enemies_chicken/chicken_small/1_walk/1_w.png');
        this.loadImages(this.IMAGES_WALKING);
        this.x = x;
        this.speed = 0.15 + Math.random() * 0.3;

        this.hitboxOffsetX = 8;
        this.hitboxOffsetY = 10;
        this.hitboxWidth = this.width - 16;
        this.hitboxHeight = this.height - 20;

        this.animate();
    }

    animate() {
        setInterval(() => {
            this.moveLeft();
        }, 1000 / 60);
        setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 125);
    }

    die() {
        this.loadImage('./img/3_enemies_chicken/chicken_small/2_dead/dead.png');
        clearInterval(this.animationInterval);
    }
} 