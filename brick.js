const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let ball, paddle, bricks, score;
let highScore = 0;

let level = 1, maxLevel = 4;
let rows, cols = 6;
let brickWidth = 60, brickHeight = 20, padding = 10;
let offsetTop = 50, offsetLeft = 35;
let gameState = "start";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, duration) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
}

function init() {
    rows = 3 + level;

    ball = {
        x: canvas.width / 2,
        y: canvas.height - 40,
        dx: 2 + level,
        dy: -2 - level,
        r: 8
    };

    paddle = {
        width: 100 - level * 10,
        height: 12,
        x: canvas.width / 2 - 50
    };

    bricks = [];
    score = 0;

    for (let c = 0; c < cols; c++) {
        bricks[c] = [];
        for (let r = 0; r < rows; r++) {
            bricks[c][r] = { status: 1 };
        }
    }
}

document.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    paddle.x = e.clientX - rect.left - paddle.width / 2;

    // Prevent paddle from going outside
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));
});

document.addEventListener("keydown", () => {
    if (gameState === "start") {
        gameState = "playing";
        return;
    }

    if (gameState === "gameover" || gameState === "finalWin") {
        level = 1;
        init();
        gameState = "playing";
        return;
    }
});

function collision() {
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            let b = bricks[c][r];

            if (b.status === 1) {
                let bx = c * (brickWidth + padding) + offsetLeft;
                let by = r * (brickHeight + padding) + offsetTop;

                if (
                    ball.x + ball.r > bx &&
                    ball.x - ball.r < bx + brickWidth &&
                    ball.y + ball.r > by &&
                    ball.y - ball.r < by + brickHeight
                ) {
                    ball.dy *= -1;
                    b.status = 0;
                    score++;
                    playSound(700, 0.1);

                    if (score === rows * cols) {
                        if (level < maxLevel) {
                            level++;
                            init();
                            gameState = "start";
                        } else {
                            gameState = "finalWin";
                        }
                    }
                }
            }
        }
    }
}

function update() {
    if (gameState !== "playing") return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (with radius fix)
    if (ball.x + ball.r > canvas.width || ball.x - ball.r < 0)
        ball.dx *= -1;

    if (ball.y - ball.r < 0)
        ball.dy *= -1;

    // Paddle collision
    if (
        ball.y + ball.r > canvas.height - paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        ball.dy *= -1;
        ball.y = canvas.height - paddle.height - ball.r;
    }

    // Game over
    if (ball.y > canvas.height) {
        gameState = "gameover";
        saveHighScore();
    }

    collision();
}

function saveHighScore() {
    const username = localStorage.getItem("currentUser");
    let users = JSON.parse(localStorage.getItem("users")) || [];

    let user = users.find(u => u.username === username);

    if (user && score > user.scores.brick) {
        user.scores.brick = score;
        localStorage.setItem("users", JSON.stringify(users));
    }
}

function drawBricks() {
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (bricks[c][r].status === 1) {
                let bx = c * (brickWidth + padding) + offsetLeft;
                let by = r * (brickHeight + padding) + offsetTop;

                ctx.fillStyle = "#10b981";
                ctx.fillRect(bx, by, brickWidth, brickHeight);
            }
        }
    }
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBricks();

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "#22d3ee";
    ctx.fill();

    // Paddle
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(
        paddle.x,
        canvas.height - paddle.height,
        paddle.width,
        paddle.height
    );

    ctx.fillStyle = "white";
    ctx.fillText("Level: " + level, 20, 20);
    ctx.fillText("Score: " + score, 20, 40);

    if (gameState === "start")
        ctx.fillText("Level " + level + " - Press Key", 130, 180);

    if (gameState === "gameover")
        ctx.fillText("Game Over - Press Key", 130, 180);

    if (gameState === "finalWin")
        ctx.fillText("You Completed All Levels!", 90, 180);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

init();
requestAnimationFrame(loop);
