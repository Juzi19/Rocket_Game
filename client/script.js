class Object{
    constructor(width, height,color, position_x, position_y, stroke_color, lineWidth){
        this.color = color;
        this.x = position_x;
        this.y = position_y;
        this.stroke_color = stroke_color;
        this.lineWidth = lineWidth;
        this.width = width;
        this.height = height;
    }
    draw(){
        ctx.fillStyle = this.color;

    }
    //method to move the rectangle on a line /degree
    move_by_gradient(degree, lenght){
        //using sinus / cosinus to calculate lenght
        var move_y = Math.sin(degree * Math.PI / 180)* lenght;
        var move_x = Math.cos(degree * Math.PI / 180)* lenght;
        this.x += move_x;
        this.y += move_y;
        this.draw();
    }
        
    move(x,y){
        this.x += x;
        this.y += y;
    }

}
//Class to create rectangle obstacles
class Rectangle extends Object{
    constructor(width, height, color='black', position_x=0, position_y=0, stroke_color = 'orange', lineWidth = 2){
        super(width, height,color, position_x, position_y, stroke_color, lineWidth);
        this.draw();
    }
    //displays the rectangle
    draw(){
        super.draw();
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = this.stroke_color;
        ctx.lineWidth = this.lineWidth;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    //simple collision detection
    touches(object){
        return (
            object.x < this.x + this.width &&
            object.x + object.width > this.x &&
            object.y < this.y + this.height &&
            object.y + object.height > this.y
        );

    }
}

//Triangle Class, same methods as the rectangle
class Triangle extends Object{
    constructor(base, height, color='black', position_x=0, position_y=0, stroke_color = 'orange', lineWidth = 2){
        super(base, height,color, position_x, position_y, stroke_color, lineWidth);
        this.base = base;
        this.height = height;
        this.draw();
    }

    draw(){
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.base / 2, this.y - this.height);
        ctx.lineTo(this.x + this.base, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this.stroke_color;
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
    }

    touches(object){
    //simple collision detection
    return (
            object.x < this.x + this.base &&
            object.x + object.width > this.x &&
            object.y < this.y + this.height &&
            object.y + object.height > this.y
        );
    }
}

//Circle class, same methods as rectangle
class Circle extends Object{
    constructor(radius, color='black', position_x=0, position_y=0, stroke_color = 'orange', lineWidth = 2){
        super(radius, radius,color, position_x, position_y, stroke_color, lineWidth);
        this.radius = radius;
        this.draw();
        
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = this.stroke_color;
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
    }
    touches(object){
        //using euclydean distance to check for touches
        var dx = this.x - object.x;
        var dy = this.y - object.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + this.height;
    }
}

//rocket class
class Rocket{
    constructor(src, width = 25, height = 25, x = 0, y = 0){
        this.width = 25;
        this.height = 25;
        //Rotation angle, set to 45 to align the rocket correctly
        this.angle = 45;
        this.x = x;
        this.y = y;
        this.rocket = new Image();
        this.rocket.src = src;
        this.rocket.onload = () => {
            //draws the rocket image
            ctx.drawImage(this.rocket,this.x,this.y, width,height);
        }
    }
    draw(){
        // save the unrotated context of the canvas  so we can restore it later
        ctx.save();
        //Moves to the center of the rocket
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        //rotates the canvas to the specified degrees
        ctx.rotate(this.angle);
        // since the context is rotated, the image will be rotated as well
        ctx.drawImage(
            this.rocket,
            //positions the image correctly to the new center
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height 
        );
        ctx.restore();
    }
    rotate(degrees){
        this.angle = ((45+degrees) * Math.PI) / 180; // Convert degrees to radians
    }
    //method to move the rectangle on a line /degree
    move_by_gradient(degree, lenght){
        //using sinus / cosinus to calculate lenght
        var move_y = Math.sin(degree * Math.PI / 180)* lenght;
        var move_x = Math.cos(degree * Math.PI / 180)* lenght;
        this.x += move_x;
        this.y += move_y;
    }
    rotate_and_move(rotation, lenght){
        rocket.rotate(rotation);
        rocket.move_by_gradient(rotation,lenght);
    }
    check_position_in_canvas(){
        if(this.x < 0 || this.y < 0 || this.x > canvas.width || this.y > canvas.height){
            return false;
        }
        return true;
    }
}
//Coin Class, Coins are static object (don't move), that can be picked up
class Coin{
    constructor(src,radius = 20, x=0,y= 0, reward = 1) {
        this.radius = radius
        this.x = x;
        this.y = y;
        //reward, when coin is collected
        this.reward = reward;
        this.coin = new Image();
        this.coin.src = src;
        this.coin.onload = () => {
            //draws the rocket image
            ctx.drawImage(this.coin,this.x,this.y,this.radius,this.radius);
        }
    }
    draw(){
        ctx.drawImage(this.coin, this.x, this.y, this.radius, this.radius);
        rocket.rotate(0)
    }
    touches(object){
        //using euclydean distance to check for touches
        var dx = this.x - object.x;
        var dy = this.y - object.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        //if coin is touched
        if(distance < this.radius){ 
            //saves the coin's collection
            rewards += 1;
            //makes object unattainable
            this.radius = 0;
            return true;
        }
        return false;
    }
}


const canvas = document.getElementById('game_display');

const progressbar = document.getElementById('progressbar');
const leveltext = document.getElementById('level');
const cointext = document.getElementById('coins');


let boxsize = 0;

if(window.innerWidth < window.innerHeight){
    boxsize = window.innerWidth
}
else{
    boxsize = window.innerHeight;
}

canvas.width = boxsize * 0.9;  
canvas.height = boxsize * 0.9;  

const ctx = canvas.getContext("2d");
ctx.fillStyle = 'black';
ctx.fillRect(0,0, canvas.width, canvas.height);
ctx.strokeStyle = 'black';

//Rewards of coins collected
var rewards = 0;

//Creates a rocket
const rocket = new Rocket('./rocket.png', 25, 25, 250,250);
const r1 = new Rectangle(20,20);
const t1 = new Triangle(20,20, 'black', 50,50);
const c1 = new Circle(10,'black', 30,30);
const coin = new Coin('./coin.png', 20, 200,200,1);

const leaderboard = document.getElementById('addtoleaderboard');
const leaderboard_coins = document.getElementById('formcoins');

//Obstacles list, used to manage the obstacles
//List lenght depending of level, that is played
var obstacles = Array.of();

//list to save coins
var coins = Array.of();

//level
var mylevel = 1;


function level(c){
    switch (c){
        case 0:
            return 1;
        case 10:
            return 2;
        case 20:
            return 3;
        case 30:
            return 4;
        case 50:
            return 5;
    }
}


function levelchecker(){
    if(level(rewards)){
        mylevel = level(rewards);
        console.log("Level", mylevel);
        leveltext.innerHTML = `Level: ${mylevel}`;
        coins = Array.of();
        obstacles = Array.of();
        create_coins(10);
        create_obstacles(mylevel*10);
    }
    //Infinite spawn of coins, etc...
    else if(rewards % 10 == 0 && rewards!=0){
        mylevel = 6;
        leveltext.innerHTML = `Level: 6`;
        coins = Array.of();
        obstacles = Array.of();
        create_coins(10);
        create_obstacles(mylevel*10);
    }
}


function create_coins(amount){
    for (i=0; i < amount; i++){
        pos_x = Math.floor(Math.random()* canvas.width);
        pos_y = Math.floor(Math.random()* canvas.height);
        while (pos_x < 10 || (canvas.width - pos_x < 10)||pos_y < 10 || (canvas.height - pos_y < 10)){
            pos_x = Math.floor(Math.random()* canvas.width);
            pos_y = Math.floor(Math.random()* canvas.height);   
        }
        //checks for distance to the rocket by initialization
        while(Math.sqrt((pos_x-rocket.x)**2 + (pos_y-rocket.y)**2) <= rocket.height + 20){
            pos_x = Math.floor(Math.random()* canvas.width);
            pos_y = Math.floor(Math.random()* canvas.height);
        }
        coins.push(new Coin('./coin.png',20,pos_x, pos_y,1));
    }
}

function create_obstacles(amount){
    for (i=0; i < amount; i++){
        pos_x = Math.floor(Math.random()* canvas.width);
        pos_y = Math.floor(Math.random()* canvas.height);
        //checks for distance to the rocket by initialization
        while(Math.sqrt((pos_x-rocket.x)**2 + (pos_y-rocket.y)**2) <= rocket.height + 30){
            pos_x = Math.floor(Math.random()* canvas.width);
            pos_y = Math.floor(Math.random()* canvas.height);
        }
        gradient = Math.floor(Math.random()* 360);
        //checks the gradient for solid values
        while ((gradient > 85 && gradient < 95)||(gradient<5)||gradient>355||(gradient > 175 && gradient < 185) || (gradient>265 && gradient < 275)){
            gradient = Math.floor(Math.random()* 360);
        }
        //decides whether the obstacles is Rectangle, Circle or Triangle
        decision = Math.floor(Math.random() * 3)
        switch(decision){
            case 0:
                obstacles.push([new Rectangle(20,20, 'black', pos_x,pos_y), gradient]);
                break;
            case 1:
                obstacles.push([new Circle(10, 'black', pos_x, pos_y), gradient]);
                break;
            case 2:
                obstacles.push([new Triangle(20,20, 'black', pos_x, pos_y), gradient]);
                break;
            case 3:
                obstacles.push([new Rectangle(20,20, 'black', pos_x,pos_y), gradient])
        }
    }
}

function check_border_collision(){
    for (let obstacle of obstacles){
        let obj = obstacle[0];
        let degree = obstacle[1] % 360;
        //Collision border
        if(obj.x + obj.width >= canvas.width || obj.x <= 0 ){
            degree = 180 - degree;
        }
        //Collision top / bottom
        else if(obj.y <= 0 || obj.y + obj.height >= canvas.height){
            degree = degree * -1;
        }
        obstacle[1] = degree;
    }
}
function check_coins(){
    for(let coin of coins){
        //coin.touches already updates rewards
        if (coin.touches(rocket)){
            //update DOM
            cointext.innerHTML = `Münzen: ${rewards}`
            levelchecker();
            console.log('Coin eingesammelt');
        }
    }
}

function check_obstacles_rocket(){
    for(let obstacle of obstacles){
        if (obstacle[0].touches(rocket)){
            //update DOM
            alive = false;
            console.log('Verloren');
        }
    }
    if (!rocket.check_position_in_canvas()){
        alive=false;
        console.log('Verloren');
    }
}

function lost(){
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    //display text
    ctx.fillText(`Verloren in Level ${mylevel}. Münzen: ${rewards}`, canvas.width/2, canvas.height/2);

    leaderboard.style.zIndex = 10;
    leaderboard.style.visibility = 'visible';
    leaderboard_coins.innerHTML = `Münzen gesammelt: ${rewards}`

    coin_input.value = rewards;

    window.removeEventListener('keydown', keydown_func)
}


create_coins(10);
create_obstacles(10);


let rocketrotation = 0;
let rocketspeed = 2.5;
let obstaclespeed = 1;
let alive = true;
let energy = 0;

function load_energy(){
    if(energy < 100){
        energy += 0.1;
    }
    progressbar.value = energy/100
}

const keydown_func = (e)=>{
    switch(e.key){
        case 'w':
            rocket.rotate_and_move(270, rocketspeed);
            rocketrotation = 270;
            load_energy();
            break;
        case 's':
            rocket.rotate_and_move(90, rocketspeed);
            rocketrotation = 90;
            load_energy();
            break;
        case 'd':
            rocket.rotate_and_move(0,rocketspeed);
            rocketrotation = 0;
            load_energy();
            break;
        case 'a':
            rocket.rotate_and_move(180,rocketspeed);
            rocketrotation = 180;
            load_energy();
            break;
        case ' ':
            if (energy > 1){
                energy -= 1;
                progressbar.value = energy/100
                rocket.rotate_and_move(rocketrotation, rocketspeed * 4);
            }
            break;
            
    }
}

//add event for keyboard input
window.addEventListener('keydown', keydown_func)

//csrf Token
async function setCsrfToken() {
    const csrf = await getCsrfToken();
    const csrf_input = document.getElementById('csrf');
    csrf_input.value = csrf;
    console.log("Inputwert gesetzt auf", csrf);
}

async function getCsrfToken() {
    const response = await fetch('/csrf-token');
    const data = await response.json();
    if (data.csrfToken) {
        return data.csrfToken;
    }
    return null;
}

setCsrfToken();

const coin_input = document.getElementById('coin_input');

function animate(){
    ctx.fillRect(0,0, canvas.width, canvas.height);
    coins.forEach(coin => coin.draw());
    check_border_collision();
    rocket.rotate(rocketrotation);
    rocket.draw();
    obstacles.forEach(obstacle => obstacle[0].move_by_gradient(obstacle[1], obstaclespeed));
    check_coins();
    check_obstacles_rocket();
    if (!alive){
        lost();
    }


    requestAnimationFrame(animate);
}

requestAnimationFrame(animate)




