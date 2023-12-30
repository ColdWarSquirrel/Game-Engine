# Game Engine
## You!
### you there!
#### do you like games?
I sure know I do. and I like making games. I just don't like learning a whole bunch of someone else's work to get a game made, so I made this.

so far using this I have made [pong](https://thesomething.uk/engine/pong/pong) and a (very basic) [platformer type thing](https://thesomething.uk/engine/platformer/)
god knows how long I'm going to keep these going

## Basic Rules
- so after some tinkering I decided (probably rather stupidly) that there should just be a global `GameScreen` variable that the developer can resize, named (usefully) `gameScreen`. if you want to resize it, you have to use the function `.resize()` on the `gameScreen` variable.
- there's a `mainLoopFunctions` property attatched to the `Game` class, where you can add functions to run every frame.