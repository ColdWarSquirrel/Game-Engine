"use strict";
gameScreen.resize(viewport.width - 10, viewport.height - 10);
// @ts-ignore
const game = new Game("Jumpy Jump Autistic", { refreshType: 0, fps: 60 });
// @ts-ignore
const player = game.addSprite(new Sprite({
    info: {
        name: "player",
        type: "image",
        skins: [
            {
                name: "idleRight",
                url: "sprites/right/idle1.png"
            },
            {
                name: "idleLeft",
                url: "sprites/left/idle1.png"
            }
        ],
        opacity: 1,
        speed: {
            x: 200,
            y: 250
        }
    },
    location: {
        x: (gameScreen.width * 0.5),
        y: (gameScreen.height * 0.5)
    },
    scale: {
        width: "default",
        height: "default"
    }
}, [
    {
        name: "movementData",
        value: false,
        direction: "none",
        lastPos: 0,
        up: false,
        down: false,
        left: false,
        right: false,
        isJumping: false,
        jumps: 0,
        isFalling: false,
        fallSpeed: 500
    },
    {
        name: "skins",
        idleLeft: null,
        idleRight: null
    }
]));
let playerMovementData = player.getProperty("movementData");
class Floor extends Sprite {
    constructor(options) {
        var _a, _b;
        let colour = {
            fill: "darkgreen",
            stroke: "lime"
        };
        let name = (_b = (_a = options === null || options === void 0 ? void 0 : options.info) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "floor";
        options.info = {
            name: name,
            type: "box",
            tags: ["terrain"],
            colour: colour
        };
        super(options);
    }
}
class Coin extends Sprite {
    constructor(options) {
        var _a, _b;
        let name = (_b = (_a = options === null || options === void 0 ? void 0 : options.info) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "floor";
        options.info = {
            name: name,
            type: "image",
            tags: ["collectible"],
            skins: [
                {
                    name: "coin",
                    url: "sprites/coin.png"
                }
            ],
        };
        options.location.z = -1;
        options.scale = {
            width: 50,
            height: 50
        };
        super(options);
    }
}
let collectedCoins = 0;
const textTest = new Sprite({
    info: {
        name: "text",
        type: "text",
        text: {
            content: "welcome :]",
            font: "Arial",
            size: 30
        },
        colour: {
            fill: "red",
            stroke: "blue"
        }
    },
    location: {
        x: (gameScreen.width * 0.5) - 30,
        y: (gameScreen.height * 0.8),
        z: -1
    },
    scale: {
        width: 50,
        height: 25
    }
});
const collectedCoinsText = new Sprite({
    info: {
        name: "text",
        type: "text",
        text: {
            content: "0",
            font: "Arial",
            size: 30
        },
        colour: {
            fill: "red",
            stroke: "blue"
        }
    },
    location: {
        x: gameScreen.width * 0.05 < 30 ? 30 : gameScreen.width * 0.05,
        y: gameScreen.height * 0.05 < 60 ? 60 : gameScreen.height * 0.05,
        z: 2,
        static: true
    },
    scale: {
        width: 50,
        height: 25
    }
});
game.addSprites(textTest, collectedCoinsText);
let coins = game.addSprites(new Coin({
    location: {
        x: gameScreen.width - 100,
        y: (gameScreen.height - 30) - 60
    }
}), new Coin({
    location: {
        x: gameScreen.width - 150,
        y: (gameScreen.height - 30) - 60
    }
}), new Coin({
    location: {
        x: gameScreen.width - 200,
        y: (gameScreen.height - 30) - 60
    }
}));
let roomWidth = 1;
let roofPos = -191;
let terrain = game.addSprites(new Floor({
    info: {
        name: "floor"
    },
    location: {
        x: 0,
        y: (gameScreen.height - 40),
        z: -1
    },
    scale: {
        width: gameScreen.width * roomWidth,
        height: 40
    }
}), new Floor({
    info: {
        name: "ceiling"
    },
    location: {
        x: 0,
        y: roofPos,
        z: -1
    },
    scale: {
        width: gameScreen.width * roomWidth,
        height: 40
    }
}), new Floor({
    info: {
        name: "left wall"
    },
    location: {
        x: 0,
        y: roofPos,
        z: -1
    },
    scale: {
        width: 40,
        height: gameScreen.height - roofPos
    }
}), new Floor({
    info: {
        name: "right wall"
    },
    location: {
        x: (gameScreen.width * roomWidth),
        y: roofPos,
        z: -1
    },
    scale: {
        width: 40,
        height: gameScreen.height - roofPos
    }
}), new Floor({
    info: {
        name: "platform 1"
    },
    location: {
        x: 235,
        y: (roofPos + 250),
        z: -1
    },
    scale: {
        width: 25,
        height: gameScreen.height - roofPos - 450
    }
}));
let stopAt = 0.05;
game.resortByZIndex();
document.body.style.backgroundColor = "black";
gameScreen.background = "black";
let isCollidingWithTerrain = false;
let direction = { x: 0, y: 0 };
let collisionSide = "";
let cameraDrag = 0.9;
const spawnPos = {
    x: gameScreen.width / 2,
    y: terrain[0].location.y - player.scale.height - 5
};
function respawnPlayer() {
    player.location.x = spawnPos.x;
    player.location.y = spawnPos.y;
}
respawnPlayer();
game.camera.location.y = gameScreen.height / 2;
game.mainLoopFunctions.push(function () {
    let delta = game.timeData.delta;
    let slowSpeed = 1;
    let beforePos = player.location;
    let currentlyColliding = { x: false, y: false };
    //game.camera.location.y = -player.location.y+(game.camera.scale.height)-(player.scale.height/2)+100;
    player.location.x += (player.speed.x * player.velocity.x * slowSpeed) * delta;
    if (player.velocity.y > 0) {
        player.location.y += (playerMovementData.fallSpeed * player.velocity.y) * delta;
    }
    else {
        player.location.y += (player.speed.y * player.velocity.y) * delta;
    }
    for (let i = 0; i < coins.length; i++) {
        let coin = coins[i];
        let colDetail = player.isCollidingWithDetail(coin, delta);
        if (colDetail !== false) {
            collectedCoins += 1;
            collectedCoinsText.text.content = collectedCoins.toString();
            game.removeSprite(coin);
            coins.splice(i, 1);
            console.log("+1");
        }
    }
    for (let piece of terrain) {
        let colDetail = player.isCollidingWithDetail(piece, delta);
        if (colDetail !== false) {
            isCollidingWithTerrain = true;
            collisionSide = colDetail.side;
            if (colDetail.side == "bottom") {
                currentlyColliding.y = true;
                if (direction.y == 1) {
                    player.location.y = piece.location.y + piece.scale.height + (player.speed.y * delta);
                    player.velocity.y = 0;
                }
            }
            else if (colDetail.side == "top") {
                currentlyColliding.y = true;
                if (direction.y == -1) {
                    player.velocity.y = 0;
                    player.location.y = piece.location.y - player.scale.height;
                }
                else if (direction.y == 1) {
                    player.velocity.x *= 0.5;
                }
                player.speed.y = player.speed.base.y;
                playerMovementData.jumps = 0;
                playerMovementData.jumping = false;
                playerMovementData.falling = false;
            }
            else if (colDetail.side == "left") {
                // left of terrain
                currentlyColliding.x = true;
                player.location.x = piece.location.x - player.scale.width;
            }
            else if (colDetail.side == "right") {
                // right of terrain
                currentlyColliding.x = true;
                player.location.x = piece.location.x + piece.scale.width;
            }
            else if (colDetail.side == "inside") {
                player.speed.y = player.speed.base.y;
                player.location.y = piece.location.y - player.scale.height;
            }
            else {
                console.log("idk");
            }
            if (currentlyColliding.x == true) {
                playerMovementData.jumps = 0;
                player.velocity.x = 0;
            }
        }
    }
    if (!isCollidingWithTerrain) {
        collisionSide = "";
    }
    if (currentlyColliding.y == false) {
        if (player.location.y + player.scale.height + ((playerMovementData.fallSpeed * player.velocity.y) * delta) < gameScreen.height) {
            player.velocity.y += player.velocity.y < 1.5 ? delta : 0;
        }
        else {
            respawnPlayer();
        }
    }
    if (currentlyColliding.x == false && currentlyColliding.y == false) {
        isCollidingWithTerrain = false;
    }
    if ((!(game.keysDown.KeyD && game.keysDown.KeyA) || (game.keysDown.KeyD && game.keysDown.KeyA)) && player.velocity.x !== 0) {
        player.velocity.x += player.velocity.x > 0 ? -1 * (delta * 2) : 1 * (delta * 2);
        if ((player.velocity.x < stopAt && player.velocity.x > 0) || (player.velocity.x > -stopAt && player.velocity.x < 0)) {
            player.velocity.x = 0;
        }
    }
    if (game.keysDown.KeyD) {
        if (!game.keysDown.KeyA)
            player.switchSkin('idleRight');
        player.velocity.x += (player.velocity.x < 1) ? 10 * delta : 0;
    }
    if (game.keysDown.KeyA) {
        if (!game.keysDown.KeyD)
            player.switchSkin('idleLeft');
        player.velocity.x += (player.velocity.x > -1) ? -10 * delta : 0;
    }
    if (game.keysDown.KeyW) {
        if (playerMovementData.jumps < 2) {
            playerMovementData.jumps += 1;
            player.speed.y += player.speed.y >= 300 ? 0 : 25;
            player.velocity.y = -1;
            if (collisionSide == "right") {
                if (!game.keysDown.KeyA) {
                    player.switchSkin('idleRight');
                }
                player.velocity.x += 2;
            }
            else if (collisionSide == "left") {
                if (!game.keysDown.KeyD) {
                    player.switchSkin('idleLeft');
                }
                player.velocity.x -= 2;
            }
        }
        game.keysDown.KeyW = false;
    }
    if (game.keysDown.KeyS) {
        if (player.velocity.x !== 0)
            player.velocity.x += player.velocity.x > 0 ? -1 * delta : 1 * delta;
        if (!currentlyColliding.y)
            player.velocity.y += 1 * delta;
    }
    if (player.velocity.y > 0) {
        playerMovementData.falling = true;
        direction.y = -1;
    }
    else if (player.velocity.y < 0) {
        playerMovementData.jumping = true;
        direction.y = 1;
    }
    else {
        direction.y = 0;
    }
    if (player.velocity.x > 0) {
        direction.x = 1;
    }
    else if (player.velocity.x < 0) {
        direction.x = -1;
    }
    else {
        direction.x = 0;
    }
}, function () {
    let destination = {
        x: -player.location.x + (game.camera.scale.width) - (player.scale.width / 2),
        y: (gameScreen.height) - (player.location.y * 0.9)
    };
    let diff = {
        x: destination.x - game.camera.location.x,
        y: destination.y - game.camera.location.y,
    };
    let distance = Math.sqrt((diff.x ** 2) + (diff.y ** 2));
    let maxDiff = 1;
    if (diff.x <= maxDiff && diff.x >= -maxDiff) {
        diff.x = 0;
    }
    if (diff.y <= maxDiff && diff.y >= -maxDiff) {
        diff.y = 0;
    }
    let drag = cameraDrag;
    if (diff.x < 0) {
        diff.x += drag;
    }
    else if (diff.x > 0) {
        diff.x -= drag;
    }
    if (diff.y < 0) {
        diff.y += drag;
    }
    else if (diff.y > 0) {
        diff.y -= drag;
    }
    game.camera.location.x += drag * (diff.x / 10);
    game.camera.location.y += drag * (diff.y / 10);
});
game.play(); // :3
