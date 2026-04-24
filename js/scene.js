const simplex = new SimplexNoise();
const simplexIron = new SimplexNoise();
const chunks = new Map();

let player;
let wasd;
let cursors;
let highlight;

function preload() {
    this.load.image('grass', './sprite/blocks/grass.png');
    this.load.image('stone', './sprite/blocks/stone.png');
    this.load.image('iron', './sprite/blocks/iron.png');
    this.load.image('player', './sprite/creatures/you.png');

    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.lineStyle(2, 0x444444, 1);
    graphics.fillStyle(0x222222, 0.9);
    graphics.fillRect(0, 0, 44, 44);
    graphics.strokeRect(0, 0, 44, 44);
    graphics.generateTexture('slot', 44, 44);
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();
    wasd = this.input.keyboard.addKeys({
        up:    Phaser.Input.Keyboard.KeyCodes.W,
        down:  Phaser.Input.Keyboard.KeyCodes.S,
        left:  Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    player = this.physics.add.sprite(0, 0, 'player');
    player.setDisplaySize(TILE_SIZE * 2, TILE_SIZE * 2);
    player.setDepth(10);

    highlight = this.add.graphics();
    highlight.setDepth(9);

    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    createUI(this);
}

function update() {
    player.setVelocity(0);

    let dx = 0;
    let dy = 0;

    if (cursors.left.isDown  || wasd.left.isDown)  { player.setVelocityX(-PLAYER_SPEED); dx = -1; }
    else if (cursors.right.isDown || wasd.right.isDown) { player.setVelocityX(PLAYER_SPEED);  dx =  1; }

    if (cursors.up.isDown   || wasd.up.isDown)   { player.setVelocityY(-PLAYER_SPEED); dy = -1; }
    else if (cursors.down.isDown  || wasd.down.isDown)  { player.setVelocityY(PLAYER_SPEED);  dy =  1; }

    if (dx !== 0 || dy !== 0) {
        player.setRotation(Math.atan2(dy, dx) + Math.PI / 2);
    }

    manageChunks(this, player);
    updateHighlight(this);
}

function updateHighlight(scene) {
    const worldPoint = scene.cameras.main.getWorldPoint(scene.input.x, scene.input.y);
    const tileX = Math.floor(worldPoint.x / TILE_SIZE) * TILE_SIZE;
    const tileY = Math.floor(worldPoint.y / TILE_SIZE) * TILE_SIZE;

    highlight.clear();
    highlight.lineStyle(2, 0xffffff, 0.6);
    highlight.fillStyle(0xffffff, 0.15);
    highlight.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
    highlight.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
}

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
            const stoneNoise = simplex.noise2D(worldX, worldY);
            const isStone = stoneNoise > 0.68;

            const ironNoise = simplexIron.noise2D(worldX * 2.5, worldY * 2.5);
            const ironThreshold = isStone ? 0.45 : 0.72;

            container.add(scene.add.image(tx, ty, 'grass').setDisplaySize(TILE_SIZE, TILE_SIZE));

            if (isStone) {
                container.add(scene.add.image(tx, ty, 'stone').setDisplaySize(TILE_SIZE, TILE_SIZE));
            }

            if (ironNoise > ironThreshold) {
                container.add(scene.add.image(tx, ty, 'iron').setDisplaySize(TILE_SIZE, TILE_SIZE));
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