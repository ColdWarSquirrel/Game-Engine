You!
====

you there!
----------

### do you like games?

I sure know I do. and I like making games. I just don't like learning a whole bunch of someone else's work to get a game made, so I made this.

it's pretty simple, take a look at the source code [here](https://github.com/MattiasWebb/Game-Engine) (if you fancy)

**if you find any bugs, please report [here](https://github.com/MattiasWebb/Game-Engine/issues)**

so far using this I have made [pong](pong/) and a (very basic) [platformer type thing](platformer/)  
god knows how long I'm going to keep these going


[Docs](#docs)
=============

* * *

[Game Screen (`gameScreen: GameScreen`)](#game-screen)
--------------------------------------

so after some tinkering I decided (probably rather stupidly) that there should just be a global `GameScreen` variable that the developer can resize, named (usefully) `gameScreen`.  
  
`.documentObject: HTMLCanvasElement|any`: canvas element, either created or supplied in arguments  
`.background: string`: background colour  
`.ctx: CanvasRenderingContext2D`: yeah  
`.mousePos: { x: number, y: number }(shorthand <Vector2D>)`: position of mouse inside the canvas  
`.width: number`: width of the game screen  
`.height: number`: height of the game screen  
`.naturalWidth: number`: initial width of the game screen  
`.naturalHeight: number`: initial height of the game screen  
`fullscreen: boolean`: if the game screen fills the innerWidth and innerHeight of the screen, not if the screen is actually in "fullscreen"  
  
default size: 700x700 pixels  

### [Functions](#game-screen-functions)

### `.clear(): void`

clears the canvas by filling it with the background colour property of the gameScreen variable  
`return`: `void`

### `.resize(width?: number, height?: number, clearAll?: boolean=false): void`

`width?: number`: new width of gameScreen variable and canvas  
`height?: number`: new height of gameScreen variable and canvas  
`clearAll?: boolean`: whether or not to clear the contents of the canvas after resize  
`return`: `void`

### `.isFullscreen(): boolean`

returns the `.isFullscreen` property  
`return`: `boolean`

### `.resetSize(): void`

resets the width and height of the variable and canvas to the naturalWidth of the variable  
`return`: `void`

### `.matchScreenSize(): viewport: { width: number, height: number }`

makes the width and height of the variable and canvas the same size as the viewport  
`return`: `viewport: { width: number, height: number }`

### `.toggleFullscreen(): boolean`

makes the width and height of the variable and canvas the same size as the viewport  
`return`: `viewport: { width: number, height: number }`

* * *

[Game (`<Game>`)](#game)
---------------


a global `Game` class, only to be used once to intialise a game instance  
  
`.name: string`: the name of the game is the name of the game, babyyyy  
`.entities: Sprite[]`: global list of entities to be drawn every frame, or generally handled by the game class  
`.mainLoopFunctions: {(): any}[]`: list of functions to be executed every frame, in the order you add them  
`.settings: {name: string,[key: string]: any}[]`: list of settings with keys and values that can be stored and loaded via localStorage  
`.autopause: boolean`: if the game is to automatically pause when the game loses focus or the window is hidden  
`.running: boolean`: if the game is running, i.e. not paused  
`.timeData: { lastTime: number|undefined; delta: number; totalFrames: number; fpsArray: number[] }`: collection of data about time stuff  
`timeData.lastTime`: the time in milliseconds since the game started  
`timeData.delta`: the time in seconds since the last frame  
`timeData.totalFrames`: amount of frames since the game began>  
`timeData.fpsArray`: an array of the fps of every frame, reset every 10 seconds (for diagostics/debugging) `.keysDown: object|any`: an object with keys corresponding to the text code of a KeyboardEvent  
`.camera: Camera`: a global game camera object  
`.vsync: boolean`: whether to use vsync or not, if true, calls requestAnimationFrame, else it calls setInterval  
`.fps: number`: if vsync is set to false, then this value will be the target fps: `1/this.fps`  
  

### [Functions](#game-functions)


### `.mainGameLoop(): void`

updates the delta, redraws entities, and if `.running` is true, then runs all the game loops  
`return`: `void`

### `.calculateAverageFps(): number`

takes the `.timeData.fpsArray: number[]` array, and calculates the average from each value  
`return`: `number`

### `.clearFpsArray(): void`

clears the `.timeData.fpsArray: number[]` array  
`return`: `void`

### `.addSprite(sprite: [Sprite](#sprite)): [Sprite](#sprite)`

adds a sprite to the `.entities[]` list and returns it  
`return`: `[Sprite](#sprite)`

### `.addSprites(...sprites: [Sprite](#sprite)[]): [Sprite](#sprite)[]`

adds an array of sprites to the `.entities[]` list and returns all the new sprites  
`return`: `[Sprite](#sprite)[]`

### `.removeSprite(sprite: [Sprite](#sprite)|number|string): [Sprite](#sprite)|undefined`

takes in a sprite index, a sprite name, or a sprite object as a parameter and removes and returns it from the game entities list. if the entity does not exist, then it will return undefined.  
`return`: `[Sprite](#sprite)|undefined`

### `.removeSprites(...sprites: ([Sprite](#sprite)|number|string)[]): ([Sprite](#sprite)|undefined)[]`

takes in an array of sprite indexes, names, or sprite objects as a parameter and removes and returns them from the game entities list. if the entities do not exist, then it will return undefined.  
`return`: `([Sprite](#sprite)|undefined)[]`

### `.refreshSprite(sprite: [Sprite](#sprite)): [Sprite](#sprite)`

returns a new exact copy of the sprite given in the parameters  
`return`: `[Sprite](#sprite)`

### `.refreshAllSprites(): void`

loops through the `.entities[]` array and replaces each with a copy of itself and then draws them  
`return`: `void`

### `.play(): true`

sets `.running` to `true`  
`return`: `true`

### `.stop(): false`

sets `.running` to `false`  
`return`: `false`

### `.resortByZIndex(): [Sprite](#sprite)[]`

reorders the entity list based on Z index, so that entities farther back are drawn last  
`return`: `[Sprite](#sprite)[]`

### `.addSetting(name:string, values:any|object={ exampleKey:"example" }): object`

creates a new setting with a name and any other amount of options and saves it to localStorage as JSON  
`return`: `object`

### `.loadSettings(): object[]`

loads settings from localStorage, sets `.settings[]` to the results, and returns `.settings[]`  
`return`: `object[]`