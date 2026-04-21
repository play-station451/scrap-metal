const simplex = new SimplexNoise();
const chunks = new Map();

function createChunk(scene, cx, cy) {
    const container = scene.add.container(0, 0);
    const startX = cx * CHUNK_SIZE * TILE_SIZE;
    const startY = cy * CHUNK_SIZE * TILE_SIZE;

    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 0; y < CHUNK_SIZE; y++) {
            const tx = startX + (x * TILE_SIZE) + 16;
            const ty = startY + (y * TILE_SIZE) + 16;

            const worldX = (cx * CHUNK_SIZE + x) * 0.08;
            const worldY = (cy * CHUNK_SIZE + y) * 0.08;
            const noise = simplex.noise2D(worldX, worldY);

            container.add(scene.add.image(tx, ty, 'grass').setDisplaySize(TILE_SIZE, TILE_SIZE));

            if (noise > 0.68) {
                container.add(scene.add.image(tx, ty, 'stone').setDisplaySize(TILE_SIZE, TILE_SIZE));
            }
        }
    }
    return container;
}

function manageChunks(scene, player) {
    const snappedX = Math.floor(player.x / (CHUNK_SIZE * TILE_SIZE));
    const snappedY = Math.floor(player.y / (CHUNK_SIZE * TILE_SIZE));

    for (let x = snappedX - RENDER_DISTANCE; x <= snappedX + RENDER_DISTANCE; x++) {
        for (let y = snappedY - RENDER_DISTANCE; y <= snappedY + RENDER_DISTANCE; y++) {
            const key = `${x},${y}`;
            if (!chunks.has(key)) {
                chunks.set(key, createChunk(scene, x, y));
            }
        }
    }

    for (const [key, container] of chunks) {
        const [cx, cy] = key.split(',').map(Number);
        if (
            Math.abs(cx - snappedX) > RENDER_DISTANCE + 1 ||
            Math.abs(cy - snappedY) > RENDER_DISTANCE + 1
        ) {
            container.destroy();
            chunks.delete(key);
        }
    }
}