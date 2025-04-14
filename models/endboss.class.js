/**
 * The Endboss enemy with states, animations, attacks, and a health bar.
 */
class Endboss extends MovableObject {
  height = 250;
  width = 200;
  y = 195;
  speed = 2.8;
  canTakeDamage = false;
  hitPoints = 3;
  currentState = 'waiting';

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
   * Creates an instance of the Endboss at a given horizontal position.
   * Initializes hitbox values, loads all images, sets up sounds, and starts animation via setInterval.
   * @param {number} x - The horizontal starting position of the Endboss.
   */
  constructor(x) {
    super();
    this.x = x;
    this.hitboxOffsetX = 30;
    this.hitboxOffsetY = 40;
    this.hitboxWidth = 140;
    this.hitboxHeight = 170;
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
    this.statusBar = new StatusBarEndboss();
    this.statusBar.setPercentage(100);
    this.initBehaviorLoop();
  }


  /**
   * Processes a single frame of the behavior loop.
   * Updates time accumulators and plays animations when their intervals are reached.
   * @param {Object} lastTimeHolder - An object that holds the last frame's timestamp.
   * @param {number} lastTimeHolder.lastTime - The timestamp (in ms) of the last processed frame.
   * @param {Object} accumulators - An object holding accumulators for each animation type.
   * @param {number} accumulators.walk - Accumulator for walk-related animations.
   * @param {number} accumulators.alert - Accumulator for alert-related animations.
   * @param {Object} intervals - An object specifying the time intervals for animations.
   * @param {number} intervals.walk - The time interval (in ms) for walk animations.
   * @param {number} intervals.alert - The time interval (in ms) for alert animations.
   */
  processBehaviorFrame(lastTimeHolder, accumulators, intervals) {
    if (this.currentState === 'dead') {
      clearInterval(this.behaviorInterval);
      return;
    }
    const now = Date.now();
    const delta = now - lastTimeHolder.lastTime;
    lastTimeHolder.lastTime = now;
    if (this.currentState === 'chase') this.chasePlayer();
    accumulators.walk = this.updateAnimation('entrance', accumulators.walk, intervals.walk, this.walkImages, delta);
    accumulators.alert = this.updateAnimation('alert', accumulators.alert, intervals.alert, this.alertImages, delta);
    accumulators.walk = this.updateAnimation('chase', accumulators.walk, intervals.walk, this.walkImages, delta);
  }

  /**
   * Initializes and starts the behavior loop.
   * Sets up time holders, accumulators, and animation intervals, then processes frames at ~60 FPS.
   */
  initBehaviorLoop() {
    const lastTimeHolder = { lastTime: Date.now() };
    const accumulators = { walk: 0, alert: 0 };
    const intervals = { walk: 200, alert: 150 };
    this.behaviorInterval = setInterval(() => {
      this.processBehaviorFrame(lastTimeHolder, accumulators, intervals);
    }, 1000 / 60);
  }

  /**
   * Updates the animation accumulator and triggers the animation if the specified interval is exceeded.
   * @param {string} state - The state for which the animation should be processed.
   * @param {number} acc - The current accumulator value for the animation.
   * @param {number} interval - The interval (in ms) after which the animation should play.
   * @param {Array} images - An array of images for the animation.
   * @param {number} delta - The time (in ms) since the last update.
   * @returns {number} - The updated accumulator value, reset to zero if the animation was played.
   */
  updateAnimation(state, acc, interval, images, delta) {
    acc += delta;
    if (this.currentState === state && acc >= interval) {
      this.playAnimation(images);
      return 0;
    }
    return acc;
  }

  /**
   * Moves the Endboss towards the player if within range.
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
   * Begins the entrance phase by walking to a target X position via setInterval.
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
   * Initiates the alert phase of the boss encounter.
   * Plays a rooster sound and starts the alert timing loop.
   */
  doAlertPhase() {
    this.currentState = 'alert';
    this.playRoosterCry();
    this.startAlertLoop();
  }

  /**
   * Resets and plays the rooster cry audio.
   */
  playRoosterCry() {
    this.roosterCry.currentTime = 0;
    this.roosterCry.play();
  }

  /**
   * Starts the loop that handles transitions between alert phases.
   * Phase 1 lasts 2000ms, then plays another cry.
   * Phase 2 lasts 800ms, then initiates the chase phase.
   */
  startAlertLoop() {
    let phaseStartTime = performance.now();
    let phase = 1;
    const alertLoop = (now) => {
      const elapsed = now - phaseStartTime;
      if (this.shouldTransitionToPhase2(phase, elapsed)) {
        this.playRoosterCry();
        phase = 2;
        phaseStartTime = now;
      } else if (this.shouldTransitionToChase(phase, elapsed)) {
        this.startChasePhase();
        return;
      }
      requestAnimationFrame(alertLoop);
    };
    requestAnimationFrame(alertLoop);
  }

  /**
   * Determines whether the logic should transition from phase 1 to phase 2.
   * @param {number} phase - The current phase number.
   * @param {number} elapsed - Time elapsed since the current phase began, in milliseconds.
   * @returns {boolean} True if transition to phase 2 should occur.
   */
  shouldTransitionToPhase2(phase, elapsed) {
    return phase === 1 && elapsed >= 2000;
  }

  /**
   * Determines whether the logic should transition from phase 2 to the chase phase.
   * @param {number} phase - The current phase number.
   * @param {number} elapsed - Time elapsed since the current phase began, in milliseconds.
   * @returns {boolean} True if transition to chase phase should occur.
   */
  shouldTransitionToChase(phase, elapsed) {
    return phase === 2 && elapsed >= 800;
  }

  /**
   * Begins the chase phase of the boss fight.
   * Enables damage, fills the status bar, plays boss music, and unfreezes the player.
   */
  startChasePhase() {
    this.currentState = 'chase';
    this.canTakeDamage = true;
    this.statusBar.setPercentage(100);
    world.startBossMusic();
    world.unfreezePlayer();
  }

  /**
   * Triggers an attack if not already in a conflicting state.
   */
  doAttack() {
    if (this.isInInvalidState()) return;
    this.startAttack();
  }

  /**
   * Checks if the Endboss is in a state where actions like attacking are not allowed.
   * @returns {boolean} True if in 'attack', 'dead', or 'hurt' state.
   */
  isInInvalidState() {
    return ['attack', 'dead', 'hurt'].includes(this.currentState);
  }

  /**
   * Starts the attack animation sequence (using setInterval).
   */
  startAttack() {
    this.currentState = 'attack';
    let frameIndex = 0;
    const frameDelay = 150;
    const attackAnim = setInterval(() => {
      this.img = this.imageCache[this.attackImages[frameIndex]];
      frameIndex++;
      if (frameIndex >= this.attackImages.length) {
        clearInterval(attackAnim);
        if (this.currentState !== 'dead') {
          this.currentState = 'chase';
        }
      }
    }, frameDelay);
  }

  /**
   * Handles damage when the Endboss is hit.
   * Reduces hit points and triggers hurt or death animation.
   */
  hit() {
    if (!this.canTakeDamage || this.currentState === 'dead') return;
    this.hitPoints--;
    this.hit_sound.play();
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

  /**
   * Plays the hurt animation sequence (setInterval).
   * @param {Function} onComplete - Callback function to execute after animation finishes.
   */
  playHurtAnimation(onComplete) {
    let frameIndex = 0;
    const frameDelay = 100;
    const hurtAnim = setInterval(() => {
      if (frameIndex < this.hurtImages.length) {
        this.img = this.imageCache[this.hurtImages[frameIndex]];
      } else {
        clearInterval(hurtAnim);
        onComplete?.();
      }
      frameIndex++;
    }, frameDelay);
  }

  /**
   * Triggers the death sequence: stops movement, plays sound, and animates death.
   */
  die() {
    this.currentState = 'dead';
    this.speed = 0;
    this.playDeathSound();
    this.startDeathAnimation();
  }

  /**
   * Plays the Endboss's death sound.
   */
  playDeathSound() {
    this.death_sound.play();
  }

  /**
   * Starts the death animation sequence frame by frame (setInterval).
   */
  startDeathAnimation() {
    let frameIndex = 0;
    const frameDelay = 350;
    const deathAnim = setInterval(() => {
      this.img = this.imageCache[this.deadImages[frameIndex]];
      frameIndex++;
      if (frameIndex >= this.deadImages.length) {
        clearInterval(deathAnim);
        setTimeout(() => {
          this.removeFromGame();
          win();
        }, 500);
      }
    }, frameDelay);
  }

  /**
   * Removes the Endboss from the list of enemies in the game world.
   */
  removeFromGame() {
    world.level.enemies = world.level.enemies.filter(e => e !== this);
  }

  /**
   * Mutes or unmutes all Endboss sounds.
   * @param {boolean} muted
   */
  setMute(muted) {
    this.hit_sound.muted = muted;
    this.death_sound.muted = muted;
    this.roosterCry.muted = muted;
  }
}
