class Cloud extends MovableObject{
    y = 20;
    height = 320;
    width = 600;



    constructor(){
        super().loadImage('./img/5_background/layers/4_clouds/1.png');
        this.x = 0 + Math.random() * 500;
        this.animate();
    }

    animate(){
        setInterval( () => {
            this.moveLeft();
        }, 1000 / 60);
    }


}