class Character extends MovableObject {
    height = 220;
    width = 120;
    speed = 3;
    lastMovementTime = Date.now();
    isIdle = false;
    idleTimeThreshold = 5000;
    idleAnimationFrameCounter = 0;
    longIdleFrameCounter = 0;
    idleAnimationSpeed = 10;
    longIdleAnimationSpeed = 10;
    snoringSoundPlaying = false;

    IMAGES_IDLE = [
        './img/2_character_pepe/1_idle/idle/I-1.png',
        './img/2_character_pepe/1_idle/idle/I-2.png',
        './img/2_character_pepe/1_idle/idle/I-3.png',
        './img/2_character_pepe/1_idle/idle/I-4.png',
        './img/2_character_pepe/1_idle/idle/I-5.png',
        './img/2_character_pepe/1_idle/idle/I-6.png',
        './img/2_character_pepe/1_idle/idle/I-7.png',
        './img/2_character_pepe/1_idle/idle/I-8.png',
        './img/2_character_pepe/1_idle/idle/I-9.png',
        './img/2_character_pepe/1_idle/idle/I-10.png',
    ];
    IMAGES_LONG_IDLE = [
        './img/2_character_pepe/1_idle/long_idle/I-11.png',
        './img/2_character_pepe/1_idle/long_idle/I-12.png',
        './img/2_character_pepe/1_idle/long_idle/I-13.png',
        './img/2_character_pepe/1_idle/long_idle/I-14.png',
        './img/2_character_pepe/1_idle/long_idle/I-15.png',
        './img/2_character_pepe/1_idle/long_idle/I-16.png',
        './img/2_character_pepe/1_idle/long_idle/I-17.png',
        './img/2_character_pepe/1_idle/long_idle/I-18.png',
        './img/2_character_pepe/1_idle/long_idle/I-19.png',
        './img/2_character_pepe/1_idle/long_idle/I-20.png',
    ];

    IMAGES_WALKING = [
        './img/2_character_pepe/2_walk/W-21.png',
        './img/2_character_pepe/2_walk/W-22.png',
        './img/2_character_pepe/2_walk/W-23.png',
        './img/2_character_pepe/2_walk/W-24.png',
        './img/2_character_pepe/2_walk/W-25.png',
        './img/2_character_pepe/2_walk/W-26.png',
    ];
    IMAGES_JUMPING = [
        './img/2_character_pepe/3_jump/J-31.png',
        './img/2_character_pepe/3_jump/J-32.png',
        './img/2_character_pepe/3_jump/J-33.png',
        './img/2_character_pepe/3_jump/J-34.png',
        './img/2_character_pepe/3_jump/J-35.png',
        './img/2_character_pepe/3_jump/J-36.png',
        './img/2_character_pepe/3_jump/J-37.png',
        './img/2_character_pepe/3_jump/J-38.png',
        './img/2_character_pepe/3_jump/J-39.png',
    ];
    IMAGES_DEAD = [
        './img/2_character_pepe/5_dead/D-51.png',
        './img/2_character_pepe/5_dead/D-52.png',
        './img/2_character_pepe/5_dead/D-53.png',
        './img/2_character_pepe/5_dead/D-54.png',
        './img/2_character_pepe/5_dead/D-55.png',
        './img/2_character_pepe/5_dead/D-56.png',
        './img/2_character_pepe/5_dead/D-57.png',
    ];
    IMAGES_HURT = [
        './img/2_character_pepe/4_hurt/H-41.png',
        './img/2_character_pepe/4_hurt/H-42.png',
        './img/2_character_pepe/4_hurt/H-43.png',
    ];
    world;
    walking_sound = new Audio('audio/walking.mp3');
    jump_sound = new Audio('audio/jump.mp3');
    character_jump_sound = new Audio('audio/character_jump.mp3');
    character_hurt_sound = new Audio('audio/character_hurt.mp3');
    snoring_sound = new Audio('audio/snoring.mp3');

    constructor() {
        super().loadImage('./img/2_character_pepe/2_walk/W-21.png')
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.applyGravity();
        this.animate();
        this.walking_sound.volume = 0.15;
        this.jump_sound.volume = 0.3;
        this.character_jump_sound.volume = 0.2;
        this.character_hurt_sound.volume = 0.2;
        this.snoring_sound.volume = 0.5;
        this.snoring_sound.loop = true;
    }

    animate() {
        setInterval(() => {
            this.walking_sound.pause();
            let currentTime = Date.now();
            let isMoving = false;

            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
                this.moveRight();
                this.walking_sound.play();
                this.otherDirection = false;
                this.lastMovementTime = currentTime;
                isMoving = true;
            }
            if (this.world.keyboard.LEFT && this.x > 0) {
                this.moveLeft();
                this.walking_sound.play();
                this.otherDirection = true;
                this.lastMovementTime = currentTime;
                isMoving = true;
            }
            if ((this.world.keyboard.UP && !this.isAboveGround()) || (this.world.keyboard.SPACE && !this.isAboveGround())) {
                this.jump();
                this.character_jump_sound.play();
                setTimeout(() => {
                    this.jump_sound.play();
                }, 150);
                this.lastMovementTime = currentTime;
                isMoving = true;
            }

            if (isMoving && this.snoringSoundPlaying) {
                this.snoring_sound.pause();
                this.snoring_sound.currentTime = 0;
                this.snoringSoundPlaying = false;
            }

            if (!isMoving && !this.isAboveGround()) {
                if (currentTime - this.lastMovementTime >= this.idleTimeThreshold) {
                    if (!this.snoringSoundPlaying) {
                        this.snoring_sound.play();
                        this.snoringSoundPlaying = true;
                    }
                    this.longIdleFrameCounter++;
                    if (this.longIdleFrameCounter % this.longIdleAnimationSpeed === 0) {
                        this.playAnimation(this.IMAGES_LONG_IDLE);
                    }
                } else {
                    this.idleAnimationFrameCounter++;
                    if (this.idleAnimationFrameCounter % this.idleAnimationSpeed === 0) {
                        this.playAnimation(this.IMAGES_IDLE);
                    }
                }
            }

            this.world.camera_x = -this.x + 100;
        }, 1000 / 60);

        setInterval(() => {
            if (this.isDead() && !this.dead) {
                this.dead = true;
                this.playAnimation(this.IMAGES_DEAD);
            } else if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
                this.character_hurt_sound.play();
            } else if (this.isAboveGround()) {
                this.playAnimation(this.IMAGES_JUMPING);
            } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 100);
    }

    setMute(muted) {
        this.walking_sound.muted = muted;
        this.jump_sound.muted = muted;
        this.character_jump_sound.muted = muted;
        this.character_hurt_sound.muted = muted;
        this.snoring_sound.muted = muted;
    }
    
    // function gameOver();
}
