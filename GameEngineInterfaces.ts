import {Sprite, Anim, Skin, Camera, TextObject} from './index';
export interface Vector2D{
    x:number,
    y:number
};
export interface GameScreenOptions{
    width?:number, 
    height?:number, 
    canvas?:HTMLCanvasElement|string,
    backgroundColour?:string,
    fullscreen?:boolean
}
export interface skinsInput{
    name:string,
    url:string,
    sprite?:HTMLImageElement,
    scale?:{
        width:number,
        height:number,
        naturalWidth?:number,
        naturalHeight?:number
    }
}
export interface spriteParameters{
    info:{
        name:string,
        skins?:skinsInput[],
        anims?:Anim[],
        text?:{
            font?:string,
            size?:number,
            content?:string,
            style?:string
        }
        type:string,
        fillMode?:string,
        colour?:{
            fill:string,
            stroke:string
        },
        speed?:{
            x:number,
            y:number,
            base?:{
                x:number,
                y:number
            }
        },
        opacity?:number,
        hidden?:boolean,
        tags?:Array<string>
    }, 
    location:{
        x:number,
        y:number,
        z?:number,
        static?:boolean
    }, 
    scale:{
        width?:number|string,
        height?:number|string,
        radius?:number
    }
}
export interface collisionRect{
    x: number,
    y: number,
    w: number,
    h: number
}
export interface scale{
    width:number,
    height:number
}
export interface skinParameters{
    name:string,
    url:string,
    scale?:{
        width:number|string,
        height:number|string
    }
}
export interface textParameters{
    parent:Sprite;
    name?:string,
    content?:string,
    font?:string,
    colour?:{
        stroke:string,
        fill:string
    },
    size?:number,
    location?:Vector2D
}
export interface animParams{
    parent:Sprite,
    fps?:number,
    frames:skinsInput[],
    scale?:scale,
    loop?:boolean,
    onend?:Function
}
export interface soundClipParameters{
    name:string,
    file:string,
    volume?:number
}
export interface cameraParameters{
    scale?:{
        width:number|string,
        height:number|string,
    },
    location?:Vector2D,
    name?:string,
    entities?:Sprite[]|any[]
}