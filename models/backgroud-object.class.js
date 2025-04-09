/**
 * Represents a background object in the game, such as a part of the scenery.
 * Inherits from MovableObject to enable positioning and image handling.
 * These objects are typically used to create a parallax background effect.
 *
 * @extends MovableObject
 */
class BackgroundObject extends MovableObject {

    /** @type {number} The width of the background object. */
    width = 720;

    /** @type {number} The height of the background object. */
    height = 480;

    /**
     * Creates a new BackgroundObject.
     * Loads the image and positions the object at the bottom of the canvas.
     *
     * @param {string} imagePath - The file path to the background image.
     * @param {number} x - The horizontal position of the object in the world.
     */
    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }
}
