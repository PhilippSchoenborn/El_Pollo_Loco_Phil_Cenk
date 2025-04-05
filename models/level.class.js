/**
 * Represents a game level, containing enemies, clouds, and background objects.
 * This class is used to organize and manage the elements that make up a specific level in the game.
 */
class Level {
    /**
     * An array of enemies in the level.
     * @type {Array<MovableObject>}
     */
    enemies;

    /**
     * An array of clouds in the level.
     * @type {Array<Cloud>}
     */
    clouds;

    /**
     * An array of background objects in the level.
     * @type {Array<DrawableObject>}
     */
    backgroundObjects;

    /**
     * The x-coordinate position that marks the end of the level.
     * @type {number}
     * @default 3300
     */
    level_end_x = 3300;

    /**
     * Creates an instance of the Level class.
     * @param {Array<MovableObject>} enemies - An array of enemies in the level.
     * @param {Array<Cloud>} clouds - An array of cloud objects in the level.
     * @param {Array<DrawableObject>} backgroundObjects - An array of background objects in the level.
     */
    constructor(enemies, clouds, backgroundObjects){
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
    }
}
