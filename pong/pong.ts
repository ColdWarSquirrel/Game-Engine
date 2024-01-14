"use strict";

import * as Engine from '../index';
import * as Cake from '../GameEngineInterfaces';

let minScreenSize = Math.min(Engine.viewport.width,Engine.viewport.height);
let maxScreenSize = Math.max(Engine.viewport.width,Engine.viewport.height);
let screenSize = {
    x:0,
    y:0
}
if(minScreenSize==Engine.viewport.width){
    screenSize.x = Engine.viewport.width;
    screenSize.y = (Engine.viewport.width+Engine.viewport.height/2);
}else if(minScreenSize==Engine.viewport.height){
    screenSize.x = (Engine.viewport.width+Engine.viewport.height/2);
    screenSize.y = Engine.viewport.height;
}
screenSize = {
    x:(screenSize.x>700 ? 700 : screenSize.x),
    y:(screenSize.y>700 ? 700 : screenSize.y)
}
Engine.gameScreen.resize(screenSize.x,screenSize.y);
// @ts-ignore
const game = new Game("Pong", ()=>{
    console.log("game started");
});
let paddleSize = {
    width:25,
    height:200
}
let soundsOn = false;
// @ts-ignore
const player = game.addSprite(new Engine.Sprite({
    info:{
        name:"player",
        type:"box",
        colour:{
            stroke:"green",
            fill:"blue"
        },
        speed:{
            x:300,
            y:Engine.gameScreen.height
        }
    },
    location:{
        x:20,
        y:(Engine.gameScreen.height*0.5)-100
    },
    scale:{
        width:paddleSize.width,
        height:paddleSize.height
    }
}, [
    {
        name:"isMoving",
        value:false,
        direction:0,
        lastPos:0,
        up:false,
        down:false
    }
]));

const enemy = game.addSprite(new Engine.Sprite({
    info:{
        name:"enemy",
        type:"box",
        colour:{
            stroke:"green",
            fill:"red"
        },
        speed:{
            x:200,
            y:200
        }
    },
    location:{
        x:Engine.gameScreen.width-paddleSize.width-20,
        y:(Engine.gameScreen.height*0.5)-(paddleSize.height/2)
    },
    scale:{
        width:paddleSize.width,
        height:paddleSize.height
    }
}));
const ball = game.addSprite(new Engine.Sprite({
    info:{
        name:"ball",
        type:"ball",
        colour:{
            stroke:"red",
            fill:"red"
        },
        speed:{
            x:Engine.gameScreen.width/5 < 150 ? 150 : Engine.gameScreen.width/5,
            y:150
        }
    },
    location:{
        x:Engine.gameScreen.width/2,
        y:Engine.gameScreen.height/2
    },
    scale:{
        radius:15
    }
}, [
    {
        name:"maxSpeed",
        value:700
    }
]));
const invisBall = game.addSprite(new Engine.Sprite({
    info:{
        name:"invis ball",
        type:"ball",
        hidden:true,
        opacity:0.5,
        speed:{
            x:ball.speed.x+200,
            y:200
        }
    },
    location:{
        x:Engine.gameScreen.width/2,
        y:Engine.gameScreen.height/2
    },
    scale:{
        radius:15
    }
}, [
    {
        name:"canMove",
        value:true,
        finished:false
    }
]));
const mutedIcon = game.addSprite(new Engine.Sprite({
    info:{
        name:"muted icon",
        type:"image",
        skins:[{name:"muted",url:"sprites/muted.png"}],
        hidden:true
    },
    location:{
        x:10,
        y:10
    },
    scale:{
        width:35,
        height:35
    }
}));
const speakerIcon = game.addSprite(new Engine.Sprite({
    info:{
        name:"speaker icon",
        type:"image",
        skins:[{name:"muted",url:"sprites/speaker.png"}],
    },
    location:{
        x:10,
        y:10
    },
    scale:{
        width:35,
        height:35
    }
}));
const pauseIcon = game.addSprite(new Engine.Sprite({
    info:{
        name:"pause icon",
        type:"image",
        skins:[{name:"muted",url:"sprites/paused.png"}],
        hidden:true,
        opacity:0.5
    },
    location:{
        x:(Engine.gameScreen.width/2)-((Engine.gameScreen.width*0.75)/2),
        y:(Engine.gameScreen.height/2)-((Engine.gameScreen.height*0.75)/2)
    },
    scale:{
        width:Engine.gameScreen.width*0.75,
        height:Engine.gameScreen.height*0.75
    }
}));
/*
const sounds = {
    bounce:new SoundWave({
        name:"bounce",
        type:"sine",
        volume:0
    })
}
let soundClips = {
    bounce:new SoundClip({
        name:"bounce clip",
        file:"audio/bounce.WAV"
    })
}



if (navigator.getAutoplayPolicy(sounds.bounce.audioContext.destination) === "allowed") {
    mutedIcon.hidden = true;
    speakerIcon.hidden = false;
} else if (navigator.getAutoplayPolicy(sounds.bounce.audioContext.destination) === "allowed-muted") {
    mutedIcon.hidden = false;
    speakerIcon.hidden = true;
} else if (navigator.getAutoplayPolicy(sounds.bounce.audioContext.destination) === "disallowed") {
    mutedIcon.hidden = false;
    speakerIcon.hidden = true;
}
*/
let rand = Math.random();
ball.velocity = {
    x:rand>=0.5 ? -1 : 1,
    y:rand>=0.5 ? -1 : 1
}
let colSwitch = false;
game.loadSettings();
let score = game.getSetting("Score");
let muted = game.getSetting("Muted");
let mode = game.getSetting("Mode");
let maxBallSpeed = ball.customProperties[0];
if(typeof score !== 'object'){
    score = game.addSetting("Score",{
        wins:0,
        losses:0,
        highScore:0
    })
}
if(typeof mode !== 'object'){
    mode = game.addSetting("Mode",{
        players:1,
        side:"left"
    })
}
mode.players = 1;
score.wins = 0;
score.losses = 0;
function setScore(){
    document.querySelector("#score")!.textContent = score.wins;
    document.querySelector("#highScore")!.textContent = score.highScore;
    document.querySelector("#losses")!.textContent = score.losses;
    let wlratio = 1*(score.wins/score.losses);
    if(wlratio==Infinity){
        wlratio = 1;
    }if(isNaN(wlratio)){
        wlratio = 0;
    }
    wlratio = Math.round(wlratio*100)/100;
    document.querySelector("#wlratio")!.textContent = wlratio.toString();
}
setScore();
if(typeof muted !== 'object'){
    muted = game.addSetting("Muted",{
        is:false
    })
}
muted.is = false;
let isPlayerMoving = player.getProperty("isMoving");

/*
sounds.bounce.onload(()=>{
    mutedIcon.hidden = true;
    speakerIcon.hidden = false;
})
*/
let totalFrames = 1;
game.mainLoopFunctions.push(function(){
    let isColliding;
    let colWith = "";
    let delta = game.timeData.delta;
    let rand = Math.random();
    ball.location.x += (ball.speed.x*(ball.velocity.x*delta));
    ball.location.y += (ball.speed.y*(ball.velocity.y*delta));
    let defaultPlayerColour = "black";
    if(mode.players==1){
        isPlayerMoving.lastPos = player.location.y;
        if(game.keysDown.KeyW==true){
            if(player.location.y > 0){
                player.location.y += (-player.speed.y * delta);
                Engine.gameScreen.mousePos.y = (player.location.y+(<number>player.scale.height/2));
            }
        }
        if(game.keysDown.KeyW==true){
            if((player.location.y+<number>player.scale.height) < Engine.gameScreen.height){
                player.location.y += (player.speed.y * delta);
                Engine.gameScreen.mousePos.y = (player.location.y+(<number>player.scale.height/2));
            }
        }
        else{
            if(!(Engine.gameScreen.mousePos.y+(<number>player.scale.height/2) > Engine.gameScreen.height || Engine.gameScreen.mousePos.y-(<number>player.scale.height/2) < 0)){
                player.location.y = (Engine.gameScreen.mousePos.y-(<number>player.scale.height/2));
            }else{
                if(Engine.gameScreen.mousePos.y+(<number>player.scale.height/2) > Engine.gameScreen.height){
                    player.location.y = Engine.gameScreen.height-(<number>player.scale.height);
                }else if(Engine.gameScreen.mousePos.y-(<number>player.scale.height/2) < 0){
                    player.location.y = 0;
                }
            }
        }
    }else if(mode.players==0){
        player.speed.y = player.speed.base.y+((ball.speed.x+ball.speed.y)*0.5)*0.1;
        if(ball.location.x<Engine.gameScreen.width*0.666){
            let adjustedPlayerLocation = {
                x:player.location.x+(<number>player.scale.width/2),
                y:player.location.y+(<number>player.scale.height/2)
            }
            if(Math.floor(adjustedPlayerLocation.y) > (Math.floor(ball.location.y))){
                player.location.y += (-player.speed.y * delta);
            }else if(Math.floor(adjustedPlayerLocation.y) < (Math.floor(ball.location.y))){
                player.location.y += (player.speed.y * delta);
            }
        }
    }
    else if(mode.player==2){

    }
    if(mode.players<2){
        enemy.speed.y = enemy.speed.base.y+((ball.speed.x+ball.speed.y)*0.5)*0.1;
        if(ball.location.x>Engine.gameScreen.width/3){
            let adjustedEnemyLocation = {
                x:enemy.location.x+(<number>enemy.scale.width/2),
                y:enemy.location.y+(<number>enemy.scale.height/2)
            }
            if(Math.floor(adjustedEnemyLocation.y) > (Math.floor(ball.location.y))){
                if(enemy.location.y > 0){
                    enemy.location.y += (-enemy.speed.y * delta);
                }
            }else if(Math.floor(adjustedEnemyLocation.y) < (Math.floor(ball.location.y))){
                if((enemy.location.y+<number>enemy.scale.height) < Engine.gameScreen.height){
                    enemy.location.y += (enemy.speed.y * delta);
                }
            }
        }
    }
    isPlayerMoving.value = (player.location.y!==isPlayerMoving.lastPos) ? true : false;
    if((ball.location.x+ball.scale.radius)>=Engine.gameScreen.width/2){
        isColliding = ball.isColliding(enemy);
        colWith = "enemy";
    }else{
        isColliding = ball.isColliding(player);
        colWith = "player";
    }
    if(ball.location.x<=0+(ball.scale.radius) || ball.location.x >= Engine.gameScreen.width - (ball.scale.radius)){ // wins or loses
        if(ball.location.x >= Engine.gameScreen.width - (ball.scale.radius)){
            if(!muted.is){
                /*
                sounds.bounce.play({
                    time:0.75,
                    type:"triangle",
                    fade:true,
                    frequency:550
                });
                */
            }
            score.wins+=1;
            if(score.wins>score.highScore){
                score.highScore = score.wins;
            }
            game.saveSettings();
            setScore();
        }
        if(ball.location.x<=0+(ball.scale.radius)){
            if(!muted.is){
                /*sounds.bounce.play({
                    time:0.75,
                    type:"triangle",
                    fade:true,
                    frequency:220
                });*/
            }
            score.losses+=1;
            game.saveSettings();
            setScore();
        }
        ball.location = {
            x:Engine.gameScreen.width/2,
            y:Engine.gameScreen.height/2,
            z:0
        }
        ball.velocity = {
            x:rand>=0.5 ? -1 : 1,
            y:rand>=0.5 ? -1 : 1
        }
        ball.speed.y = ball.speed.base.y + (rand * 50);
        enemy.location.y = (Engine.gameScreen.height/2)-(<number>enemy.scale.height/2);
        if(mode.players<1){
            player.location.y = (Engine.gameScreen.height/2)-(<number>player.scale.height/2);
        }
    }else{
        if (isColliding) {
            if(colSwitch==false){
                colSwitch = true;
                rand = Math.random();
                if(colWith=="enemy"){
                    ball.speed.x = ball.speed.x + 25*delta > maxBallSpeed.value ? maxBallSpeed.value : ball.speed.x + 15;
                    if(!muted.is){
                        /*
                        sounds.bounce.play({
                            time:0.2,
                            fade:true,
                            frequency:400 + rand*40
                        });
                        */
                    }
                    ball.velocity.x = -1;
                    ball.speed.y = ball.speed.base.y + (rand * 50);
                }else{
                    ball.speed.x = ball.speed.x + 25*delta > maxBallSpeed.value ? maxBallSpeed.value : ball.speed.x + 15;
                    if(!muted.is){
                        /*
                        sounds.bounce.play({
                            time:0.2,
                            fade:true,
                            frequency:600 + rand*40
                        });
                        */
                    }
                    ball.velocity.x = 1;
                    if(mode.players>0){
                        if(isPlayerMoving.lastPos > player.location.y){
                            ball.velocity.y = -1;
                        }else if(isPlayerMoving.lastPos < player.location.y){
                            ball.velocity.y = 1;
                        }
                    }
                    ball.speed.y = isPlayerMoving.value == true ? ball.speed.y + (ball.speed.base.y*0.5) : ball.speed.y;
                }
            }
        }else{
            colSwitch = false;
        }
        if(ball.location.y <= 0+(ball.scale.radius) || ball.location.y >= Engine.gameScreen.height - (ball.scale.radius)){
            if(colSwitch==false){
                if(!muted.is){
                    /*
                    sounds.bounce.play({
                        time:0.2,
                        fade:true,
                        frequency:500 + rand*40
                    });
                    */
                }
                colSwitch = true;
                ball.velocity.y = ball.location.y >= Engine.gameScreen.height - (ball.scale.radius) ? -1 : 1;
            }
        }else{
            colSwitch = false;
        }
    }
    totalFrames+=1;
})
document.addEventListener("keyup", function(e){
    if(e.code == "Escape"){
        if(game.running){
            pauseIcon.hidden = false;
            pauseIcon.draw();
            Engine.gameScreen.documentObject.style.cursor = "default";
        }else{
            pauseIcon.hidden = true;
            pauseIcon.draw();
            Engine.gameScreen.documentObject.style.cursor = "none";
        }
    }
    if(e.code=="KeyM"){
        muted.is = muted.is ? false : true;
        mutedIcon.hidden = !muted.is;
        speakerIcon.hidden = muted.is;
    }
})
game.play();