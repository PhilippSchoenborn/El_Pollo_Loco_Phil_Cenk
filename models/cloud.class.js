/**
 * Represents a cloud object that moves across the screen.
 * The cloud is drawn repeatedly to create a seamless scrolling effect.
 */
class Cloud extends MovableObject {
    height = 320;
    width = 719;
    images = [
        './img/5_background/layers/4_clouds/1.png',
        './img/5_background/layers/4_clouds/2.png',
        './img/5_background/layers/4_clouds/3.png',
        './img/5_background/layers/4_clouds/4.png',
        './img/5_background/layers/4_clouds/5.png',
        './img/5_background/layers/4_clouds/6.png',
        './img/5_background/layers/4_clouds/7.png',
        './img/5_background/layers/4_clouds/8.png',
        './img/5_background/layers/4_clouds/9.png',
        './img/5_background/layers/4_clouds/10.png',
    ];
    speed = 0.2;

    /**
     * Creates a new cloud object that moves horizontally across the canvas.
     *
     * @param {number} canvasWidth
     */
    constructor(canvasWidth) {
        super();
        this.loadImages(this.images);
        this.x = 0;
        this.y = Math.random() * 100;
        this.canvasWidth = canvasWidth;
        this.segments = Math.ceil(canvasWidth / this.width) + 1;
        this.animate();
    }

    /**
     * Uses setInterval to update the cloud’s position at ~60 FPS.
     * No "snap back" is performed; x just keeps decreasing.
     */
    animate() {
        let lastTime = performance.now();
        setInterval(() => {
            const now = performance.now();
            const deltaTime = now - lastTime;
            this.x -= this.speed * (deltaTime / (1000 / 60));
            lastTime = now;
        }, 1000 / 60);
    }

    /**
    * Draws cloud segments continuously moving left without snapping or looping back.
    * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context.
     */
    draw(ctx) {
        for (let i = 0; i < this.segments; i++) {
            const imgIndex = i % this.images.length;
            const image = this.imageCache[this.images[imgIndex]];
            const drawX = this.x + i * this.width;
            ctx.drawImage(image, drawX, this.y, this.width, this.height);
        }
        const totalScrollWidth = this.width * this.segments;
        if (this.x <= -totalScrollWidth) {
            this.x = 0;
        }
    }
}
