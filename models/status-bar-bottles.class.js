class StatusBarBottles extends DrawableObject {
    IMAGES_BOTTLES = [
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png',
        './img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png',
    ];

    percentage = 0;

    constructor() {
        super();
        Object.assign(this, { x: 25, y: 80, width: 180, height: 50 });
        this.loadImages(this.IMAGES_BOTTLES);
        this.setPercentage(0);
    }

    setPercentage(percentage) {
        this.img = this.imageCache[this.IMAGES_BOTTLES[this.resolveImageIndex(this.percentage = percentage)]];
    }

    increaseBottles() { this.setPercentage(Math.min(this.percentage + 10, 100)); }
    decreaseBottles() { this.setPercentage(Math.max(this.percentage - 10, 0)); }

    resolveImageIndex() {
        return Math.min(Math.floor(this.percentage / 20), 5);
    }
}