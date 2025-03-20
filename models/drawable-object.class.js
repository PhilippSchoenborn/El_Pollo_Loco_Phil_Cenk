class DrawableObject {
    constructor() {
        Object.assign(this, { x: 120, y: 210, height: 90, width: 175, img: null, imageCache: {}, currentImage: 0 });
    }

    loadImage = (path) => (this.img = new Image(), this.img.src = path);

    loadImages = (arr) => arr.forEach(path => this.imageCache[path] = Object.assign(new Image(), { src: path }));

    draw(ctx) {
        this.img && ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    drawFrame(ctx) {
        if ([Character, Chicken, Endboss, CollectableCoins, CollectableBottle].some(cls => this instanceof cls)) {
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}