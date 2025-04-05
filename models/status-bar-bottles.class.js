/**
 * Represents the status bar that displays the player's bottle level.
 * This class manages and updates the display of the bottle level on the screen.
 */
class StatusBarBottles extends DrawableObject {
    /**
     * Array of image paths representing the bottle status at different percentages.
     * Each image corresponds to a specific bottle level (from 0% to 100%).
     * @type {Array<string>}
     */
    IMAGES_BOTTLES = [
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png',
    ];

    /**
     * The percentage of bottles available (from 0 to 100).
     * @type {number}
     */
    percentage = 0;

    /**
     * Creates an instance of the StatusBarBottles class and initializes the status bar.
     * The bar starts at 0% and the corresponding image is loaded.
     */
    constructor() {
        super();
        Object.assign(this, { x: 25, y: 80, width: 180, height: 50 });
        this.loadImages(this.IMAGES_BOTTLES);
        this.setPercentage(0);
    }

    /**
     * Sets the percentage of the bottle level and updates the displayed image accordingly.
     * @param {number} percentage - The new percentage of bottles (between 0 and 100).
     */
    setPercentage(percentage) {
        this.img = this.imageCache[this.IMAGES_BOTTLES[this.resolveImageIndex(this.percentage = percentage)]]; 
    }

    /**
     * Increases the bottle level by 10%, ensuring it doesn't exceed 100%.
     */
    increaseBottles() {
        this.setPercentage(Math.min(this.percentage + 10, 100));
    }

    /**
     * Decreases the bottle level by 10%, ensuring it doesn't go below 0%.
     */
    decreaseBottles() {
        this.setPercentage(Math.max(this.percentage - 10, 0));
    }

    /**
     * Resolves the image index based on the current percentage.
     * Maps the percentage to an image index (from 0 to 5) corresponding to the bottle level.
     * @returns {number} The index of the image to display, corresponding to the percentage.
     */
    resolveImageIndex() {
        return Math.min(Math.floor(this.percentage / 20), 5);
    }
}
