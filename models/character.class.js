/************************************************
 * character.class.js
 ************************************************/

/**
 * Represents the main character in the game with movement, animations, and sounds.
 */
class Character extends MovableObject {
    height = 220;
    width = 120;
    speed = 1.8;
    lastMovementTime = Date.now();
    idleTimeThreshold = 5000;
    idleAnimationFrameCounter = 0;
    longIdleFrameCounter = 0;
    idleAnimationSpeed = 40;
    longIdleAnimationSpeed = 40;
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
        './img/2_character_pepe/1_idle/idle/I-10.png'
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
        './img/2_character_pepe/1_idle/long_idle/I-20.png'
    ];
    IMAGES_WALKING = [
        './img/2_character_pepe/2_walk/W-21.png',
        './img/2_character_pepe/2_walk/W-22.png',
        './img/2_character_pepe/2_walk/W-23.png',
        './img/2_character_pepe/2_walk/W-24.png',
        './img/2_character_pepe/2_walk/W-25.png',
        './img/2_character_pepe/2_walk/W-26.png'
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
        './img/2_character_pepe/3_jump/J-39.png'
    ];
    IMAGES_DEAD = [
        './img/2_character_pepe/5_dead/D-51.png',
        './img/2_character_pepe/5_dead/D-52.png',
        './img/2_character_pepe/5_dead/D-53.png',
        './img/2_character_pepe/5_dead/D-54.png',
        './img/2_character_pepe/5_dead/D-55.png',
        './img/2_character_pepe/5_dead/D-56.png',
        './img/2_character_pepe/5_dead/D-57.png'
    ];
    IMAGES_HURT = [
        './img/2_character_pepe/4_hurt/H-41.png',
        './img/2_character_pepe/4_hurt/H-42.png',
        './img/2_character_pepe/4_hurt/H-43.png'
    ];

    world;

    walking_sound = new Audio('audio/walking.mp3');
    jump_sound = new Audio('audio/jump.mp3');
    character_jump_sound = new Audio('audio/character_jump.mp3');
    character_hurt_sound = new Audio('audio/character_hurt.mp3');
    snoring_sound = new Audio('audio/snoring.mp3');
    gameover_sound = new Audio('audio/gameover3.mp3');
    bounce_sound = new Audio('./audio/jump.mp3');

    // NEW: Sound for winning the game
    win_sound = new Audio('audio/win.mp3');

    /**
     * Creates an instance of Character.
     * @param {StatusBar} statusBar - The UI element displaying health.
     */
    constructor(statusBar) {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadAllImages();
        this.applyGravityWith(2.5);
        this.statusBar = statusBar;
        this.configureSounds();
        this.setHitbox();
        this.animate();
    }

    /** Loads all character animations into memory. */
    loadAllImages() {
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
    }

    /** Configures audio volumes and looping. */
    configureSounds() {
        this.walking_sound.volume = 0.15;
        this.jump_sound.volume = 0.3;
        this.character_jump_sound.volume = 0.2;
        this.character_hurt_sound.volume = 0.2;
        this.snoring_sound.volume = 0.5;
        this.snoring_sound.loop = true;
        this.gameover_sound.volume = 0.6;
        this.bounce_sound.volume = 0.3;

        // NEW: Volume for the win sound
        this.win_sound.volume = 0.6;
    }

    /** Defines the hitbox area for collision detection. */
    setHitbox() {
        this.hitboxOffsetX = 20;
        this.hitboxOffsetY = 90;
        this.hitboxWidth = this.width - 50;
        this.hitboxHeight = this.height - 100;
    }

    /** Starts the character animation loop using requestAnimationFrame. */
    animate() {
        requestAnimationFrame(this.update.bind(this));
    }

    /**
     * Main update loop called on every animation frame.
     * @param {DOMHighResTimeStamp} timestamp - The current time.
     */
    update(timestamp) {
        if (this.dead) return;

        this.updatePosition();
        this.updateCamera();
        this.handleIdleState();

        this.updateAnimationFrame(timestamp);
        requestAnimationFrame(this.update.bind(this));
    }

    /** Handles character movement based on keyboard input. */
    updatePosition() {
        const keys = this.world.keyboard;
        const now = Date.now();

        // Move Right
        if (keys.RIGHT && this.x < this.world.level.level_end_x) {
            this.moveCharacter(true, now);
        }
        // Move Left
        else if (keys.LEFT && this.x > 0) {
            this.moveCharacter(false, now);
        }
        // No horizontal movement
        else {
            this.stopWalkingSound();
        }

        // Jump
        if ((keys.UP || keys.SPACE) && !this.isAboveGround()) {
            this.jumpCharacter(now);
        }
    }

    /**
     * Moves the character left or right.
     * @param {boolean} toRight - Direction to move.
     * @param {number} time - Current time for idle tracking.
     */
    moveCharacter(toRight, time) {
        if (toRight) {
            this.moveRight();
            this.otherDirection = false;
        } else {
            this.moveLeft();
            this.otherDirection = true;
        }
        this.lastMovementTime = time;
        this.stopSnoring();
        if (!this.isAboveGround()) {
            this.walking_sound.play();
        } else {
            this.stopWalkingSound();
        }
    }

    /**
     * Makes the character jump.
     * @param {number} time - Current time for idle tracking.
     */
    jumpCharacter(time) {
        this.jump();
        this.character_jump_sound.play();
        setTimeout(() => this.jump_sound.play(), 150);
        this.lastMovementTime = time;
        this.stopSnoring();
    }

    /** Stops the walking sound if it's currently playing. */
    stopWalkingSound() {
        if (!this.walking_sound.paused) {
            this.walking_sound.pause();
            this.walking_sound.currentTime = 0;
        }
    }

    /** Stops the snoring sound if it's playing. */
    stopSnoring() {
        if (this.snoringSoundPlaying) {
            this.snoring_sound.pause();
            this.snoring_sound.currentTime = 0;
            this.snoringSoundPlaying = false;
        }
    }

    /** Determines and plays idle or long idle animations based on inactivity. */
    handleIdleState() {
        const now = Date.now();
        if (
            !this.world.keyboard.LEFT &&
            !this.world.keyboard.RIGHT &&
            !this.isAboveGround()
        ) {
            this.playIdleAnimations(now);
        }
    }

    /**
     * Handles idle and long idle animation playback.
     * @param {number} currentTime - Current timestamp.
     */
    playIdleAnimations(currentTime) {
        if (currentTime - this.lastMovementTime >= this.idleTimeThreshold) {
            if (!this.snoringSoundPlaying) {
                this.snoring_sound.play();
                this.snoringSoundPlaying = true;
            }
            if (++this.longIdleFrameCounter % this.longIdleAnimationSpeed === 0) {
                this.playAnimation(this.IMAGES_LONG_IDLE);
            }
        } else {
            if (++this.idleAnimationFrameCounter % this.idleAnimationSpeed === 0) {
                this.playAnimation(this.IMAGES_IDLE);
            }
        }
    }

    /** Adjusts the camera to follow the character. */
    updateCamera() {
        this.world.camera_x = -this.x + 100;
    }

    /**
     * Updates the current animation frame based on time delta.
     * @param {DOMHighResTimeStamp} timestamp
     */
    updateAnimationFrame(timestamp) {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const delta = timestamp - this.lastFrameTime;
        const duration = this.calculateFrameDuration(this.speed);
        if (delta >= duration) {
            this.decideCurrentAnimation();
            this.lastFrameTime = timestamp;
        }
    }

    /**
     * Calculates duration between frames based on movement speed.
     * @param {number} speed
     * @returns {number}
     */
    calculateFrameDuration(speed) {
        const base = 200;
        const factor = Math.abs(speed) / this.speed;
        return Math.max(base / (1 + factor), 100);
    }

    /** Determines the current animation based on character state. */
    decideCurrentAnimation() {
        if (this.isDead()) {
            this.dead = true;
            this.gameOver();
        } else if (!this.isInvulnerable && this.isHurt()) {
            this.takeDamage(20);
        } else if (!this.isInvulnerable && this.isAboveGround()) {
            this.playAnimation(this.IMAGES_JUMPING);
        } else if (!this.isInvulnerable && (this.world.keyboard.LEFT || this.world.keyboard.RIGHT)) {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }

    /**
     * Reduces health and triggers hurt animation/sound.
     * @param {number} amount - The amount of health to reduce.
     */
    takeDamage(amount) {
        if (this.isInvulnerable || this.dead || this.isAnimatingHurt) return;
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            if (!this.dead) {
                this.dead = true;
                this.gameOver();
            }
        }
        this.statusBar?.setPercentage(this.health);
        this.isInvulnerable = true;
        this.playHurtAnimation();
        this.character_hurt_sound.play();

        setTimeout(() => (this.isInvulnerable = false), 150 * this.IMAGES_HURT.length);
    }

    /** Starts the hurt animation sequence. */
    playHurtAnimation() {
        if (this.isAnimatingHurt) return;
        this.isAnimatingHurt = true;
        this._startAnimation(this.IMAGES_HURT, 150, () => {
            this.isAnimatingHurt = false;
        });
    }

    /**
     * Starts a frame-based animation using requestAnimationFrame.
     * @param {string[]} frames - Array of image keys to animate through.
     * @param {number} frameDuration - Time between frames in ms.
     * @param {Function} onComplete - Callback when animation finishes.
     */
    _startAnimation(frames, frameDuration, onComplete) {
        let frameIndex = 0;
        let lastTime = 0;

        const animate = (time) => {
            if (this._shouldAdvanceFrame(time, lastTime, frameDuration)) {
                this._setFrame(frames, frameIndex++);
                lastTime = time;
            }
            frameIndex < frames.length
                ? requestAnimationFrame(animate)
                : onComplete?.();
        };
        requestAnimationFrame(animate);
    }

    /**
     * Checks if enough time has passed to advance to the next frame.
     * @param {number} currentTime
     * @param {number} lastTime
     * @param {number} duration
     * @returns {boolean}
     * @private
     */
    _shouldAdvanceFrame(currentTime, lastTime, duration) {
        return !lastTime || currentTime - lastTime >= duration;
    }

    /**
     * Sets the current image from the frame array and image cache.
     * @param {string[]} frames
     * @param {number} index
     * @private
     */
    _setFrame(frames, index) {
        if (this.imageCache && frames[index]) {
            this.img = this.imageCache[frames[index]];
        }
    }

    /** @returns {boolean} True if the character is dead. */
    isDead() {
        return this.health <= 0;
    }

    /** Triggers the game over animation and screen display (i.e., losing). */
    gameOver() {
        this.stopAllSounds();
        this.gameover_sound.play();
        this._startAnimation(this.IMAGES_DEAD, 200, () => this._onGameOverComplete());
    }

    /**
     * Called after the game over animation completes.
     * Displays the game over screen and pauses the game.
     * @private
     */
    _onGameOverComplete() {
        setTimeout(() => {
            document.getElementById('gameOverScreen')?.classList.remove('hidden');
            this.world?.pauseGame?.();
        }, 500);
    }

    /**
     * NEW: Call this if you want to trigger a "victory" scenario 
     * (like if the player kills the Endboss).
     */
    playWinSound() {
        this.stopAllSounds();
        this.win_sound.play();
    }

    stopAllSounds() {
        const sounds = [
            this.walking_sound,
            this.jump_sound,
            this.character_jump_sound,
            this.character_hurt_sound,
            this.snoring_sound,
            this.gameover_sound,
            this.bounce_sound,
            this.win_sound
        ];
        sounds.forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        this.snoringSoundPlaying = false;
    }

    /**
     * Mutes or unmutes all character sounds.
     * @param {boolean} muted
     */
    setMute(muted) {
        this.walking_sound.muted = muted;
        this.jump_sound.muted = muted;
        this.character_jump_sound.muted = muted;
        this.character_hurt_sound.muted = muted;
        this.snoring_sound.muted = muted;
        this.gameover_sound.muted = muted;
        this.bounce_sound.muted = muted;
        this.win_sound.muted = muted;
    }

    /**
     * Determines if this object is above another (for collision logic).
     * @param {MovableObject} other
     * @returns {boolean}
     */
    isAbove(other) {
        return this.y + this.hitboxHeight - 10 <= other.y;
    }

    /**
     * Wakes the character from an idle/snoring state, resetting idle counters.
     */
    wakeUp() {
        if (this.snoringSoundPlaying) {
            this.stopSnoring();
            this.lastMovementTime = Date.now();
            this.longIdleFrameCounter = 0;
            this.idleAnimationFrameCounter = 0;
        }
    }
}
