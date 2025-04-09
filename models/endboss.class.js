/**
 * Represents the Endboss, a powerful enemy character in the game.
 * Extends MovableObject and manages states, animations, attacks,
 * and interactions with the player.
 */
class Endboss extends MovableObject {
    height = 250;
    width = 200;
    y = 195;
    speed = 1.5;

    canTakeDamage = false;
    hitPoints = 3;
    currentState = 'waiting';  // 'waiting', 'entrance', 'alert', 'chase', 'attack', 'hurt', 'dead'

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

    hit_sound = new Audio('audio/endboss_hit.mp3');
    death_sound = new Audio('audio/chicken_dead.mp3');
    roosterCry = new Audio('audio/roosterCry.mp3');

    /**
     * Each Endboss will have its own StatusBarEndboss instance,
     * which we conditionally draw in World.drawStatus().
     */
    constructor(x) {
        super();
        this.x = x;

        // Load the images
        this.loadImages(this.walkImages);
        this.loadImages(this.alertImages);
        this.loadImages(this.attackImages);
        this.loadImages(this.hurtImages);
        this.loadImages(this.deadImages);
        this.loadImage(this.walkImages[0]);  // default image

        // Audio volumes
        this.hit_sound.volume = 0.5;
        this.death_sound.volume = 0.5;
        this.roosterCry.volume = 0.8;

        // Boss faces left or right by flipping this.otherDirection
        this.otherDirection = false;

        // Create the boss status bar (purely for canvas drawing)
        this.statusBar = new StatusBarEndboss();
        this.statusBar.setPercentage(100);  // start full

        // Kick off animations
        this.animate();
    }

    animate() {
        let lastFrameTime = 0;
        const frameInterval = 200;

        const update = (timestamp) => {
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
                // The actual attack frames come from the setInterval in startAttack()
            }

            // Keep updating frames unless the boss is dead
            if (this.currentState !== 'dead') {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    }

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

    doAlertPhase() {
        this.currentState = 'alert';
        this.roosterCry.currentTime = 0;
        this.roosterCry.play();

        setTimeout(() => {
            this.roosterCry.currentTime = 0;
            this.roosterCry.play();
            setTimeout(() => {
                // Boss can now chase the player and be damaged
                this.currentState = 'chase';
                this.canTakeDamage = true;
                this.statusBar.setPercentage(100); // reset to full if you want
                world.startBossMusic();
                world.unfreezePlayer();
            }, 800);
        }, 2000);
    }

    doAttack() {
        if (this.isInInvalidState()) return;
        this.startAttack();
    }

    isInInvalidState() {
        return ['attack', 'dead', 'hurt'].includes(this.currentState);
    }

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

    updateAttackFrame(frameIndex) {
        this.img = this.imageCache[this.attackImages[frameIndex]];
    }

    finishAttackAnimation(attackAnim) {
        clearInterval(attackAnim);
        if (this.currentState !== 'dead') {
            this.currentState = 'chase';
        }
    }

    hit() {
        // Only allow damage if we canTakeDamage and we're alive
        if (!this.canTakeDamage || this.currentState === 'dead') return;

        this.hitPoints--;
        this.hit_sound.play();

        // Update health bar
        const pct = (this.hitPoints / 3) * 100;
        this.statusBar.setPercentage(pct);

        if (this.hitPoints <= 0) {
            this.die();
        } else {
            this.currentState = 'hurt';
            this.playHurtAnimation(() => {
                this.currentState = 'chase';
            });
        }
    }

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

    die() {
        this.currentState = 'dead';
        this.speed = 0;
        this.playDeathSound();
        this.startDeathAnimation();
    }

    playDeathSound() {
        this.death_sound.play();
    }

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

    updateDeathFrame(frameIndex) {
        this.img = this.imageCache[this.deadImages[frameIndex]];
    }

    finishDeathAnimation(deathAnim) {
        clearInterval(deathAnim);
        setTimeout(() => {
            this.removeFromGame();
            win(); // Or whatever your "win" flow is
        }, 500);
    }

    removeFromGame() {
        world.level.enemies = world.level.enemies.filter(e => e !== this);
    }

    setMute(muted) {
        this.hit_sound.muted = muted;
        this.death_sound.muted = muted;
        this.roosterCry.muted = muted;
    }
}
