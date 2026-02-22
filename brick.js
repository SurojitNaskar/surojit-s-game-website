const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let ball,paddle,bricks,score;
let highScore = localStorage.getItem("brickHigh") || 0;

let level=1,maxLevel=4;
let rows,cols=6;
let brickWidth=60,brickHeight=20,padding=10;
let offsetTop=50,offsetLeft=35;
let gameState="start";

const audioCtx=new(window.AudioContext||window.webkitAudioContext)();

function playSound(freq,duration){
 const osc=audioCtx.createOscillator();
 const gain=audioCtx.createGain();
 osc.connect(gain);gain.connect(audioCtx.destination);
 osc.frequency.value=freq;
 osc.start();
 gain.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+duration);
 osc.stop(audioCtx.currentTime+duration);
}

function init(){
 rows=3+level;
 ball={x:canvas.width/2,y:canvas.height-30,dx:2+level,dy:-2-level,r:8};
 paddle={width:100-level*10,height:12,x:canvas.width/2-50};
 bricks=[];
 score=0;

 for(let c=0;c<cols;c++){
  bricks[c]=[];
  for(let r=0;r<rows;r++){
   bricks[c][r]={status:1};
  }
 }
}

document.addEventListener("mousemove",e=>{
 const rect=canvas.getBoundingClientRect();
 paddle.x=e.clientX-rect.left-paddle.width/2;
});

document.addEventListener("keydown",()=>{
 if(gameState==="start"){gameState="playing";return;}
 if(gameState==="gameover"||gameState==="finalWin"){
  level=1;init();gameState="playing";return;
 }
});

function collision(){
 for(let c=0;c<cols;c++){
  for(let r=0;r<rows;r++){
   let b=bricks[c][r];
   if(b.status){
    let bx=c*(brickWidth+padding)+offsetLeft;
    let by=r*(brickHeight+padding)+offsetTop;
    if(ball.x>bx&&ball.x<bx+brickWidth&&
       ball.y>by&&ball.y<by+brickHeight){
       ball.dy*=-1;
       b.status=0;
       score++;
       playSound(700,0.1);

       if(score===rows*cols){
        if(level<maxLevel){
         level++; init(); gameState="start";
        }else{
         gameState="finalWin";
        }
       }
    }
   }
  }
 }
}

function update(){
 if(gameState!=="playing")return;

 ball.x+=ball.dx;
 ball.y+=ball.dy;

 if(ball.x>canvas.width||ball.x<0)ball.dx*=-1;
 if(ball.y<0)ball.dy*=-1;

 if(ball.y>canvas.height){
  gameState="gameover";
  if(score>highScore){
   highScore=score;
   localStorage.setItem("brickHigh",highScore);
  }
 }

 if(ball.y>canvas.height-paddle.height &&
    ball.x>paddle.x &&
    ball.x<paddle.x+paddle.width){
    ball.dy*=-1;
 }

 collision();
}

function draw(){
 ctx.fillStyle="#000";
 ctx.fillRect(0,0,canvas.width,canvas.height);

 ctx.beginPath();
 ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
 ctx.fillStyle="#22d3ee";
 ctx.fill();

 ctx.fillStyle="#6366f1";
 ctx.fillRect(paddle.x,canvas.height-paddle.height,paddle.width,paddle.height);

 ctx.fillStyle="white";
 ctx.fillText("Level: "+level,20,20);
 ctx.fillText("Score: "+score,20,40);
 ctx.fillText("High: "+highScore,20,60);

 if(gameState==="start")
   ctx.fillText("Level "+level+" - Press Key",150,180);

 if(gameState==="gameover")
   ctx.fillText("Game Over - Press Key",150,180);

 if(gameState==="finalWin")
   ctx.fillText("You Completed All Levels!",100,180);
}

function loop(){update();draw();requestAnimationFrame(loop);}
init();requestAnimationFrame(loop);