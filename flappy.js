const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let bird, pipes, score;
let highScore = localStorage.getItem("flappyHigh") || 0;

let gravity = 0.5;
let lift = -8;
let pipeGap = 140;
let pipeWidth = 60;
let pipeSpeed = 2;
let speedMultiplier = 1;
let gameState = "start";

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
    bird = { x:80, y:canvas.height/2, velocity:0, size:20 };
    pipes = [];
    score = 0;
    speedMultiplier = 1;
}

function spawnPipe(){
    let topHeight = Math.random()*(canvas.height-pipeGap-100)+50;
    pipes.push({ x:canvas.width, top:topHeight, passed:false });
}

document.addEventListener("keydown", e=>{
    if(gameState==="start"){ gameState="playing"; return; }
    if(gameState==="gameover"){ init(); gameState="playing"; return; }
    if(e.code==="Space"&&gameState==="playing"){
        bird.velocity = lift;
        playSound(500,0.1);
    }
});

canvas.addEventListener("touchstart", ()=>{
    if(gameState==="playing"){
        bird.velocity = lift;
        playSound(500,0.1);
    }
});

function update(){
    if(gameState!=="playing") return;

    bird.velocity += gravity;
    bird.y += bird.velocity;

    if(bird.y+bird.size>canvas.height || bird.y<0){
        gameState="gameover";
        playSound(120,0.5);

        if(score > highScore){
            highScore = score;
            localStorage.setItem("flappyHigh", highScore);
        }
    }

    if(pipes.length===0 || pipes[pipes.length-1].x<canvas.width-250){
        spawnPipe();
    }

    pipes.forEach(pipe=>{
        pipe.x -= pipeSpeed*speedMultiplier;

        if(bird.x<pipe.x+pipeWidth &&
           bird.x+bird.size>pipe.x &&
           (bird.y<pipe.top || bird.y+bird.size>pipe.top+pipeGap)){
            gameState="gameover";
        }

        if(!pipe.passed && pipe.x+pipeWidth<bird.x){
            pipe.passed=true;
            score++;
            speedMultiplier*=1.01;
            playSound(800,0.1);
        }
    });

    pipes = pipes.filter(p=>p.x+pipeWidth>0);
}

function draw(){
    ctx.fillStyle="#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#22d3ee";
    ctx.fillRect(bird.x,bird.y,bird.size,bird.size);

    ctx.fillStyle="#10b981";
    pipes.forEach(pipe=>{
        ctx.fillRect(pipe.x,0,pipeWidth,pipe.top);
        ctx.fillRect(pipe.x,pipe.top+pipeGap,pipeWidth,canvas.height);
    });

    ctx.fillStyle="white";
    ctx.fillText("Score: "+score,20,30);
    ctx.fillText("High: "+highScore,20,50);

    if(gameState==="start")
        ctx.fillText("Press Key To Start",110,250);

    if(gameState==="gameover")
        ctx.fillText("Game Over - Press Key",90,250);
}

function gameLoop(){
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

init();
requestAnimationFrame(gameLoop);