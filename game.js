// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameLoop;
let player;
let coins = [];
let obstacles = [];
let score = 0;
let gameRunning = false;

// Player object
class Player {
    constructor() {
        this.x = 50;
        this.y = canvas.height - 50;
        this.width = 30;
        this.height = 30;
        this.speed = 5;
        this.jumping = false;
        this.jumpStrength = 15;
        this.gravity = 0.8;
        this.velocity = 0;
    }

    draw() {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        }
        if (direction === 'right' && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }

    jump() {
        if (!this.jumping) {
            this.jumping = true;
            this.velocity = -this.jumpStrength;
        }
    }

    update() {
        if (this.jumping) {
            this.y += this.velocity;
            this.velocity += this.gravity;

            if (this.y > canvas.height - this.height) {
                this.y = canvas.height - this.height;
                this.jumping = false;
            }
        }
    }
}

// Coin object
class Coin {
    constructor() {
        this.x = Math.random() * (canvas.width - 20);
        this.y = Math.random() * (canvas.height - 20);
        this.width = 20;
        this.height = 20;
    }

    draw() {
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Obstacle object
class Obstacle {
    constructor() {
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - 50);
        this.width = 30;
        this.height = 30;
        this.speed = 3;
    }

    draw() {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= this.speed;
    }
}

// Game functions
function startGame() {
    if (!gameRunning) {
        player = new Player();
        coins = [];
        obstacles = [];
        score = 0;
        gameLoop = setInterval(update, 1000 / 60); // 60 FPS
        spawnCoin();
        spawnObstacle();
        gameRunning = true;
        canvas.style.display = 'block';
    }
}

function stopGame() {
    if (gameRunning) {
        clearInterval(gameLoop);
        gameRunning = false;
        canvas.style.display = 'none';
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    player.update();
    player.draw();

    updateCoins();
    updateObstacles();

    drawScore();
}

function spawnCoin() {
    if (coins.length < 5) {
        coins.push(new Coin());
    }
    setTimeout(spawnCoin, 2000);
}

function spawnObstacle() {
    obstacles.push(new Obstacle());
    setTimeout(spawnObstacle, 3000);
}

function updateCoins() {
    coins.forEach((coin, index) => {
        coin.draw();
        if (checkCollision(player, coin)) {
            coins.splice(index, 1);
            score++;
        }
    });
}

function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        obstacle.draw();
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }
        if (checkCollision(player, obstacle)) {
            gameOver();
        }
    });
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function drawScore() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Orbitron';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function gameOver() {
    stopGame();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ffff';
    ctx.font = '40px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Orbitron';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('Click "Exit Game" to return', canvas.width / 2, canvas.height / 2 + 80);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (gameRunning) {
        switch(e.key) {
            case 'ArrowLeft':
                player.move('left');
                break;
            case 'ArrowRight':
                player.move('right');
                break;
            case 'ArrowUp':
            case ' ':
                player.jump();
                break;
        }
    }
});

// Play button functionality
document.getElementById('playButton').addEventListener('click', function(e) {
    e.preventDefault();
    startGame();
});

// Resize canvas function
function resizeCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const canvasRatio = canvas.width / canvas.height;
    const containerRatio = containerWidth / containerHeight;

    if (containerRatio > canvasRatio) {
        canvas.style.height = `${containerHeight}px`;
        canvas.style.width = `${containerHeight * canvasRatio}px`;
    } else {
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerWidth / canvasRatio}px`;
    }
}

// Call resizeCanvas initially and on window resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
