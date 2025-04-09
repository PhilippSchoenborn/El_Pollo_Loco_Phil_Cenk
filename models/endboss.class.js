/**
 * Represents the Endboss, a powerful enemy character in the game.
 * Extends MovableObject and manages states, animations, attacks, and interactions with the player.
 */
class Endboss extends MovableObject {
    height = 250;
    width = 200;
    y = 195;
    speed = 1.5;
    canTakeDamage = false;
    hitPoints = 3;
    currentState = 'waiting';
    
    // Images for different animations
    walkImages = [
        './img/4_enemie_boss_chicken/1_walk/G1.png',
        './img/4_enemie_boss_chicken/1_walk/G2.png',
        './img/4_enemie_boss_chicken/1_walk/G3.png',
        './img/4_enemie_boss_chicken/1_walk/G4.png'
    ];
    alertImages = [
        './img/4_enemie_boss_chicken/2_alert/G5.png',
        './img/4_enemie_boss_chicken/2_alert/G6.png',
        './img/4_enemie_boss_chicken/2_alert/G7.png',
        './img/4_enemie_boss_chicken/2_alert/G8.png',
        './img/4_enemie_boss_chicken/2_alert/G9.png',
        './img/4_enemie_boss_chicken/2_alert/G10.png',
        './img/4_enemie_boss_chicken/2_alert/G11.png',
        './img/4_enemie_boss_chicken/2_alert/G12.png'
    ];
    attackImages = [
        './img/4_enemie_boss_chicken/3_attack/G13.png',
        './img/4_enemie_boss_chicken/3_attack/G14.png',
        './img/4_enemie_boss_chicken/3_attack/G15.png',
        './img/4_enemie_boss_chicken/3_attack/G16.png',
        './img/4_enemie_boss_chicken/3_attack/G17.png',
        './img/4_enemie_boss_chicken/3_attack/G18.png',
        './img/4_enemie_boss_chicken/3_attack/G19.png',
        './img/4_enemie_boss_chicken/3_attack/G20.png'
    ];
    hurtImages = [
        './img/4_enemie_boss_chicken/4_hurt/G21.png',
        './img/4_enemie_boss_chicken/4_hurt/G22.png',
        './img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];
    deadImages = [
        './img/4_enemie_boss_chicken/5_dead/G24.png',
        './img/4_enemie_boss_chicken/5_dead/G25.png',
        './img/4_enemie_boss_chicken/5_dead/G26.png'
    ];
    
    // Sound effects
    hit_sound = new Audio('audio/endboss_hit.mp3');
    death_sound = new Audio('audio/chicken_dead.mp3');
    roosterCry = new Audio('audio/roosterCry.mp3');

    /**
     * Creates a new instance of the Endboss.
     * @param {number} x - The initial horizontal position of the Endboss.
     */
    constructor(x) {
        super();
        this.x = x;
        this.loadImages(this.walkImages);
        this.loadImages(this.alertImages);
        this.loadImages(this.attackImages);
        this.loadImages(this.hurtImages);
        this.loadImages(this.deadImages);
        this.loadImage(this.walkImages[0]);
        this.hit_sound.volume = 0.5;
        this.death_sound.volume = 0.5;
        this.roosterCry.volume = 0.8;
        this.otherDirection = false;
        this.animate();
    }

    /**
     * Starts the animation loop for the Endboss.
     * The animation is updated based on the current state of the Endboss (entrance, alert, chase, attack).
     */
    animate() {
        let lastFrameTime = 0;
        const frameInterval = 200;
        const update = timestamp => {
            if (this.currentState === 'entrance') {
                if (timestamp - lastFrameTime >= frameInterval) {
                    this.playAnimation(this.walkImages);
                    lastFrameTime = timestamp;
                }
            } else if (this.currentState === 'alert') {
                if (timestamp - lastFrameTime >= 150) {
                    this.playAnimation(this.alertImages);
                    lastFrameTime = timestamp;
                }
            } else if (this.currentState === 'chase') {
                this.chasePlayer();
                if (timestamp - lastFrameTime >= frameInterval) {
                    this.playAnimation(this.walkImages);
                    lastFrameTime = timestamp;
                }
            } else if (this.currentState === 'attack') {
            }
            if (this.currentState !== 'dead') {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    }

    /**
     * Makes the Endboss chase the player.
     * The Endboss will move towards the player's position.
     */
    chasePlayer() {
        if (!world || !world.character) return;
        const playerX = world.character.x;
        if (Math.abs(this.x - playerX) > 10) {
            if (this.x < playerX) {
                this.x += this.speed;
                this.otherDirection = true;
            } else {
                this.x -= this.speed;
                this.otherDirection = false;
            }
        }
    }

    /**
     * Starts the Endboss's attack phase if it's in a valid state.
     */
    doAttack() {
        if (this.isInInvalidState()) return;
        this.startAttack();
    }

    /**
     * Checks if the Endboss is in an invalid state to perform an attack.
     * @returns {boolean} - Returns true if the Endboss is in 'attack', 'dead', or 'hurt' state.
     */
    isInInvalidState() {
        return ['attack', 'dead', 'hurt'].includes(this.currentState);
    }

    /**
     * Starts the Endboss's attack animation.
     */
    startAttack() {
        this.currentState = 'attack';
        let frameIndex = 0;
        const frameDelay = 150;
        const attackAnim = setInterval(() => {
            this.updateAttackFrame(frameIndex);
            frameIndex++;
            if (frameIndex >= this.attackImages.length) {
                this.finishAttackAnimation(attackAnim);
            }
        }, frameDelay);
    }

    /**
     * Updates the attack animation frame.
     * @param {number} frameIndex - The index of the frame to display in the attack animation.
     */
    updateAttackFrame(frameIndex) {
        this.img = this.imageCache[this.attackImages[frameIndex]];
    }

    /**
     * Finishes the attack animation and returns to chase state.
     * @param {number} attackAnim - The interval ID for the attack animation.
     */
    finishAttackAnimation(attackAnim) {
        clearInterval(attackAnim);
        if (this.currentState !== 'dead') {
            this.currentState = 'chase';
        }
    }

    /**
     * Handles the Endboss being hit.
     * Decreases hit points and plays hurt animation if hit points remain.
     * If hit points reach zero, the Endboss dies.
     */
    hit() {
        if (!this.canTakeDamage) return;
        if (this.currentState === 'dead' || this.currentState === 'hurt') return;
        this.hitPoints--;
        this.hit_sound.play();
        if (this.hitPoints <= 0) {
            this.die();
        } else {
            this.currentState = 'hurt';
            this.playHurtAnimation(() => {
                this.currentState = 'chase';
            });
        }
    }

    /**
     * Plays the hurt animation when the Endboss is damaged.
     * @param {Function} onComplete - A callback function to run once the hurt animation is complete.
     */
    playHurtAnimation(onComplete) {
        let frameIndex = 0;
        const frameDelay = 100;
        const hurtAnim = setInterval(() => {
            if (frameIndex < this.hurtImages.length) {
                this.img = this.imageCache[this.hurtImages[frameIndex]];
            } else {
                clearInterval(hurtAnim);
                onComplete();
            }
            frameIndex++;
        }, frameDelay);
    }

    /**
     * Handles the death of the Endboss.
     * Stops movement, plays death sound, and starts death animation.
     */
    die() {
        this.currentState = 'dead';
        this.speed = 0;
        this.playDeathSound();
        this.startDeathAnimation();
    }

    /**
     * Plays the death sound of the Endboss.
     */
    playDeathSound() {
        this.death_sound.play();
    }

    /**
     * Starts the death animation of the Endboss.
     */
    startDeathAnimation() {
        let frameIndex = 0;
        const frameDelay = 350;
        const deathAnim = setInterval(() => {
            this.updateDeathFrame(frameIndex);
            frameIndex++;
            if (frameIndex >= this.deadImages.length) {
                this.finishDeathAnimation(deathAnim);
            }
        }, frameDelay);
    }

    /**
     * Updates the death animation frame.
     * @param {number} frameIndex - The index of the current death animation frame.
     */
    updateDeathFrame(frameIndex) {
        this.img = this.imageCache[this.deadImages[frameIndex]];
    }

    /**
     * Finishes the death animation and removes the Endboss from the game.
     * Calls the win function after removal.
     * @param {number} deathAnim - The interval ID for the death animation.
     */
    finishDeathAnimation(deathAnim) {
        clearInterval(deathAnim);
        setTimeout(() => {
            this.removeFromGame();
            win();
        }, 500);
    }

    /**
     * Removes the Endboss from the game and the world.
     */
    removeFromGame() {
        world.level.enemies = world.level.enemies.filter(e => e !== this);
    }

    /**
     * Starts the Endboss's entrance phase, where it moves towards the target position.
     */
    doEntrance() {
        this.currentState = 'entrance';
        const targetX = 3300;
        const entranceInterval = setInterval(() => {
            if (this.x > targetX) {
                this.x -= this.speed;
            } else {
                clearInterval(entranceInterval);
                this.doAlertPhase();
            }
        }, 1000 / 60);
    }

    /**
     * Starts the Endboss's alert phase, where it makes a noise and prepares to chase the player.
     */
    doAlertPhase() {
        this.currentState = 'alert';
        this.roosterCry.currentTime = 0;
        this.roosterCry.play();
        setTimeout(() => {
            this.roosterCry.currentTime = 0;
            this.roosterCry.play();
            setTimeout(() => {
                this.currentState = 'chase';
                world.startBossMusic();
                world.unfreezePlayer();
                this.canTakeDamage = true;
            }, 800);
        }, 2000);
    }

    setMute(muted) {
        this.hit_sound.muted = muted;
        this.death_sound.muted = muted;
        this.roosterCry.muted = muted;
    }   
}