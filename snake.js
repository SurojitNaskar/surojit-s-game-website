const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake, food, dx, dy, score;
let highScore = localStorage.getItem("snakeHigh") || 0;

let baseSpeed = 8;
let speedMultiplier = 1;
let gameState = "start";
let lastTime = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, duration){
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
}

function init(){
    snake = [{x:10,y:10}];
    dx = 1; dy = 0;
    score = 0;
    speedMultiplier = 1;
    food = randomFood();
}

function randomFood(){
    return {
        x: Math.floor(Math.random()*tileCount),
        y: Math.floor(Math.random()*tileCount)
    };
}

document.addEventListener("keydown", e=>{
    if(gameState==="start"){ gameState="playing"; return; }
    if(gameState==="gameover"){ init(); gameState="playing"; return; }

    if(e.key==="ArrowUp"&&dy===0){dx=0;dy=-1;}
    if(e.key==="ArrowDown"&&dy===0){dx=0;dy=1;}
    if(e.key==="ArrowLeft"&&dx===0){dx=-1;dy=0;}
    if(e.key==="ArrowRight"&&dx===0){dx=1;dy=0;}
});

function update(){
    if(gameState!=="playing") return;

    const head={x:snake[0].x+dx,y:snake[0].y+dy};

    if(head.x<0||head.x>=tileCount||head.y<0||head.y>=tileCount||
       snake.some(s=>s.x===head.x&&s.y===head.y)){
        gameState="gameover";
        playSound(120,0.5);

        if(score > highScore){
            highScore = score;
            localStorage.setItem("snakeHigh", highScore);
        }
        return;
    }

    snake.unshift(head);

    if(head.x===food.x&&head.y===food.y){
        score++;
        speedMultiplier*=1.05;
        playSound(700,0.1);
        food=randomFood();
    }else{
        snake.pop();
    }
}

function draw(){
    ctx.fillStyle="#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#22d3ee";
    snake.forEach(s=>{
        ctx.fillRect(s.x*gridSize,s.y*gridSize,gridSize-2,gridSize-2);
    });

    ctx.fillStyle="#ef4444";
    ctx.fillRect(food.x*gridSize,food.y*gridSize,gridSize-2,gridSize-2);

    ctx.fillStyle="white";
    ctx.fillText("Score: "+score,10,20);
    ctx.fillText("High: "+highScore,10,40);

    if(gameState==="start")
        ctx.fillText("Press Any Key To Start",90,200);

    if(gameState==="gameover")
        ctx.fillText("Game Over - Press Key",90,200);
}

function gameLoop(timestamp){
    if(timestamp-lastTime>1000/(baseSpeed*speedMultiplier)){
        update();
        lastTime=timestamp;
    }
    draw();
    requestAnimationFrame(gameLoop);
}

init();
requestAnimationFrame(gameLoop);