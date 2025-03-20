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

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr) {
        arr.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    draw(ctx) {
        if (this.img) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }

    drawFrame(ctx) {
        const frameTypes = [Character, Chicken, Endboss, CollectableCoins];
        
        if (frameTypes.some(type => this instanceof type)) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'green';
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    }
}