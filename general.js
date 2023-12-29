"use strict";
// omg starting commenting months after making it wow holy moly I mean whoa

// might use this later, dunno what for jus ignore
const defaults = {
    screen:{
        background:"#FFFFFF"
    }
};

// just for shorthand access by a few characters, also makes more sense language-wise
var viewport = {
    width:window.innerWidth,
    height:window.innerHeight
};
class Screen{
    constructor(width=viewport.width, height=viewport.height, canvasDO, backgroundColour=defaults.screen.background) // switch to single parameter called options at some point
    {
        // this doesn't really need to be here, since it's likely I'll already have a canvas anyway, but merrrr
        if(!canvasDO){
            this.documentObject = document.createElement("canvas");
            document.body.insertBefore(this.documentObject, document.body.firstChild);
        }else{
            this.documentObject = document.querySelector(`#${canvasDO}`);
        }

        this.background = backgroundColour;
        this.ctx = this.documentObject.getContext("2d");
        this.resize(width,height,true);

        // just a basic default mouse position before the user moves their mouse
        this.mousePos = {
            x:this.width/2,
            y:this.height/2
        }

        document.addEventListener("mousemove", (e)=>{
            var rect = this.documentObject.getBoundingClientRect();
            this.mousePos = {
                x:e.clientX,
                y:e.clientY
            }
        });

        // function inside function because idk how javascript works, references window instead of class otherwise :b
        window.addEventListener("resize", ()=>{this.resize()});
    }
    clear(){
        this.ctx.save();
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0,0,this.width,this.height);
        this.ctx.restore();
        // save+restore my beloved, was using variables to do this for so long LOL
    }
    resize(width, height, clearAll=false){
        this.width = width ?? this.width;
        this.height = height ?? this.height;
        this.documentObject.width = this.width;
        this.documentObject.height = this.height;
        viewport = {
            width:window.innerWidth,
            height:window.innerHeight
        };
        if(clearAll){
            this.clear();
        }else{
            // relying on the game variable being called game, should probably fix this
            game.redrawEntities();
        }
    }
}
class Game{
    constructor(name="Example Game", onstart=()=>{}){
        this.name = name;
        this.entities = [];
        this.mainLoopFunctions = [];
        this.settings = [];
        this.running = false;
        this.timeData = {
            lastTime:undefined,
            delta:0,
            scale:undefined
        }
        this.keysDown = {};

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                this.play();
            } else {
                this.stop();
            }
        });
        document.addEventListener("blur",()=>{
            this.stop();
        })
        document.addEventListener("focus",()=>{
            this.play();
        })

        // e.code is a string (KeyW, KeyA, etc), so it's setting the keysDown object property of that key to true or false
        document.addEventListener("keydown", (e)=>{
            this.keysDown[e.code] = true;
        })
        document.addEventListener("keyup", (e)=>{
            this.keysDown[e.code] = false;
            if(e.code == "Escape"){
                if(this.running){
                    this.running = false;
                }else{
                    this.running = true;
                }
            }
        })
        console.log(`game [${this.name}] started.`);
        onstart();
        // requestAnimationFrame gives a parameter that is the time since [time origin](https://developer.mozilla.org/en-US/docs/Web/API/Performance/timeOrigin#value)
        // (the time at which the browser context was created)
        requestAnimationFrame((now)=>{this.mainGameLoop(now)})
    }
    mainGameLoop(now){
        if (this.timeData.lastTime==undefined) { this.timeData.lastTime = now; }
        // capping delta at 0.35 seconds, to prevent massive snapping to other sides of the screen
        this.timeData.delta = (now - this.timeData.lastTime>350) ? 0.35 : (now - this.timeData.lastTime)/1000;
        this.timeData.lastTime = now;
        // also keeping delta outside of game pausing, because otherwise `now` would keep increasing and `lastTime` would stay the same, resulting in there being one frame of
        // massive "lag" every time the game is paused for any length of time

        // also redrawing entities every frame in case of any visual changes while paused
        this.redrawEntities();

        if(this.running){
            for(let i = 0; i < this.mainLoopFunctions.length; i++){
                this.mainLoopFunctions[i]();
            }
        }
        requestAnimationFrame((now)=>{this.mainGameLoop(now)});
    }
    addSprite(sprite){
        this.entities.push(sprite);
        return this.entities[this.entities.length-1];
    }
    refreshSprite(sprite){
        return new Sprite(sprite.fullConfig, sprite.customProperties);
    }
    refreshAllSprites(){
        screen.clear();
        for(var i = 0; i<this.entities.length; i++){
            if(this.entities[i].type == "image") { this.entities[i] = this.refreshSprite(this.entities[i].fullConfig, this.entities[i].customProperties); };
            this.entities[i].draw();
        }
    }
    play(){
        this.running = true;
    }
    stop(){
        this.running = false;
    }
    redrawEntities(){
        screen.clear();
        for(var i = 0; i<this.entities.length; i++){
            this.entities[i].draw();
        }
    }
    resortByZIndex(){
        this.entities.sort(function(a, b) {
            return a.location.z - b.location.z;
        })
    }
    addSetting(name="greg", values={
        name:"property name",
        value:"property value"
    }){
        let setting = {};
        setting.name = name;
        for(let prop in values){
            setting[`${prop}`] = values[`${prop}`];
        }
        this.settings.push(setting);
        let save = JSON.stringify(this.settings); // storing all settings as json for ease and to not clutter localStorage, also allow for more names on other pages
        localStorage.setItem(`${this.name} Game Settings`, save);
        return this.settings[this.settings.length-1];
    }
    removeSetting(name="greg"){
    }
    saveSettings(){
        let save = JSON.stringify(this.settings);
        localStorage.setItem(`${this.name} Game Settings`, save);
    }
    loadSettings(){
        let save = JSON.parse(localStorage.getItem(`${this.name} Game Settings`));
        if(save!==null){
            this.settings = [...new Set(save)]; // advantages of using Set is that it only contains unique values (and it's decently quick with it)
        }
    }
}
// now we get into the meat of it
class Sprite{
    constructor(options={ //  sexy parameter setup, I know
        info:{
            name:"John Doe",
            skins:[
                {
                    name:"idle",
                    url:"sprites/example.png"
                }
            ], 
            type:"box",
            fillMode:"fill",
            colour:{
                fill:"black",
                stroke:"black"
            },
            speed:{
                x:10,
                y:10
            },
            opacity:1,
            hidden:false,
            tags:[""]
        }, 
        location:{
            x:0,
            y:0,
            z:0
        }, 
        scale:{
            width:"default",
            height:"default"
        }
    }, customProperties=[]){
        // setting defaults at beginning instead of as a contingency, also less else statements (less confusing to read)
        this.name = "John Derp";
        this.location = {
            x:0,
            y:0,
            z:0
        }
        this.speed = {
            x:10,
            y:10,
            base:{
                x:0,
                y:0
            }
        }
        this.velocity = {
            x:0,
            y:0
        }
        this.scale = {
            width:100,
            height:100,
            naturalWidth:100,
            naturalHeight:100,
            radius:50,
            naturalRadius:50
        }
        this.skins = [];
        this.colour = {
            fill:"black",
            stroke:"black"
        }
        this.hidden = false;
        this.opacity = 1;
        this.tags = [];
        this.fillMode = "fill";
        this.customProperties = customProperties;
        this.fullConfig = options;
        this.fullyLoaded = false;
        
        // hot disgusting mess of if statements
        if('name' in options.info){
            this.name = options.info.name;
        }else{
            this.name = "John Derp";
        }
        if('hidden' in options.info){
            this.hidden = options.info.hidden;
        }
        if('colour' in options.info){
            if('fill' in options.info.colour){
                this.colour.fill = options.info.colour.fill;
            }
            if('stroke' in options.info.colour){
                this.colour.stroke = options.info.colour.stroke;
            }
        }
        if('opacity' in options.info){
            this.opacity = options.info.opacity;
        }
        if('tags' in options.info){
            this.tags = options.info.tags;
        }
        if('location' in options){
            if('x' in options.location){
                this.location.x = options.location.x;
            }
            if('y' in options.location){
                this.location.y = options.location.y;
            }
            if('z' in options.location){
                this.location.z = options.location.z;
            }
        }
        if('speed' in options.info){
            if('x' in options.info.speed){
                this.speed.x = options.info.speed.x;
            }
            if('y' in options.info.speed){
                this.speed.y = options.info.speed.y;
            }
            if('base' in options.info.speed){
                if('x' in options.info.speed.base){
                    this.speed.base.x = options.info.speed.base.x;
                }
                if('y' in options.info.speed.base){
                    this.speed.base.y = options.info.speed.base.y;
                }
            }else{
                this.speed.base = {
                    x:this.speed.x,
                    y:this.speed.y
                }
            }
        }
        if('type' in options.info){
            if('fillMode' in options.info){
                if(options.info.fillMode=="fill"||options.info.fillMode=="nofill"){
                    this.fillMode = options.info.fillMode;
                }
            }
            if(options.info.type=="box"){
                this.type = "box";
                if('scale' in options){
                    if(options.scale.width!=="default"){
                        this.scale.width = options.scale.width;
                        this.scale.naturalWidth = options.scale.width;
                    }
                    if(options.scale.height!=="default"){
                        this.scale.height = options.scale.height;
                        this.scale.naturalHeight = options.scale.height;
                    }
                }
            }
            if(options.info.type=="ball"){
                this.type = "ball";
                if('scale' in options){
                    if('radius' in options.scale){
                        this.scale.radius = options.scale.radius;
                        this.scale.naturalRadius = options.scale.radius;
                    }else if('width' in options.scale || 'height' in options.scale){
                        this.width = 'width' in options.scale ? options.scale.width : 0;
                        this.height = 'height' in options.scale ? options.scale.height : 0;
                        this.radius = (this.width+this.height)/2;
                    }
                }
            }
            if(options.info.type=="image"){
                this.type = "image";
                if('skins' in options.info){
                    this.fullyLoaded = false;
                    for(let i = 0; i < options.info.skins.length; i++){
                        let skin = options.info.skins[i];
                        this.skins.push({
                            name:skin.name,
                            url:skin.url,
                            sprite:undefined,
                            scale:{
                                naturalWidth:0,
                                naturalHeight:0
                            }
                        });
                        skin = this.skins[i];
                        skin.sprite = new Image();
                        skin.sprite.onload = ()=>{
                            skin.scale.naturalWidth = skin.sprite.naturalWidth;
                            skin.scale.naturalHeight = skin.sprite.naturalHeight;
                            if(i == options.info.skins.length-1){
                                console.log(`${this.name} skins:`);
                                console.log(this.skins);
                                this.sprite = this.skins[0].sprite;
                                if('scale' in options){
                                    if('width' in options.scale){
                                        if(options.scale.width=="default"){
                                            this.scale.width = this.skins[0].scale.naturalWidth;
                                            this.sprite.width = this.skins[0].scale.naturalWidth;
                                        }else{
                                            this.scale.width = options.scale.width;
                                            this.sprite.width = options.scale.width;
                                        }
                                    }
                                    if('height' in options.scale){
                                        if(options.scale.height=="default"){
                                            this.scale.height = this.skins[0].scale.naturalHeight;
                                            this.sprite.height = this.skins[0].scale.naturalHeight;
                                        }else{
                                            this.scale.height = options.scale.height;
                                            this.sprite.height = options.scale.height;
                                        }
                                    }
                                }else{
                                    this.sprite.width = this.skins[0].scale.naturalWidth;
                                    this.sprite.height = this.skins[0].scale.naturalHeight;
                                }
                                this.fullyLoaded = true;
                                this.draw();
                            }
                        };
                        skin.sprite.src = skin.url;
                    }
                }
            }
            // to prevent drawing an image before it's loaded, wouldn't do anything if it did, it's just weird
            if(this.type!=="image") {this.draw();};
        }
    }
    draw(){
        if(this.hidden==false){
            screen.ctx.save();
            screen.ctx.globalAlpha = this.opacity;
            if(this.type=="image"){
                if(this.fullyLoaded == true){
                    screen.ctx.drawImage(this.sprite, this.location.x, this.location.y, this.scale.width, this.scale.height);
                }
            }else if(this.type=="box"){
                screen.ctx.beginPath();
                screen.ctx.fillStyle = this.colour.fill;
                screen.ctx.strokeStyle = this.colour.stroke;
                if(this.fillMode == "fill"){
                    screen.ctx.fillRect(this.location.x, this.location.y, this.scale.width, this.scale.height);
                }
                screen.ctx.rect(this.location.x, this.location.y, this.scale.width, this.scale.height);
                screen.ctx.stroke();
            }else if(this.type=="ball"){
                screen.ctx.beginPath();
                screen.ctx.strokeStyle = this.colour.fill;
                screen.ctx.strokeStyle = this.colour.stroke;
                screen.ctx.arc(this.location.x,this.location.y,this.scale.radius,0,Math.PI*2);
                if(this.fillMode == "fill"){
                    screen.ctx.fill();
                    screen.ctx.beginPath();
                    screen.ctx.arc(this.location.x,this.location.y,this.scale.radius,0,Math.PI*2);
                    screen.ctx.stroke();
                }else{
                    screen.ctx.stroke();
                }
            }
            screen.ctx.restore();
        }
    }
    changeSpriteUrl(options={
        url:"sprites/testSprite.png",
        scale:{
            width:100,
            height:100,
            naturalWidth:100,
            naturalHeight:100
        }
    }){
        this.spriteUrl = options.url;
        this.sprite = new Image();
        this.sprite.onload = ()=>{
            this.scale.naturalWidth = this.sprite.naturalWidth;
            this.scale.naturalHeight = this.sprite.naturalHeight;
            if('scale' in options){
                if('width' in options.scale){
                    if(options.scale.width=="default"){
                        this.scale.width = this.scale.naturalWidth;
                        this.sprite.width = this.scale.naturalWidth;
                    }else{
                        this.scale.width = options.scale.width;
                        this.sprite.width = options.scale.width;
                    }
                }
                if('height' in options.scale){
                    if(options.scale.height=="default"){
                        this.scale.height = this.scale.naturalHeight;
                        this.sprite.height = this.scale.naturalHeight;
                    }else{
                        this.scale.height = options.scale.height;
                        this.sprite.height = options.scale.height;
                    }
                }
            }else{
                this.sprite.width = this.scale.naturalWidth;
                this.sprite.height = this.scale.naturalHeight;
            }
            this.draw();
        };
        this.sprite.src = this.spriteUrl;
    }
    getProperty(name){
        if(this.customProperties.length>0){
            return this.customProperties.filter(obj => {
                return obj.name === name;
            })[0];
        }
    }
    getProperties(name){
        if(this.customProperties.length>0){
            return this.customProperties.filter(obj => {
                return obj.name === name;
            });
        }
    }
    isInside(sprite){
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
        if(this.type == "ball"){
            rect1 = {
                x: this.location.x-this.scale.radius,
                y: this.location.y-this.scale.radius,
                w: this.scale.radius*2,
                h: this.scale.radius*2
            };
        }
        if(sprite.type == "ball"){
            rect2 = {
                x: sprite.location.x-sprite.scale.radius,
                y: sprite.location.y-sprite.scale.radius,
                w: sprite.scale.radius*2,
                h: sprite.scale.radius*2
            };
        }
        if (rect1.x == rect1.w || rect1.y == rect1.h || rect2.w == rect2.x || rect2.y == rect2.h){
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
    isColliding(sprite){
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
        if(this.type == "ball"){
            rect1 = {
                x: this.location.x-this.scale.radius,
                y: this.location.y-this.scale.radius,
                w: this.scale.radius*2,
                h: this.scale.radius*2
            };
        }
        if(sprite.type == "ball"){
            rect2 = {
                x: sprite.location.x-sprite.scale.radius,
                y: sprite.location.y-sprite.scale.radius,
                w: sprite.scale.radius*2,
                h: sprite.scale.radius*2
            };
        }
        if (
            rect1.x <= rect2.x + rect2.w &&
            rect1.x + rect1.w >= rect2.x &&
            rect1.y <= rect2.y + rect2.h &&
            rect1.y + rect1.h >= rect2.y
        ) {
            return true;
        } else {
            return false;
        }
    }
    collisionDetail(sprite,iscol=false){
        let margin = 15;
        if(this.location.y <= sprite.location.y + sprite.scale.height && this.location.y >= sprite.location.y + sprite.scale.height - margin){ // bottom
            return "bottom";
        }
        else if(this.location.y + this.scale.height >= sprite.location.y && this.location.y + this.scale.height <= sprite.location.y + margin){ // top
            return "top";
        }
        else if(this.location.x + this.scale.width >= sprite.location.x && this.location.x + this.scale.width <= sprite.location.x + margin){ // left
            return "left";
        }
        else if(this.location.x <= sprite.location.x + sprite.scale.width && this.location.x >= sprite.location.x + sprite.scale.width - margin){ // right
            return "right";
        }else{ // inside
            if(iscol==true){
                return "inside";
            }else{
                return false;
            }
        }
    }
    isCollidingWithDetail(sprite){
        if(this.isColliding(sprite)){
            let colDetail = this.collisionDetail(sprite,true);
            return {
                side:colDetail,
                colliding:true
            }
        } else {
            return false;
        }
    }
    isCoordsOver(x,y){
        let minSelf = this.location;
        let maxSelf = {
            x:this.location.x+this.scale.width,
            y:this.location.y+this.scale.height
        }
        let target = {
            x:x,
            y:y
        }
        if (minSelf.x > target.x || target.x > maxSelf.x) {
            return false;
        }
        if (maxSelf.y > target.y || target.y > minSelf.y) {
            return false;
        }
    }
}
class SoundWave{
    constructor(options={
        type:"sine",
        volume:1
    }){
        this.audioAssigned = false;
        this.audioContext = null;
        this.type = "sine";
        this.volume = 1;
        this.gain = null;
        this.playing = false;
        if('volume' in options){
            this.volume = options.volume;
        }
        if('type' in options){
            this.type = options.type;
        }
        let assignAudioContext = ()=>{
            if (!this.audioAssigned) {
                this.audioContext = new AudioContext();
                this.oscillator = this.audioContext.createOscillator();
                this.oscillator.type = this.type;
                this.oscillator.connect(this.audioContext.destination);
                this.gain = this.audioContext.createGain();
                this.oscillator.connect(this.gain).connect(this.audioContext.destination);
                console.log("sound enabled");
                this.onload();
                this.audioAssigned = true;
                document.removeEventListener("mousedown", assignAudioContext);
                document.removeEventListener("mouseup", assignAudioContext);
                document.removeEventListener("keydown", assignAudioContext);
                document.removeEventListener("keyup", assignAudioContext);
            }
        };
        document.addEventListener("mousedown", assignAudioContext);
        document.addEventListener("mouseup", assignAudioContext);
        document.addEventListener("keydown", assignAudioContext);
        document.addEventListener("keyup", assignAudioContext);
    }
    onload(callback=()=>{}){
        if(this.audioAssigned) return "Audio already loaded!";
        callback();
    }
    play(options={
        time:0.1, 
        stop:true,
        fade:true,
        frequency:440,
        type:"sine",
        delay:0.1
    }){
        if(this.audioAssigned){
            let time = 0.1;
            let delay = 0;
            let type = this.type;
            let frequency = 440;
            if(Object.hasOwn(options, 'time')){
                time = options.time;
            }
            if(Object.hasOwn(delay, 'delay')){
                delay = options.delay;
            }
            delay*=1000;
            if(Object.hasOwn(options, 'type')){
                type = options.type;
            }
            if(Object.hasOwn(options, 'frequency')){
                frequency = options.frequency;
            }
            setTimeout(()=>{
                if(this.playing==true){
                    this.stop();
                }
                this.oscillator = this.audioContext.createOscillator();
                this.oscillator.type = type;
                this.oscillator.frequency.value = frequency;
                this.gain = this.audioContext.createGain();
                this.gain.gain.value
                this.oscillator.connect(this.gain);
                this.gain.connect(this.audioContext.destination);
                this.playing = true;
                this.oscillator.start(0);
                if(Object.hasOwn(options, 'fade')){
                    if(options.fade==true){
                        this.gain.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + time);
                    }
                }else if(Object.hasOwn(options, 'stop')){
                    if(options.stop==true){
                        setTimeout(()=>{
                            if(this.playing==true){
                                this.oscillator.stop();
                                this.playing = false;
                            }
                        }, time);
                    }
                }
            },delay)
        }
    }
    stop(){
        if(this.audioAssigned){
            this.playing = false;
            this.gain.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.1);
            this.oscillator.disconnect(this.gain);
        }
    }
}
class SoundClip{
    constructor(options={
        name:`test${Math.round(Math.random()*1000)}`,
        file:undefined,
        volume:1,
    }){
        this.audioAssigned = false;
        this.audioContext = null;
        this.file = null;
        this.track = null;
        this.volume = 1;
        this.gain = null;
        this.playing = false;
        this.el = document.createElement("audio");
        if('volume' in options){
            this.volume = options.volume;
        }else{
            this.volume = 1;
        }
        if('file' in options){
            this.file = options.file;
            this.el.src = options.file;
        }else{
            this.file = null;
        }
        if('name' in options){
            this.el.id = options.name;
        }else{
            this.el.id = `test${Math.round(Math.random()*1000)}`;
        }
        document.body.lastChild.after(this.el);
        //this.el = document.querySelector(`#${this.el.id}`);
        let assignAudioContext = ()=>{
            if (!this.audioAssigned) {
                this.audioContext = new AudioContext();
                this.track = this.audioContext.createMediaElementSource(this.el);
                this.gain = this.audioContext.createGain();
                this.track.connect(this.gain).connect(this.audioContext.destination);
                console.log("sound enabled");
                this.audioAssigned = true;
                document.removeEventListener("mousedown", assignAudioContext);
                document.removeEventListener("mouseup", assignAudioContext);
                document.removeEventListener("keydown", assignAudioContext);
                document.removeEventListener("keyup", assignAudioContext);
            }
        };
        document.addEventListener("mousedown", assignAudioContext);
        document.addEventListener("mouseup", assignAudioContext);
        document.addEventListener("keydown", assignAudioContext);
        document.addEventListener("keyup", assignAudioContext);
    }
    play(options={
        time:0.1, 
        stop:true,
        fade:true,
        frequency:440,
        type:"sine",
        delay:0.1
    }){
        if(this.audioAssigned){
            this.el.currentTime = 0;
            this.el.play();
            this.playing = true;
        }
    }
    stop(){
        if(this.audioAssigned){
            if(this.playing){
                this.playing = false;
                this.el.stop();
            }
        }
    }
}