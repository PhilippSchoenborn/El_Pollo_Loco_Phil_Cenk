class ThrowableObject extends MovableObject {

    constructor(){
        super().loadImage('./img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png')
        this.x = 100;
        this.y = 360;
        this.width = 60;
        this.height = 70;
        // this.throw(100, 150)
        // this.loadImages();

    }

    throw(x, y){
        this.x = x;
        this.y = y;
        this.speedY = 30;
        this.applyGravity();
        setInterval(() => {
            this.x +=10
        }, 35);
    }
}