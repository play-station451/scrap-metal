let player;
let wasd;
let cursors;
let highlight;

function preload() {
    this.load.image('grass', './sprite/blocks/grass.png');
    this.load.image('stone', './sprite/blocks/stone.png');
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