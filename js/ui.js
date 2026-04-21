function createUI(scene) {
    const startX = window.innerWidth / 2 - (10 * 46) / 2;
    const y = window.innerHeight - 60;

    for (let i = 0; i < 10; i++) {
        scene.add.image(startX + (i * 46), y, 'slot')
            .setScrollFactor(0)
            .setDepth(100);
    }
}