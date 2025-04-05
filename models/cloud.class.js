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
    ];
    speed = 0.2;

    /**
     * Creates a new cloud object that moves horizontally across the canvas.
     * 
     * @param {number} canvasWidth - The width of the canvas used to calculate cloud segments.
     */
    constructor(canvasWidth) {
        super();
        this.loadImages(this.images);
        this.x = 0;
        this.y = Math.random() * 100;
        this.canvasWidth = canvasWidth;
        this.segments = Math.ceil(canvasWidth / this.width) + 1;
        this.fadeProgress = 0;
        this.animate();
    }

    /**
     * Starts the animation loop for the cloud's movement and fading effect.
     * 
     * @private
     */
    animate() {
        let lastTimestamp = 0;
        const animateFrame = (timestamp) => {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const deltaTime = timestamp - lastTimestamp;
            this.x -= this.speed * (deltaTime / (1000 / 60));
            this.fadeProgress = (this.fadeProgress + this.speed * (deltaTime / (1000 / 60))) % this.width;
            if (this.x <= -this.width) this.x += this.width;
            lastTimestamp = timestamp;
            requestAnimationFrame(animateFrame);
        };
        requestAnimationFrame(animateFrame);
    }

    /**
     * Draws the cloud on the given canvas context with a scrolling effect.
     * The cloud is drawn in multiple segments with a fade effect to create a continuous movement.
     * 
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context to draw the cloud.
     */
    draw(ctx) {
        for (let i = 0; i < this.segments; i++) {
            const currentImage = this.imageCache[this.images[i % this.images.length]];
            const nextImage = this.imageCache[this.images[(i + 1) % this.images.length]];
            ctx.globalAlpha = 1 - (this.fadeProgress / this.width);
            ctx.drawImage(currentImage, this.x + i * this.width, this.y, this.width, this.height);
            ctx.globalAlpha = this.fadeProgress / this.width;
            ctx.drawImage(nextImage, this.x + i * this.width, this.y, this.width, this.height);
            ctx.globalAlpha = 1;
        }
    }
}
