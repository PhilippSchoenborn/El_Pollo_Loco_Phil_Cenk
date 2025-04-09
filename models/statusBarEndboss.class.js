/**
 * Represents the health bar for the Endboss.
 */
class StatusBarEndboss extends DrawableObject {
    /**
     * Array of images showing the boss health in orange.
     */
    IMAGES_LIFE = [
        './img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
        './img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
        './img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
        './img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
        './img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
        './img/7_statusbars/2_statusbar_endboss/orange/orange100.png',
    ];

    percentage = 100;

    /**
     * Creates an instance of the status bar for the Endboss's life (health).
     * 
     * Initializes the image set for the health display, sets the initial percentage to 100%,
     * and positions the status bar on the screen with a defined width and height.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES_LIFE);
        this.setPercentage(100);
        this.x = 240;
        this.y = 0;
        this.width = 180;
        this.height = 60;
    }

    /**
     * Sets the boss health percentage and updates the displayed image accordingly.
     * @param {number} percentage
     */
    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(100, Math.round(percentage)));
        const index = this.resolveImageIndex();
        this.img = this.imageCache[this.IMAGES_LIFE[index]];
    }

    /**
     * Determines the appropriate image index to represent the current health percentage.
     * 
     * The returned index corresponds to different health bar images based on the current
     * percentage value. Higher percentages return higher indices, representing a fuller bar.
     * 
     * @returns {number} The image index ranging from 0 (empty) to 5 (full).
     */
    resolveImageIndex() {
        if (this.percentage === 100) return 5;
        else if (this.percentage >= 80) return 4;
        else if (this.percentage >= 60) return 3;
        else if (this.percentage >= 40) return 2;
        else if (this.percentage >= 20) return 1;
        else return 0;
    }
}
