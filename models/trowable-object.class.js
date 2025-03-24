class ThrowableObject extends MovableObject {

    throw_sound = new Audio('audio/throw.mp3');

    constructor(x, y){
        super().loadImage('./img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png')
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 70;
        this.throw()
        this.throw_sound.volume = 0.5;
    }

    throw(){
        this.speedY = 30;
        this.applyGravity();
        setInterval(() => {
            this.x += 10;
        }, 35);
        this.throw_sound.play();
    }
}