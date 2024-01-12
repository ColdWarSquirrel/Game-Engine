"use strict";
let penis = 1;
const target = 10000;
let output = "";
let three = 0;
let five = 0;
while (penis <= target) {
    if(penis % 3 == 0 || penis % 5 == 0){
        output+=`${penis}: `
        if(penis % 3 == 0){
            ++three;
            output += `Hello`;
        }
        if(penis % 5 == 0){
            ++five;
            output += `World`;
        }
        output+= " \n";
    }
    ++penis;
}
console.log(output);
console.log(`${target}/3 = ${three}\n${target}/5 = ${five}`);