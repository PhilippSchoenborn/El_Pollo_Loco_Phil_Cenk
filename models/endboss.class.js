class Endboss extends MovableObject {
    height = 180;
    width = 165;
    y = 260;
    initialX = 2800;
    x = this.initialX;
    speed = 1;
    walkRadius = 100;
    direction = 'left';
    otherDirection = false;
    isInvulnerable = false;
    hitPoints = 3;

    currentState = 'walk';

    hit_sound = new Audio('audio/endboss_hit.mp3');
    death_sound = new Audio('audio/chicken_dead.mp3');

    IMAGES_WALKING = [
        './img/4_enemie_boss_chicken/1_walk/G1.png',
        './img/4_enemie_boss_chicken/1_walk/G2.png',
        './img/4_enemie_boss_chicken/1_walk/G3.png',
        './img/4_enemie_boss_chicken/1_walk/G4.png',
    ];

    IMAGES_HURT = [
        './img/4_enemie_boss_chicken/4_hurt/G21.png',
        './img/4_enemie_boss_chicken/4_hurt/G22.png',
        './img/4_enemie_boss_chicken/4_hurt/G23.png',
    ];

    IMAGES_DEAD = [
        './img/4_enemie_boss_chicken/5_dead/G24.png',
        './img/4_enemie_boss_chicken/5_dead/G25.png',
        './img/4_enemie_boss_chicken/5_dead/G26.png',
    ];

    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.x = this.initialX;
        this.hit_sound.volume = 0.5;
        this.death_sound.volume = 0.5;
        this.animate();
    }

    /**
     * Main loop controlling movement/animation.
     * We only move/play walking frames if the boss is in 'walk' state.
     */
    animate() {
        let lastFrameTime = 0;
        const frameInterval = 200;

        const update = (timestamp) => {
            if (this.currentState === 'walk') {
                this.moveBoss();

                if (timestamp - lastFrameTime >= frameInterval) {
                    this.playAnimation(this.IMAGES_WALKING);
                    lastFrameTime = timestamp;
                }
            }
            if (this.currentState !== 'dead') {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }

    /**
     * Simple side-to-side walk logic.
     * Called only if currentState is 'walk'.
     */
    moveBoss() {
        if (this.direction === 'left') {
            this.x -= this.speed;
            if (this.x <= this.initialX - this.walkRadius) {
                this.direction = 'right';
                this.otherDirection = true;
            }
        } else {
            this.x += this.speed;
            if (this.x >= this.initialX) {
                this.direction = 'left';
                this.otherDirection = false;
            }
        }
    }

    /**
     * Called when boss is hit by a bottle or other attack.
     * Slows, plays 'hurt' frames, and becomes invulnerable briefly.
     */
    hit() {
        if (this.currentState === 'hurt' || this.currentState === 'dead') return;
        this.currentState = 'hurt';
        this.isInvulnerable = true;
        this.hit_sound.play();

        let frameIndex = 0;
        const frameDelay = 100;

        const hurtAnim = setInterval(() => {
            this.img = this.imageCache[this.IMAGES_HURT[frameIndex]];
            frameIndex++;

            if (frameIndex >= this.IMAGES_HURT.length) {
                clearInterval(hurtAnim);
                setTimeout(() => {
                    if (this.currentState !== 'dead') {
                        this.currentState = 'walk';
                        this.isInvulnerable = false;
                    }
                }, 100);
            }
        }, frameDelay);
    }

    /**
     * Called when boss runs out of HP.
     * Plays 'dead' frames, ends movement, and eventually removes itself.
     */
    die() {
        this.currentState = 'dead';
        this.speed = 0;
        this.death_sound.play();

        let frameIndex = 0;
        const frameDelay = 350;

        const deathAnim = setInterval(() => {
            this.img = this.imageCache[this.IMAGES_DEAD[frameIndex]];
            frameIndex++;

            if (frameIndex >= this.IMAGES_DEAD.length) {
                clearInterval(deathAnim);

                setTimeout(() => {
                    world.level.enemies = world.level.enemies.filter(e => e !== this);

                    // ✅ Now show the win screen!
                    //    (This calls the global function you defined in game.class.js)
                    win();

                }, 500);
            }
        }, frameDelay);
    }


    win() {
        let frameIndex = 0;
        const frameDuration = 200;

        // Example if you have a win animation array:
        // (If you just want to show a static image, you can skip this loop)
        const animationInterval = setInterval(() => {
            this.img = this.imageCache[this.IMAGES_WIN[frameIndex]];
            frameIndex++;

            // Once we've shown all frames
            if (frameIndex >= this.IMAGES_WIN.length) {
                clearInterval(animationInterval);

                // Small delay before showing the Win Screen
                setTimeout(() => {
                    document.getElementById("winScreen").classList.remove("hidden");
                    document.getElementById("winAgainButton").classList.remove("hidden");

                    // Pause the game if that logic exists
                    if (this.world && typeof this.world.pauseGame === "function") {
                        this.world.pauseGame();
                    }
                }, 500);
            }
        }, frameDuration);
    }
}
