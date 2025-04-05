/**
 * Represents a drawable object with properties for position, size, and image handling.
 * This object can load and display an image, and optionally draw a border around itself.
 */
class DrawableObject {
    /**
     * Creates an instance of a drawable object with default properties for position, size, and image handling.
     */
    constructor() {
        // Default properties assigned using Object.assign
        Object.assign(this, { x: 120, y: 210, height: 90, width: 175, img: null, imageCache: {}, currentImage: 0 });
    }

    /**
     * Loads an image from the specified path and assigns it to the object's `img` property.
     * 
     * @param {string} path - The path to the image file.
     */
    loadImage = (path) => (this.img = new Image(), this.img.src = path);

    /**
     * Loads multiple images and stores them in the `imageCache` object, with each path as a key.
     * Each image is created and its source is set based on the paths provided in the array.
     * 
     * @param {string[]} arr - An array of image file paths to load.
     */
    loadImages = (arr) => arr.forEach(path => this.imageCache[path] = Object.assign(new Image(), { src: path }));

    /**
     * Draws the current image of the object onto the specified canvas context at the object's position and size.
     * 
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
     */
    draw(ctx) {
        this.img && ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
     * Draws a border around the object if it is an instance of certain classes (Character, Chicken, Chick, Endboss, CollectableCoins, CollectableBottle).
     * The border is drawn using a green stroke with a line width of 2.
     * 
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw the frame on.
     */
    drawFrame(ctx) {
        if ([Character, Chicken, Chick, Endboss, CollectableCoins, CollectableBottle].some(cls => this instanceof cls)) {
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
