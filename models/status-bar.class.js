/**
 * Represents the health status bar in the game.
 * This class manages and updates the display of the player's health based on a percentage.
 */
class StatusBar extends DrawableObject {
    /**
     * Array of image paths representing the health status at different percentages.
     * Each image corresponds to a specific health level (from 0% to 100%).
     * @type {Array<string>}
     */
    IMAGES_LIFE = [
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png',
        './img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png',
    ];

    /**
     * The current health percentage (from 0 to 100).
     * @type {number}
     */
    percentage = 100;

    /**
     * Creates an instance of the StatusBar class and initializes the health status bar.
     * The bar starts at 100% and the corresponding image is loaded.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES_LIFE);
        this.x = 25;
        this.y = 0;
        this.width = 180;
        this.height = 50;
        this.setPercentage(100);
    }

    /**
     * Sets the health percentage and updates the displayed image accordingly.
     * @param {number} percentage - The new health percentage (between 0 and 100).
     */
    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(100, Math.round(percentage))); // Clamp and round to avoid image mismatch
        const index = this.resolveImageIndex();
        const path = this.IMAGES_LIFE[index];
        this.img = this.imageCache[path];

        // 🔍 Debug log:
        console.log(`StatusBar: Health set to ${this.percentage}%. Showing image: ${path} (Index: ${index})`);
    }



    /**
     * Determines the index of the image to display based on the current health percentage.
     * @returns {number} The index of the image corresponding to the current health percentage.
     */
    resolveImageIndex() {
        if (this.percentage === 100) {
            return 5;
        } else if (this.percentage >= 80) {
            return 4;
        } else if (this.percentage >= 60) {
            return 3;
        } else if (this.percentage >= 40) {
            return 2;
        } else if (this.percentage >= 20) {
            return 1;
        } else {
            return 0;
        }
    }
}
