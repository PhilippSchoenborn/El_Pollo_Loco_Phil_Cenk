/**
 * Represents the status bar that displays the player's coin level.
 * This class manages and updates the display of the coin level on the screen.
 */
class StatusBarCoins extends DrawableObject {
    /**
     * Array of image paths representing the coin status at different percentages.
     * Each image corresponds to a specific coin level (from 0% to 100%).
     * @type {Array<string>}
     */
    IMAGES_COINS = [
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png',
    ];

    /**
     * The percentage of coins collected (from 0 to 100).
     * @type {number}
     */
    percentage = 0;

    /**
     * Creates an instance of the StatusBarCoins class and initializes the status bar.
     * The bar starts at 0% and the corresponding image is loaded.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES_COINS);
        this.x = 25;
        this.y = 40;
        this.width = 180;
        this.height = 50;
        this.updateImage();
    }

    /**
     * Sets the percentage of the coins collected and updates the displayed image accordingly.
     * The percentage is capped at 100% to avoid values greater than the maximum.
     * @param {number} percentage - The new percentage of coins collected (between 0 and 100).
     */
    setPercentage(percentage) {
        this.percentage = Math.min(percentage, 100);
        this.updateImage();
    }

    /**
     * Increases the coin level by 10%, ensuring the value doesn't exceed 100%.
     */
    increaseCoins() {
        this.setPercentage(this.percentage + 20);
    }

    /**
     * Updates the image displayed in the status bar based on the current coin percentage.
     * The percentage is used to determine which image to show from the IMAGES_COINS array.
     */
    updateImage() {
        const index = Math.floor(this.percentage / 20);
        this.img = this.imageCache[this.IMAGES_COINS[index]];
    }
}
