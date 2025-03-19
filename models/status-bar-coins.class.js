class StatusBarCoins extends DrawableObject {
    IMAGES_COINS = [
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png',
        './img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png',
    ];
    percentage = 0;

    constructor() {
        super();
        this.loadImages(this.IMAGES_COINS);
        this.x = 25;
        this.y = 40;
        this.width = 180;
        this.height = 50;
        this.updateImage();
    }

    setPercentage(percentage) {
        this.percentage = Math.min(percentage, 100);
        this.updateImage();
    }

    increaseCoins() {
        this.setPercentage(this.percentage + 10);
    }

    updateImage() {
        const index = Math.floor(this.percentage / 20);
        this.img = this.imageCache[this.IMAGES_COINS[index]];
    }
}