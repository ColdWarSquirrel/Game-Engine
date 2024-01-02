"use strict";
gameScreen.resize(viewport.width - 10, viewport.height - 10);
// @ts-ignore
const game = new Game("Jumpy Jump Autistic");
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
let playerSkins = player.getProperty("skins");
let playerMovementData = player.getProperty("movementData");
class Floor extends Sprite {
    constructor(options) {
        let colour = {
            fill: "darkgreen",
            stroke: "lime"
        };
        options.info = {
            name: "platform",
            type: "box",
            tags: ["terrain"],
            colour: colour
        };
        super(options);
    }
}
class Coin extends Sprite {
    constructor(options) {
        options.info = {
            name: "coin",
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
let coins = game.addSprites(new Coin({
    location: {
        x: (gameScreen.width * 0.5) + 100,
        y: (gameScreen.height - 30) - 60
    }
}), new Coin({
    location: {
        x: (gameScreen.width * 0.5) + 150,
        y: (gameScreen.height - 30) - 60
    }
}), new Coin({
    location: {
        x: (gameScreen.width * 0.5) + 200,
        y: (gameScreen.height - 30) - 60
    }
}));
let terrain = game.addSprites(new Floor({
    location: {
        x: 0,
        y: (gameScreen.height - 30),
        z: -1
    },
    scale: {
        width: gameScreen.width,
        height: 40
    }
}), new Floor({
    location: {
        x: 270,
        y: (gameScreen.height - 650),
        z: -1
    },
    scale: {
        width: 25,
        height: 500
    }
}), new Floor({
    location: {
        x: 25,
        y: (gameScreen.height - 650),
        z: -1
    },
    scale: {
        width: 25,
        height: 500
    }
}));
let stopAt = 0.05;
game.resortByZIndex();
document.body.style.backgroundColor = "black";
gameScreen.background = "black";
let isCollidingWithTerrain = false;
let direction = { x: 0, y: 0 };
let collisionSide = "";
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
    game.camera.location.x = -player.location.x + (game.camera.scale.width) - (player.scale.width / 2);
    for (let piece of terrain) {
        let colDetail = player.isCollidingWithDetail(piece);
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
            player.location.y = gameScreen.height / 2;
            player.location.x = gameScreen.width / 2;
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
            player.speed.y += 25;
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
});
game.play(); // :3
