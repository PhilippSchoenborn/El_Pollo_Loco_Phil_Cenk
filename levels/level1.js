/**
 * Defines Level 1 with its enemies, clouds, and background objects.
 * 
 * @type {Level}
 */
const level1 = new Level(
    /**
     * Array of enemy objects including Chickens and Chicks.
     * Chickens and Chicks have different positions on the X-axis.
     * @type {(Chicken|Chick)[]}
     */
    [
        new Chicken(400),
        new Chicken(900),
        new Chicken(1200),
        new Chicken(1800),
        new Chicken(2500),
        new Chicken(3000),
        new Chick(400),
        new Chick(600),
        new Chick(1300),
        new Chick(2000),
    ],

    /**
     * Array of Cloud objects for atmospheric background.
     * Clouds are positioned further into the level.
     * @type {Cloud[]}
     */
    [
        new Cloud(2800),
    ],

    /**
     * Array of layered background objects to create a parallax effect.
     * The backgrounds loop every 719 pixels to give the illusion of depth and motion.
     * @type {BackgroundObject[]}
     */
    [
        new BackgroundObject('./img/5_background/layers/air.png', -719),
        new BackgroundObject('./img/5_background/layers/3_third_layer/2.png', -719),
        new BackgroundObject('./img/5_background/layers/2_second_layer/2.png', -719),
        new BackgroundObject('./img/5_background/layers/1_first_layer/2.png', -719),

        new BackgroundObject('./img/5_background/layers/air.png', 0),
        new BackgroundObject('./img/5_background/layers/3_third_layer/1.png', 0),
        new BackgroundObject('./img/5_background/layers/2_second_layer/1.png', 0),
        new BackgroundObject('./img/5_background/layers/1_first_layer/1.png', 0),

        new BackgroundObject('./img/5_background/layers/air.png', 719),
        new BackgroundObject('./img/5_background/layers/3_third_layer/2.png', 719),
        new BackgroundObject('./img/5_background/layers/2_second_layer/2.png', 719),
        new BackgroundObject('./img/5_background/layers/1_first_layer/2.png', 719),

        new BackgroundObject('./img/5_background/layers/air.png', 719 * 2),
        new BackgroundObject('./img/5_background/layers/3_third_layer/1.png', 719 * 2),
        new BackgroundObject('./img/5_background/layers/2_second_layer/1.png', 719 * 2),
        new BackgroundObject('./img/5_background/layers/1_first_layer/1.png', 719 * 2),

        new BackgroundObject('./img/5_background/layers/air.png', 719 * 3),
        new BackgroundObject('./img/5_background/layers/3_third_layer/2.png', 719 * 3),
        new BackgroundObject('./img/5_background/layers/2_second_layer/2.png', 719 * 3),
        new BackgroundObject('./img/5_background/layers/1_first_layer/2.png', 719 * 3),

        new BackgroundObject('./img/5_background/layers/air.png', 719 * 4),
        new BackgroundObject('./img/5_background/layers/3_third_layer/1.png', 719 * 4),
        new BackgroundObject('./img/5_background/layers/2_second_layer/1.png', 719 * 4),
        new BackgroundObject('./img/5_background/layers/1_first_layer/1.png', 719 * 4),

        new BackgroundObject('./img/5_background/layers/air.png', 719 * 5),
        new BackgroundObject('./img/5_background/layers/3_third_layer/2.png', 719 * 5),
        new BackgroundObject('./img/5_background/layers/2_second_layer/2.png', 719 * 5),
        new BackgroundObject('./img/5_background/layers/1_first_layer/2.png', 719 * 5),
    ]
);
