"use strict";
// omg starting commenting months after making it wow holy moly I mean whoa
// oooo spooky ts-ignore
// @ts-ignore
const defaults = {
    screen: {
        background: "#FFFFFF"
    }
};
// just for shorthand access by a few characters, also makes more sense to read
var viewport = {
    width: window.innerWidth,
    height: window.innerHeight
};
;
class GameScreen {
    constructor(options) {
        // this doesn't really need to be here, since it's likely I'll already have a canvas anyway, but merrrr
        this.width = viewport.width;
        this.height = viewport.height;
        this.background = "white";
        this.documentObject = document.querySelector('canvas');
        if ('width' in options)
            this.width = options.width;
        if ('height' in options)
            this.height = options.height;
        if ('backgroundColour' in options)
            this.background = options.backgroundColour;
        this.ctx = this.documentObject.getContext("2d");
        this.resize(this.width, this.height, true);
        // just a basic default mouse position before the user moves their mouse
        this.mousePos = {
            x: this.width / 2,
            y: this.height / 2
        };
        document.addEventListener("mousemove", (e) => {
            var rect = this.documentObject.getBoundingClientRect();
            this.mousePos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        });
        // function inside function because idk how javascript works, references window instead of class otherwise :b
        window.addEventListener("resize", () => { this.resize(); });
    }
    clear() {
        this.ctx.save();
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
        // save+restore my beloved, was using variables to do this for so long LOL
    }
    resize(width, height, clearAll = false) {
        this.width = width !== null && width !== void 0 ? width : this.width;
        this.height = height !== null && height !== void 0 ? height : this.height;
        this.documentObject.width = this.width;
        this.documentObject.height = this.height;
        viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        if (clearAll) {
            this.clear();
        } /*else{
            // relying on the game variable being called game, should probably fix this
            if(this.game){
                this.game.redrawEntities();
            }
        }*/
    }
}
let gameScreen = new GameScreen({ width: 700, height: 700 });
class Camera {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f;
        let width = (_b = (_a = options === null || options === void 0 ? void 0 : options.scale) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : "full";
        let height = (_d = (_c = options === null || options === void 0 ? void 0 : options.scale) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : "full";
        let name = (_e = options === null || options === void 0 ? void 0 : options.name) !== null && _e !== void 0 ? _e : "Camera";
        let entityList = (_f = options === null || options === void 0 ? void 0 : options.entities) !== null && _f !== void 0 ? _f : [];
        this.entityList = [];
        this.location = {
            x: gameScreen.width / 2,
            y: gameScreen.height / 2
        };
        this.scale = {
            width: 0,
            height: 0
        };
        this.name = name;
        if (entityList.length > 0) {
            this.entityList = entityList;
        }
        ;
        if (typeof width !== 'string') {
            this.scale.width = width;
        }
        else {
            this.scale.width = gameScreen.width;
        }
        ;
        if (typeof height !== 'string') {
            this.scale.height = height;
        }
        else {
            this.scale.height = gameScreen.height;
        }
        ;
    }
    ;
    giveParent(parent) {
        this.parent = parent;
    }
    isEntityVisible(sprite) {
        let rect1 = {
            x: this.location.x,
            y: this.location.y,
            w: this.scale.width,
            h: this.scale.height,
        };
        let rect2 = {
            x: sprite.location.x,
            y: sprite.location.y,
            w: sprite.scale.width,
            h: sprite.scale.height,
        };
        if (sprite.type == "ball") {
            rect2 = {
                x: sprite.location.x - sprite.scale.radius,
                y: sprite.location.y - sprite.scale.radius,
                w: sprite.scale.radius * 2,
                h: sprite.scale.radius * 2
            };
        }
        ;
        if (rect1.x == rect1.w || rect1.y == rect1.h || rect2.w == rect2.x || rect2.y == rect2.h) {
            console.log("equal");
            return false;
        }
        if (rect1.x > rect2.w || rect2.x > rect1.w) {
            console.log("x");
            return false;
        }
        if (rect1.h > rect2.y || rect2.h > rect1.y) {
            console.log("y");
            return false;
        }
        return true;
    }
}
class Game {
    constructor(name = "Example Game", options = {}) {
        this.name = name;
        this.entities = [];
        this.mainLoopFunctions = [];
        this.settings = [];
        this.autopause = true;
        this.running = false;
        this.timeData = {
            lastTime: undefined,
            delta: 0
        };
        this.fps = 60;
        this.refreshType = 0;
        this.ctx = document.querySelector('canvas').getContext('2d');
        this.camera = new Camera({
            scale: {
                width: "full",
                height: "full"
            },
            location: {
                x: 0,
                y: 0
            },
            name: "Main",
            entities: this.entities
        });
        this.keysDown = {};
        if (this.autopause) {
            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === "visible") {
                    this.play();
                }
                else {
                    this.stop();
                }
            });
            document.addEventListener("blur", () => {
                this.stop();
            });
            document.addEventListener("focus", () => {
                this.play();
            });
        }
        // e.code is a string (KeyW, KeyA, etc), so it's setting the keysDown object property of that key to true or false
        document.addEventListener("keydown", (e) => {
            this.keysDown[e.code] = true;
        });
        document.addEventListener("keyup", (e) => {
            this.keysDown[e.code] = false;
            if (e.code == "Escape") {
                if (this.running) {
                    this.running = false;
                }
                else {
                    this.running = true;
                }
            }
        });
        console.log(`game [${this.name}] started.`);
        if ('onstart' in options) {
            options.onstart();
        }
        if ('refreshType' in options) {
            this.refreshType = options.refreshType;
        }
        if ('fps' in options) {
            this.fps = options.fps;
        }
        if (this.refreshType == 0) { // requestAnimationFrame
            requestAnimationFrame((now) => { this.mainGameLoop(now); });
        }
        else if (this.refreshType == 1) {
            setInterval(() => { this.mainGameLoop(performance.now()); }, 1000 / this.fps);
        }
        else {
            requestAnimationFrame((now) => { this.mainGameLoop(now); });
        }
        // requestAnimationFrame gives a parameter that is the time since [time origin](https://developer.mozilla.org/en-US/docs/Web/API/Performance/timeOrigin#value)
        // (the time at which the browser context was created)
    }
    mainGameLoop(now) {
        if (this.timeData.lastTime == undefined) {
            this.timeData.lastTime = now;
        }
        // capping delta at 0.35 seconds, to prevent massive snapping to other sides of the screen
        this.timeData.delta = (now - this.timeData.lastTime > 1000 / 30) ? 1 / 30 : (now - this.timeData.lastTime) / 1000;
        this.timeData.lastTime = now;
        // also keeping delta outside of game pausing, because otherwise `now` would keep increasing and `lastTime` would stay the same, resulting in there being one frame of
        // massive "lag" every time the game is paused for any length of time
        // also redrawing entities every frame in case of any visual changes while paused
        this.redrawEntities();
        if (this.running) {
            for (let i = 0; i < this.mainLoopFunctions.length; i++) {
                this.mainLoopFunctions[i]();
            }
        }
        if (this.refreshType == 0) {
            requestAnimationFrame((now) => { this.mainGameLoop(now); });
        }
    }
    addSprite(sprite) {
        this.entities.push(sprite);
        this.camera.entityList = this.entities;
        this.entities[this.entities.length - 1].parent = this;
        return this.entities[this.entities.length - 1];
    }
    addSprites(...sprites) {
        for (let i = 0; i < sprites.length; i++) {
            sprites[i].parent = this;
        }
        this.entities = this.entities.concat(sprites);
        this.camera.entityList = this.entities;
        return this.entities.slice(-sprites.length);
    }
    refreshSprite(sprite) {
        return new Sprite(sprite.fullConfig, sprite.customProperties);
    }
    refreshAllSprites() {
        gameScreen.clear();
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].type == "image") {
                this.entities[i] = this.refreshSprite(this.entities[i]);
            }
            ;
            this.entities[i].draw();
        }
    }
    play() {
        this.running = true;
    }
    stop() {
        this.running = false;
    }
    redrawEntities() {
        gameScreen.clear();
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw();
            if (this.entities[i].animations.length >= 1) {
                this.entities[i].animations[0].update(this.timeData.delta);
            }
            ;
        }
    }
    resortByZIndex() {
        this.entities.sort(function (a, b) {
            return a.location.z - b.location.z;
        });
    }
    addSetting(name = "greg", values = {
        name: "property name",
        value: "property value"
    }) {
        let setting = {};
        setting['name'] = name;
        for (let prop in values) {
            setting[`${prop}`] = values[`${prop}`];
        }
        this.settings.push(setting);
        let save = JSON.stringify(this.settings); // storing all settings as json for ease and to not clutter localStorage, also allow for more names on other pages
        localStorage.setItem(`${this.name} Game Settings`, save);
        return this.settings[this.settings.length - 1];
    }
    removeSetting(name = "greg") {
    }
    saveSettings() {
        let save = JSON.stringify(this.settings);
        localStorage.setItem(`${this.name} Game Settings`, save);
    }
    loadSettings() {
        let save = JSON.parse(localStorage.getItem(`${this.name} Game Settings`));
        if (save !== null || save !== "") {
            this.settings = [...new Set(save)]; // advantages of using Set is that it only contains unique values (and it's decently quick with it)
        }
    }
}
class Sprite {
    constructor(options, customProperties = []) {
        var _a, _b, _c, _d;
        // setting defaults at beginning instead of as a contingency, also less else statements (less confusing to read)
        this.name = "John Derp";
        this.type = "box";
        this.skin = new Image();
        this.animations = [];
        this.spriteUrl = "";
        this.location = {
            x: 0,
            y: 0,
            z: 0
        };
        this.speed = {
            x: 10,
            y: 10,
            base: {
                x: 0,
                y: 0
            }
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        this.scale = {
            width: 100,
            height: 100,
            naturalWidth: 100,
            naturalHeight: 100,
            radius: 50,
            naturalRadius: 50
        };
        this.skins = [];
        this.colour = {
            fill: "black",
            stroke: "black"
        };
        this.hidden = false;
        this.opacity = 1;
        this.tags = [];
        this.fillMode = "fill";
        this.customProperties = customProperties;
        this.fullConfig = options;
        this.fullyLoaded = false;
        // hot disgusting mess of if statements
        if ('name' in options.info) {
            this.name = options.info.name;
        }
        if ('hidden' in options.info) {
            this.hidden = options.info.hidden;
        }
        if ('colour' in options.info) {
            if ('fill' in options.info.colour) {
                this.colour.fill = options.info.colour.fill;
            }
            if ('stroke' in options.info.colour) {
                this.colour.stroke = options.info.colour.stroke;
            }
        }
        if ('opacity' in options.info) {
            this.opacity = options.info.opacity;
        }
        if ('tags' in options.info) {
            this.tags = options.info.tags;
        }
        if ('location' in options) {
            if ('x' in options.location) {
                this.location.x = options.location.x;
            }
            if ('y' in options.location) {
                this.location.y = options.location.y;
            }
            if ('z' in options.location) {
                this.location.z = options.location.z;
            }
        }
        if ('speed' in options.info) {
            if ('x' in options.info.speed) {
                this.speed.x = options.info.speed.x;
            }
            if ('y' in options.info.speed) {
                this.speed.y = options.info.speed.y;
            }
            if ('base' in options.info.speed) {
                if ('x' in options.info.speed.base) {
                    this.speed.base.x = options.info.speed.base.x;
                }
                if ('y' in options.info.speed.base) {
                    this.speed.base.y = options.info.speed.base.y;
                }
            }
            else {
                this.speed.base = {
                    x: this.speed.x,
                    y: this.speed.y
                };
            }
        }
        if ('type' in options.info) {
            if ('fillMode' in options.info) {
                if (options.info.fillMode == "fill" || options.info.fillMode == "nofill") {
                    this.fillMode = options.info.fillMode;
                }
            }
            if (options.info.type == "box") {
                this.type = "box";
                if ('scale' in options) {
                    if (typeof options.scale.width !== "string") {
                        this.scale.width = options.scale.width;
                        this.scale.naturalWidth = options.scale.width;
                    }
                    if (typeof options.scale.height !== "string") {
                        this.scale.height = options.scale.height;
                        this.scale.naturalHeight = options.scale.height;
                    }
                }
            }
            if (options.info.type == "ball") {
                this.type = "ball";
                if ('scale' in options) {
                    if ('radius' in options.scale) {
                        this.scale.radius = options.scale.radius;
                        this.scale.naturalRadius = options.scale.radius;
                    }
                    else if ('width' in options.scale || 'height' in options.scale) {
                        this.scale.width = 'width' in options.scale && typeof options.scale.width !== "string" ? options.scale.width : 0;
                        this.scale.height = 'height' in options.scale && typeof options.scale.height !== "string" ? options.scale.height : 0;
                        this.scale.radius = ((this.scale.width + this.scale.height) / 2) / 2;
                    }
                }
            }
            if (options.info.type == "image") {
                this.type = "image";
                if ('skins' in options.info) {
                    this.fullyLoaded = false;
                    for (let i = 0; i < options.info.skins.length; i++) {
                        let skin = options.info.skins[i];
                        this.skins.push(new Skin({
                            name: skin.name,
                            url: skin.url,
                            scale: {
                                width: (_b = (_a = options === null || options === void 0 ? void 0 : options.scale) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : "default",
                                height: (_d = (_c = options === null || options === void 0 ? void 0 : options.scale) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : "default"
                            }
                        }, () => {
                            this.fullyLoaded = true;
                            if ('anims' in options.info) {
                                this.animations = options.info.anims;
                            }
                            if ('scale' in options) {
                                if (typeof options.scale.width === "string") {
                                    this.scale.width = this.skin.naturalWidth;
                                    this.scale.naturalWidth = this.skin.naturalWidth;
                                }
                                else {
                                    this.scale.width = options.scale.width;
                                    this.scale.naturalWidth = options.scale.width;
                                }
                                if (typeof options.scale.height === "string") {
                                    this.scale.height = this.skin.naturalHeight;
                                    this.scale.naturalHeight = this.skin.naturalHeight;
                                }
                                else {
                                    this.scale.height = options.scale.height;
                                    this.scale.naturalHeight = options.scale.height;
                                }
                            }
                        }));
                    }
                    this.skin = this.skins[0].sprite;
                }
            }
            // to prevent drawing an image before it's loaded, wouldn't do anything if it did, it's just weird
            if (this.type !== "image") {
                this.draw();
            }
            ;
        }
    }
    switchSkin(name) {
        let skin = this.skins.filter((a) => {
            return a.name == name;
        })[0];
        if (skin) {
            this.skin = skin.sprite;
            this.scale.width = skin.scale.width;
            this.scale.height = skin.scale.height;
        }
    }
    draw() {
        if (this.hidden == false) {
            gameScreen.ctx.save();
            gameScreen.ctx.globalAlpha = this.opacity;
            let loc = {
                x: this.location.x,
                y: this.location.y
            };
            if (this.parent !== undefined && typeof this.parent == 'object') {
                loc.x = (this.parent.camera.location.x - (this.parent.camera.scale.width / 2)) + this.location.x;
                loc.y = (this.parent.camera.location.y - (this.parent.camera.scale.height / 2)) + this.location.y;
            }
            if (this.type == "image") {
                if (this.fullyLoaded == true) {
                    gameScreen.ctx.drawImage(this.skin, loc.x, loc.y, this.skin.width, this.skin.height);
                }
            }
            else if (this.type == "box") {
                gameScreen.ctx.beginPath();
                gameScreen.ctx.fillStyle = this.colour.fill;
                gameScreen.ctx.strokeStyle = this.colour.stroke;
                if (this.fillMode == "fill") {
                    gameScreen.ctx.fillRect(loc.x, loc.y, this.scale.width, this.scale.height);
                }
                gameScreen.ctx.rect(loc.x, loc.y, this.scale.width, this.scale.height);
                gameScreen.ctx.stroke();
            }
            else if (this.type == "ball") {
                gameScreen.ctx.beginPath();
                gameScreen.ctx.strokeStyle = this.colour.fill;
                gameScreen.ctx.strokeStyle = this.colour.stroke;
                gameScreen.ctx.arc(loc.x, loc.y, this.scale.radius, 0, Math.PI * 2);
                if (this.fillMode == "fill") {
                    gameScreen.ctx.fill();
                    gameScreen.ctx.beginPath();
                    gameScreen.ctx.arc(loc.x, loc.y, this.scale.radius, 0, Math.PI * 2);
                    gameScreen.ctx.stroke();
                }
                else {
                    gameScreen.ctx.stroke();
                }
            }
            gameScreen.ctx.restore();
        }
    }
    changeSize(options) {
        let isWidth = (options === null || options === void 0 ? void 0 : options.width) !== undefined;
        let isHeight = (options === null || options === void 0 ? void 0 : options.height) !== undefined;
        let difference = {
            width: isWidth ? (options.width > this.scale.width ? options.width - this.scale.width : this.scale.width - options.width) : 0,
            height: isHeight ? (options.height > this.scale.height ? options.height - this.scale.height : this.scale.height - options.height) : 0
        };
        this.scale.width = isWidth ? options.width : this.scale.width;
        this.scale.height = isHeight ? options.height : this.scale.height;
        if (this.skins.length >= 1) {
            for (let skin = 0; skin < this.skins.length; skin++) {
            }
        }
    }
    getProperty(name) {
        if (this.customProperties.length > 0) {
            return this.customProperties.filter(obj => {
                return obj.name === name;
            })[0];
        }
    }
    getProperties(name) {
        if (this.customProperties.length > 0) {
            return this.customProperties.filter(obj => {
                return obj.name === name;
            });
        }
    }
    isInside(sprite) {
        let rect1 = {
            x: this.location.x,
            y: this.location.y,
            w: this.scale.width,
            h: this.scale.height,
        };
        let rect2 = {
            x: sprite.location.x,
            y: sprite.location.y,
            w: sprite.scale.width,
            h: sprite.scale.height,
        };
        if (this.type == "ball") {
            rect1 = {
                x: this.location.x - this.scale.radius,
                y: this.location.y - this.scale.radius,
                w: this.scale.radius * 2,
                h: this.scale.radius * 2
            };
        }
        if (sprite.type == "ball") {
            rect2 = {
                x: sprite.location.x - sprite.scale.radius,
                y: sprite.location.y - sprite.scale.radius,
                w: sprite.scale.radius * 2,
                h: sprite.scale.radius * 2
            };
        }
        if (rect1.x == rect1.w || rect1.y == rect1.h || rect2.w == rect2.x || rect2.y == rect2.h) {
            return false;
        }
        if (rect1.x > rect2.w || rect2.x > rect1.w) {
            return false;
        }
        if (rect1.h > rect2.y || rect2.h > rect1.y) {
            return false;
        }
        return true;
    }
    isColliding(sprite) {
        let rect1 = {
            x: this.location.x,
            y: this.location.y,
            w: this.scale.width,
            h: this.scale.height,
        };
        let rect2 = {
            x: sprite.location.x,
            y: sprite.location.y,
            w: sprite.scale.width,
            h: sprite.scale.height,
        };
        if (this.type == "ball") {
            rect1 = {
                x: this.location.x - this.scale.radius,
                y: this.location.y - this.scale.radius,
                w: this.scale.radius * 2,
                h: this.scale.radius * 2
            };
        }
        if (sprite.type == "ball") {
            rect2 = {
                x: sprite.location.x - sprite.scale.radius,
                y: sprite.location.y - sprite.scale.radius,
                w: sprite.scale.radius * 2,
                h: sprite.scale.radius * 2
            };
        }
        if (rect1.x <= rect2.x + rect2.w &&
            rect1.x + rect1.w >= rect2.x &&
            rect1.y <= rect2.y + rect2.h &&
            rect1.y + rect1.h >= rect2.y) {
            return true;
        }
        else {
            return false;
        }
    }
    collisionDetail(sprite, iscol = false) {
        let margin = 15;
        if (this.location.y <= sprite.location.y + sprite.scale.height && this.location.y >= sprite.location.y + sprite.scale.height - margin) { // bottom
            return "bottom";
        }
        else if (this.location.y + this.scale.height >= sprite.location.y && this.location.y + this.scale.height <= sprite.location.y + margin) { // top
            return "top";
        }
        else if (this.location.x + this.scale.width >= sprite.location.x && this.location.x + this.scale.width <= sprite.location.x + margin) { // left
            return "left";
        }
        else if (this.location.x <= sprite.location.x + sprite.scale.width && this.location.x >= sprite.location.x + sprite.scale.width - margin) { // right
            return "right";
        }
        else { // inside
            if (iscol == true) {
                return "inside";
            }
            else {
                return false;
            }
        }
    }
    isCollidingWithDetail(sprite) {
        if (this.isColliding(sprite)) {
            let colDetail = this.collisionDetail(sprite, true);
            return {
                side: colDetail,
                colliding: true
            };
        }
        else {
            return false;
        }
    }
    isCoordsOver(x, y) {
        let minSelf = this.location;
        let maxSelf = {
            x: this.location.x + this.scale.width,
            y: this.location.y + this.scale.height
        };
        let target = {
            x: x,
            y: y
        };
        if (minSelf.x > target.x || target.x > maxSelf.x) {
            return false;
        }
        if (maxSelf.y > target.y || target.y > minSelf.y) {
            return false;
        }
    }
}
class Skin {
    constructor(options, onload) {
        this.name = "Example",
            this.url = "",
            this.sprite = new Image(),
            this.scale = {
                width: 0,
                height: 0,
                naturalWidth: 0,
                naturalHeight: 0
            };
        if ('url') {
            this.url = options.url;
            if ('name' in options) {
                this.name = options.name;
            }
            this.sprite = new Image();
            this.sprite.onload = () => {
                this.scale.naturalWidth = this.sprite.naturalWidth;
                this.scale.naturalHeight = this.sprite.naturalHeight;
                if ('scale' in options) {
                    if ('width' in options.scale) {
                        if (typeof options.scale.width == "string") {
                            this.scale.width = this.sprite.naturalWidth;
                            this.sprite.width = this.sprite.naturalWidth;
                        }
                        else {
                            this.scale.width = options.scale.width;
                            this.sprite.width = options.scale.width;
                        }
                    }
                    if ('height' in options.scale) {
                        if (typeof options.scale.height == "string") {
                            this.scale.height = this.sprite.naturalHeight;
                            this.sprite.height = this.sprite.naturalHeight;
                        }
                        else {
                            this.scale.height = options.scale.height;
                            this.sprite.height = options.scale.height;
                        }
                    }
                }
                else {
                    this.sprite.width = this.sprite.naturalWidth;
                    this.sprite.height = this.sprite.naturalHeight;
                }
                if (onload) {
                    onload();
                }
                return this;
            };
            this.sprite.src = this.url;
        }
    }
}
class Anim {
    constructor(options) {
        this.parent;
        this.paused = false;
        this.frames = new Array();
        this.fps = 12;
        this.currentFrame = 0;
        this.timeNeeded = 0;
        this.timeTracker = 0;
        this.scale = {
            width: "default",
            height: "default",
            naturalWidth: 0,
            naturalHeight: 0
        };
        if ('parent' in options) {
            this.parent = options.parent;
            if ('fps' in options) {
                this.fps = options.fps;
            }
            if ('scale' in options) {
                if ('width' in options.scale) {
                    if (typeof options.scale.width == 'string') {
                        this.scale.width = 'default';
                    }
                    else {
                        this.scale.width = options.scale.width;
                    }
                }
                if ('height' in options.scale) {
                    if (typeof options.scale.height == 'string') {
                        this.scale.height = 'default';
                    }
                    else {
                        this.scale.height = options.scale.height;
                    }
                }
            }
            else {
                this.scale.width = this.parent.scale.width;
                this.scale.height = this.parent.scale.height;
            }
            if ('frames' in options) {
                this.frames = options.frames;
                console.log(this.frames);
                for (let frame = 0; frame < this.frames.length; frame++) {
                    this.frames[frame] = new Skin({
                        name: this.frames[frame].name,
                        url: this.frames[frame].url,
                        scale: {
                            width: this.scale.width,
                            height: this.scale.height
                        }
                    });
                }
            }
            this.timeNeeded = 1 / this.fps;
        }
        else {
            console.error("you didn't give the animation a parent you stupid sod ( in a nice way :] )");
        }
    }
    update(delta) {
        if (this.paused == false) {
            this.timeTracker += delta;
            if (this.timeTracker >= this.timeNeeded) {
                this.timeTracker = 0;
                this.currentFrame += 1;
                if (this.frames[this.currentFrame] == undefined) {
                    this.currentFrame = 0;
                }
                this.parent.skin = this.frames[this.currentFrame].sprite;
            }
        }
    }
    isPlaying() {
        return !this.paused;
    }
    pause() {
        this.paused = true;
    }
    stop() {
        this.currentFrame = 0;
        this.parent.skin = this.frames[0].sprite;
        this.pause();
    }
    play() {
        this.paused = false;
    }
    restart(play = false) {
        this.currentFrame = 0;
        this.parent.skin = this.frames[0].sprite;
        if (play == true) {
            this.play();
        }
    }
}
