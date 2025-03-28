class Character extends MovableObject {
    height = 220;
    width = 120;
    speed = 1.5;
    lastMovementTime = Date.now();
    isIdle = false;
    idleTimeThreshold = 5000;
    idleAnimationFrameCounter = 0;
    longIdleFrameCounter = 0;
    idleAnimationSpeed = 10;
    longIdleAnimationSpeed = 10;
    snoringSoundPlaying = false;
    health = 100;
    dead = false;
    statusBar = null;
    isInvulnerable = false;
    isAnimatingHurt = false;

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

    constructor(statusBar) {
        super().loadImage('./img/2_character_pepe/2_walk/W-21.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.applyGravity();
        this.animate();
        this.statusBar = statusBar;

        this.walking_sound.volume = 0.15;
        this.jump_sound.volume = 0.3;
        this.character_jump_sound.volume = 0.2;
        this.character_hurt_sound.volume = 0.2;
        this.snoring_sound.volume = 0.5;
        this.snoring_sound.loop = true;

        // Corrected hitbox
        this.hitboxOffsetX = 20;
        this.hitboxOffsetY = 50;
        this.hitboxWidth = this.width - 40;
        this.hitboxHeight = this.height - 80;
    }

    playHurtAnimation() {
        if (this.isAnimatingHurt) return;
        this.isAnimatingHurt = true;
        let frameIndex = 0;
        let lastFrameTime = 0;
        const frameDuration = 150;
        const animateHurt = (timestamp) => {
            if (!lastFrameTime) lastFrameTime = timestamp;
            const deltaTime = timestamp - lastFrameTime;
            if (deltaTime >= frameDuration) {
                this.img = this.imageCache[this.IMAGES_HURT[frameIndex]];
                frameIndex++;
                if (frameIndex >= this.IMAGES_HURT.length) {
                    this.isAnimatingHurt = false;
                    return;
                }
                lastFrameTime = timestamp;
            }
            requestAnimationFrame(animateHurt);
        };
        requestAnimationFrame(animateHurt);
    }

    takeDamage(damageAmount) {
        if (this.isInvulnerable || this.dead || this.isAnimatingHurt) return;
        this.health -= damageAmount;
        if (this.health <= 0) {
            this.health = 0;
            if (!this.dead) {
                this.dead = true;
                this.gameOver();
            }
        }
        if (this.statusBar) {
            this.statusBar.setPercentage(this.health);
        }
        this.isInvulnerable = true;
        this.playHurtAnimation();
        this.character_hurt_sound.play();
        setTimeout(() => {
            this.isInvulnerable = false;
        }, 150 * this.IMAGES_HURT.length);
    }

    animate() {
        let lastFrameTime = 0;
        const handleMovement = (timestamp) => {
            if (this.dead) return;
            let currentTime = Date.now();
            let isMoving = false;
            let movementSpeed = 0;
            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
                this.handleWalk(true, currentTime);
                movementSpeed = this.speed;
                isMoving = true;
            }
            if (this.world.keyboard.LEFT && this.x > 0) {
                this.handleWalk(false, currentTime);
                movementSpeed = -this.speed;
                isMoving = true;
            }
            if ((this.world.keyboard.UP && !this.isAboveGround()) ||
                (this.world.keyboard.SPACE && !this.isAboveGround())) {
                this.handleJump(currentTime);
                isMoving = true;
            }
            if (!isMoving && !this.isAboveGround()) {
                this.handleIdle(currentTime);
            }
            this.world.camera_x = -this.x + 100;
            let frameDuration = this.calculateFrameDuration(movementSpeed);
            requestAnimationFrame(() => handleAnimations(timestamp, frameDuration));
            requestAnimationFrame(handleMovement);
        };
        const handleAnimations = (timestamp, frameDuration) => {
            if (this.dead) return;
            const deltaTime = timestamp - lastFrameTime;
            if (deltaTime >= frameDuration) {
                if (this.isDead()) {
                    this.dead = true;
                    this.gameOver();
                } else if (!this.isInvulnerable && this.isHurt()) {
                    this.takeDamage(20);
                } else if (!this.isInvulnerable && this.isAboveGround()) {
                    this.playAnimation(this.IMAGES_JUMPING);
                } else if (!this.isInvulnerable &&
                          (this.world.keyboard.RIGHT || this.world.keyboard.LEFT)) {
                    this.playAnimation(this.IMAGES_WALKING);
                }
                lastFrameTime = timestamp;
            }
            requestAnimationFrame(() => handleAnimations(timestamp, frameDuration));
        };
        requestAnimationFrame(handleMovement);
    }
    
    calculateFrameDuration(movementSpeed) {
        const baseDuration = 200;
        let speedFactor = Math.abs(movementSpeed) / this.speed;
        let adjustedDuration = baseDuration / (1 + speedFactor);
        return Math.max(adjustedDuration, 100);
    }
    
    handleWalk(direction, currentTime) {
        direction ? this.moveRight() : this.moveLeft();
        this.walking_sound.play();
        this.otherDirection = !direction;
        this.lastMovementTime = currentTime;
    }
    
    handleJump(currentTime) {
        this.jump();
        this.character_jump_sound.play();
        setTimeout(() => this.jump_sound.play(), 150);
        this.lastMovementTime = currentTime;
    }
    
    handleIdle(currentTime) {
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

    isDead() {
        return this.health <= 0;
    }

    gameOver() {
        let frameIndex = 0;
        const frameDuration = 200;
        let lastFrameTime = 0;
        const animateGameOver = (timestamp) => {
            if (!lastFrameTime) lastFrameTime = timestamp;
            const deltaTime = timestamp - lastFrameTime;
            if (deltaTime >= frameDuration) {
                this.img = this.imageCache[this.IMAGES_DEAD[frameIndex]];
                frameIndex++;
                lastFrameTime = timestamp;
            }
            if (frameIndex < this.IMAGES_DEAD.length) {
                requestAnimationFrame(animateGameOver);
            } else {
                setTimeout(() => {
                    document.getElementById("gameOverScreen").classList.remove("hidden");
                    document.getElementById("tryAgainButton").classList.remove("hidden");
    
                    if (this.world && typeof this.world.pauseGame === "function") {
                        this.world.pauseGame();
                    }
                }, 500);
            }
        };
        requestAnimationFrame(animateGameOver);
    }

    setMute(muted) {
        this.walking_sound.muted = muted;
        this.jump_sound.muted = muted;
        this.character_jump_sound.muted = muted;
        this.character_hurt_sound.muted = muted;
        this.snoring_sound.muted = muted;
    }

    isAbove(otherObject) {
        return this.y + this.hitboxHeight - 10 <= otherObject.y;
    }

    bounce() {
        this.speedY = 15;
    }
}
