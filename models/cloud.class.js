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

        // Initial position (could be 0 or negative, if desired)
        this.x = 0;
        this.y = Math.random() * 100;
        this.canvasWidth = canvasWidth;

        // Number of image segments needed to fill the entire screen + 1
        this.segments = Math.ceil(canvasWidth / this.width) + 1;

        this.animate();
    }

    /**
     * Uses setInterval to update the cloud’s position at ~60 FPS.
     * No "snap back" is performed; x just keeps decreasing.
     */
    animate() {
        let lastTime = performance.now();

        // Update ~60 times/sec (1000/60 ≈ 16.67ms)
        setInterval(() => {
            const now = performance.now();
            const deltaTime = now - lastTime;  // Time since last update

            // Move left, factoring in deltaTime so speed is consistent
            this.x -= this.speed * (deltaTime / (1000 / 60));

            lastTime = now;
        }, 1000 / 60);
    }

    /**
     * Draws the cloud segments in a seamless loop.
     * Uses modulo arithmetic to avoid visual snapping.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context.
     */
    draw(ctx) {
        // Determine the offset so the first (leftmost) image
        // starts correctly on the screen when x is negative.
        let offsetX = this.x % this.width;
        if (offsetX > 0) {
            // If % is positive, shift left by one image width
            offsetX -= this.width;
        }

        // Draw enough segments to fill the screen
        for (let i = 0; i < this.segments; i++) {
            // Pick which image to use (rotate through the array)
            const imgIndex = i % this.images.length;
            const image = this.imageCache[this.images[imgIndex]];

            // Calculate exact draw position for each segment
            const drawX = offsetX + i * this.width;

            // Draw the cloud image
            ctx.drawImage(image, drawX, this.y, this.width, this.height);
        }
    }
}
