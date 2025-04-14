/**
 * Represents the main character with movement, animation, sound, and health logic.
 * @extends MovableObject
 */
class Character extends MovableObject {
    /** @type {number} */ height = 220;
    /** @type {number} */ width = 120;
    /** @type {number} */ speed = 3;
    /** @type {number} */ health = 100;
    /** @type {boolean} */ dead = false;
    /** @type {boolean} */ isInvulnerable = false;
    /** @type {boolean} */ isAnimatingHurt = false;
    /** @type {number} */ lastMovementTime = Date.now();
    /** @type {number} */ idleTimeThreshold = 5000;
    /** @type {number} */ idleAnimationFrameCounter = 0;
    /** @type {number} */ longIdleFrameCounter = 0;
    /** @type {number} */ idleAnimationSpeed = 20;
    /** @type {number} */ longIdleAnimationSpeed = 20;
    /** @type {boolean} */ snoringSoundPlaying = false;
    /** @type {StatusBar|null} */ statusBar = null;
    /** @type {number} */ lastFrameTimeAcc = 0;

    /** @type {string[]} */ IMAGES_IDLE = [...Array(10)].map((_, i) => `./img/2_character_pepe/1_idle/idle/I-${i + 1}.png`);
    /** @type {string[]} */ IMAGES_LONG_IDLE = [...Array(10)].map((_, i) => `./img/2_character_pepe/1_idle/long_idle/I-${i + 11}.png`);
    /** @type {string[]} */ IMAGES_WALKING = [...Array(6)].map((_, i) => `./img/2_character_pepe/2_walk/W-${21 + i}.png`);
    /** @type {string[]} */ IMAGES_JUMPING = [...Array(9)].map((_, i) => `./img/2_character_pepe/3_jump/J-${31 + i}.png`);
    /** @type {string[]} */ IMAGES_DEAD = [...Array(7)].map((_, i) => `./img/2_character_pepe/5_dead/D-${51 + i}.png`);
    /** @type {string[]} */ IMAGES_HURT = [...Array(3)].map((_, i) => `./img/2_character_pepe/4_hurt/H-${41 + i}.png`);

    /** @type {World} */ world;

    /** @type {HTMLAudioElement} */ walking_sound = new Audio('audio/walking.mp3');
    /** @type {HTMLAudioElement} */ jump_sound = new Audio('audio/jump.mp3');
    /** @type {HTMLAudioElement} */ character_jump_sound = new Audio('audio/character_jump.mp3');
    /** @type {HTMLAudioElement} */ character_hurt_sound = new Audio('audio/character_hurt.mp3');
    /** @type {HTMLAudioElement} */ snoring_sound = new Audio('audio/snoring.mp3');
    /** @type {HTMLAudioElement} */ gameover_sound = new Audio('audio/gameover3.mp3');
    /** @type {HTMLAudioElement} */ bounce_sound = new Audio('./audio/jump.mp3');
    /** @type {HTMLAudioElement} */ win_sound = new Audio('audio/win.mp3');

    /**
     * Creates the character and initializes sounds, images, and gravity.
     * @param {StatusBar} statusBar - The status bar showing character health.
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

    /** Loads all character images into cache. */
    loadAllImages() {
        [
            this.IMAGES_WALKING,
            this.IMAGES_JUMPING,
            this.IMAGES_DEAD,
            this.IMAGES_HURT,
            this.IMAGES_IDLE,
            this.IMAGES_LONG_IDLE
        ].forEach(set => this.loadImages(set));
    }

    /** Configures volume and settings for all sounds. */
    configureSounds() {
        this.walking_sound.volume = 0.15;
        this.jump_sound.volume = 0.3;
        this.character_jump_sound.volume = 0.2;
        this.character_hurt_sound.volume = 0.2;
        this.snoring_sound.volume = 0.5;
        this.snoring_sound.loop = true;
        this.gameover_sound.volume = 0.6;
        this.bounce_sound.volume = 0.3;
        this.win_sound.volume = 0.6;
    }

    /** Sets the hitbox for collision detection. */
    setHitbox() {
        this.hitboxOffsetX = 20;
        this.hitboxOffsetY = 90;
        this.hitboxWidth = this.width - 50;
        this.hitboxHeight = this.height - 100;
    }

    /** Starts the character animation loop. */
    animate() {
        let lastTime = Date.now();
        setInterval(() => {
            if (this.dead) return;
            const now = Date.now();
            const delta = now - lastTime;
            this.updatePosition();
            this.updateCamera();
            this.handleIdleState();
            this.updateAnimationFrame(delta);
            lastTime = now;
        }, 1000 / 60);
    }

    /** Handles movement and jumping based on keyboard input. */
    updatePosition() {
        const keys = this.world.keyboard;
        const now = Date.now();
        if (keys.RIGHT && this.x < this.world.level.level_end_x) this.moveCharacter(true, now);
        else if (keys.LEFT && this.x > 0) this.moveCharacter(false, now);
        else this.stopWalkingSound();

        if ((keys.UP || keys.SPACE) && !this.isAboveGround()) this.jumpCharacter(now);
    }

    /**
     * Moves the character left or right.
     * @param {boolean} toRight - Direction to move.
     * @param {number} time - Timestamp of movement.
     */
    moveCharacter(toRight, time) {
        toRight ? this.moveRight() : this.moveLeft();
        this.otherDirection = !toRight;
        this.lastMovementTime = time;
        this.stopSnoring();
        !this.isAboveGround() ? this.walking_sound.play() : this.stopWalkingSound();
    }

    /** Makes the character jump and plays jump sounds. */
    jumpCharacter(time) {
        this.jump();
        this.currentImage = 0;
        this.character_jump_sound.play();
        setTimeout(() => this.jump_sound.play(), 150);
        this.lastMovementTime = time;
        this.stopSnoring();
    }

    /** Stops the walking sound. */
    stopWalkingSound() {
        if (!this.walking_sound.paused) {
            this.walking_sound.pause();
            this.walking_sound.currentTime = 0;
        }
    }

    /** Stops the snoring sound if playing. */
    stopSnoring() {
        if (this.snoringSoundPlaying) {
            this.snoring_sound.pause();
            this.snoring_sound.currentTime = 0;
            this.snoringSoundPlaying = false;
        }
    }

    /** Checks and plays idle or long idle animations. */
    handleIdleState() {
        const now = Date.now();
        if (!this.world.keyboard.LEFT && !this.world.keyboard.RIGHT && !this.isAboveGround()) {
            this.playIdleAnimations(now);
        }
    }

    /**
     * Plays idle or long idle animations.
     * @param {number} currentTime - The current timestamp.
     */
    playIdleAnimations(currentTime) {
        const idleTooLong = currentTime - this.lastMovementTime >= this.idleTimeThreshold;
        const frameCounter = idleTooLong ? this.longIdleFrameCounter++ : this.idleAnimationFrameCounter++;
        const animationSpeed = idleTooLong ? this.longIdleAnimationSpeed : this.idleAnimationSpeed;
        if (idleTooLong && !this.snoringSoundPlaying) {
            this.snoring_sound.play();
            this.snoringSoundPlaying = true;
        }
        if (frameCounter % animationSpeed === 0) {
            this.playAnimation(idleTooLong ? this.IMAGES_LONG_IDLE : this.IMAGES_IDLE);
        }
    }

    /** Updates the camera position based on character position. */
    updateCamera() {
        this.world.camera_x = -this.x + 100;
    }

    /**
     * Updates the animation frame.
     * @param {number} delta - Time elapsed since last update.
     */
    updateAnimationFrame(delta) {
        this.lastFrameTimeAcc += delta;
        const requiredTime = Math.max(200 / (1 + Math.abs(this.speed) / this.speed), 100);
        if (this.lastFrameTimeAcc >= requiredTime) {
            this.decideCurrentAnimation();
            this.lastFrameTimeAcc = 0;
        }
    }

    /** Decides which animation to play based on current state. */
    decideCurrentAnimation() {
        if (this.isDead()) return this.gameOver();
        if (this.shouldTakeDamage()) return this.takeDamage(20);
        if (this.isAnimatingHurt) return this.playAnimation(this.IMAGES_HURT);
        if (this.shouldJump()) return this.playAnimation(this.IMAGES_JUMPING);
        if (this.shouldWalk()) return this.playAnimation(this.IMAGES_WALKING);
    }

    /** @returns {boolean} Whether the character should take damage. */
    shouldTakeDamage() {
        return !this.isInvulnerable && this.isHurt();
    }

    /** @returns {boolean} Whether the character should play jumping animation. */
    shouldJump() {
        return !this.isInvulnerable && this.isAboveGround();
    }

    /** @returns {boolean} Whether the character should play walking animation. */
    shouldWalk() {
        return !this.isInvulnerable && (this.world.keyboard.LEFT || this.world.keyboard.RIGHT);
    }

    /**
     * Applies damage to the character.
     * @param {number} amount - The amount of damage to take.
     */
    takeDamage(amount) {
        if (this.isInvulnerable || this.dead || this.isAnimatingHurt) return;
        this.health = Math.max(this.health - amount, 0);
        this.statusBar?.setPercentage(this.health);
        if (this.health === 0 && !this.dead) return this.gameOver();
        this.isInvulnerable = true;
        setTimeout(() => this.isInvulnerable = false, 1000);
        this.playHurtAnimation();
        this.character_hurt_sound.play();
        this.wakeUp();
    }

    /** Plays hurt animation once and prevents overlap. */
    playHurtAnimation() {
        if (this.isAnimatingHurt) return;
        this.isAnimatingHurt = true;
        this._startAnimation(this.IMAGES_HURT, 150, () => this.isAnimatingHurt = false);
    }

    /**
     * Starts a temporary animation from a set of frames.
     * @param {string[]} frames - Array of image paths.
     * @param {number} frameDuration - Duration per frame in ms.
     * @param {Function} [onComplete] - Callback after animation finishes.
     */
    _startAnimation(frames, frameDuration, onComplete) {
        let frameIndex = 0;
        const intervalId = setInterval(() => {
            if (frameIndex < frames.length) {
                this.img = this.imageCache[frames[frameIndex++]];
            } else {
                clearInterval(intervalId);
                onComplete?.();
            }
        }, frameDuration);
    }

    /** @returns {boolean} Whether the character is dead. */
    isDead() {
        return this.health <= 0;
    }

    /** Handles character death and triggers game over sequence. */
    gameOver() {
        this.dead = true;
        this.stopAllSounds();
        this.gameover_sound.play();
        this._startAnimation(this.IMAGES_DEAD, 200, () => {
            setTimeout(() => {
                document.getElementById('gameOverScreen')?.classList.remove('hidden');
                this.world?.pauseGame?.();
            }, 500);
        });
    }

    /** Wakes the character up from idle. */
    wakeUp() {
        if (this.snoringSoundPlaying) {
            this.stopSnoring();
            this.lastMovementTime = Date.now();
            this.longIdleFrameCounter = 0;
            this.idleAnimationFrameCounter = 0;
        }
    }

    /** Stops all character-related sounds. */
    stopAllSounds() {
        [
            this.walking_sound,
            this.jump_sound,
            this.character_jump_sound,
            this.character_hurt_sound,
            this.snoring_sound,
            this.gameover_sound,
            this.bounce_sound,
            this.win_sound
        ].forEach(s => {
            if (s?.pause) {
                s.pause();
                s.currentTime = 0;
            }
        });
        this.snoringSoundPlaying = false;
    }

    /**
     * Mutes or unmutes all character sounds.
     * @param {boolean} muted - True to mute, false to unmute.
     */
    setMute(muted) {
        [
            this.walking_sound,
            this.jump_sound,
            this.character_jump_sound,
            this.character_hurt_sound,
            this.snoring_sound,
            this.gameover_sound,
            this.bounce_sound,
            this.win_sound
        ].forEach(s => s.muted = muted);
    }

    /**
     * Checks whether the character is above another object.
     * @param {MovableObject} other - The object to compare.
     * @returns {boolean}
     */
    isAbove(other) {
        return this.y + this.hitboxHeight - 10 <= other.y;
    }
}