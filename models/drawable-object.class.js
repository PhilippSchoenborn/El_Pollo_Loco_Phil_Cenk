/**
 * Represents a drawable object with properties for position, size, and image handling.
* This object can load and display an image, and optionally draw a border around itself.
*/
class DrawableObject {
    constructor() {
        this.x = 120;
        this.y = 210;
        this.height = 90;
        this.width = 175;
        this.img = null;
        this.imageCache = {};
        this.currentImage = 0;
    }

    /**
     * Loads an image from the specified path and assigns it to the object's `img` property.
     * @param {string} path - The path to the image file.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Loads multiple images and stores them in the `imageCache` object.
     * @param {string[]} arr - An array of image paths.
     */
    loadImages(arr) {
        arr.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    /**
     * Draws the object's current image to the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        if (this.img) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }

    /**
     * Draws a green border around the object's hitbox (for debugging).
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    drawFrame(ctx) {
        const { x, y, width, height } = this.getHitboxDimensions();
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    }

    /**
     * Draws a red hitbox outline around the object (for debugging).
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    drawHitbox(ctx) {
        const { x, y, width, height } = this.getHitboxDimensions();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    }

    /**
     * Returns the object's current hitbox dimensions, taking into account any offsets.
     * @returns {{ x: number, y: number, width: number, height: number }}
     */
    getHitboxDimensions() {
        if (this.hitbox) return getFromHitbox.call(this);
        if (this.hitboxOffsetX !== undefined) return getFromOffsets.call(this);
        return getDefaultHitbox.call(this);
    }

    /**
     * Returns the hitbox position and dimensions based on the internal `hitbox` object.
    * @returns {{x: number, y: number, width: number, height: number}} The calculated hitbox rectangle.
    */
    getFromHitbox() {
        return {
            x: this.x + this.hitbox.offsetX,
            y: this.y + this.hitbox.offsetY,
            width: this.hitbox.width,
            height: this.hitbox.height,
        };
    }

    /**
     * Returns the hitbox position and dimensions using individual offset and dimension properties.
     * Useful if hitbox data is stored directly on the object rather than in a `hitbox` object.
     * 
     * @returns {{x: number, y: number, width: number, height: number}} The calculated hitbox rectangle with optional fallbacks.
     */
    getFromOffsets() {
        return {
            x: this.x + this.hitboxOffsetX,
            y: this.y + this.hitboxOffsetY,
            width: this.hitboxWidth || this.width,
            height: this.hitboxHeight || this.height,
        };
    }

    /**
     * Returns the default hitbox using the object's position and dimensions.
     * 
     * @returns {{x: number, y: number, width: number, height: number}} A basic rectangle matching the object’s bounds.
     */
    getDefaultHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
    }
}
