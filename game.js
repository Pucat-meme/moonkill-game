document.addEventListener('DOMContentLoaded', function() {
    const playButton = document.getElementById('playButton');
    const gameSection = document.getElementById('gameSection');
    const mainContent = document.getElementById('mainContent');

    playButton.addEventListener('click', function() {
        mainContent.style.display = 'none';
        gameSection.style.display = 'block';
        // Initialize and start the game here
        // You may need to add your game initialization code
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let gameLoop;
    let player;
    let coins = [];
    let obstacles = [];
    let stars = [];
    let score = 0;
    let gameRunning = false;
    let level = 1;

    function createStars() {
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                alpha: Math.random()
            });
        }
    }

    function drawBackground() {
        ctx.fillStyle = '#000033';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
        });
        ctx.restore();
    }

    class Player {
        constructor() {
            this.x = 50;
            this.y = canvas.height - 50;
            this.radius = 20;
            this.speed = 5;
            this.jumping = false;
            this.jetpack = false;
            this.jumpStrength = 12;
            this.gravity = 0.6;
            this.velocity = {x: 0, y: 0};
        }

        draw() {
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = '#000033';
            ctx.fill();
        }

        move(direction) {
            if (direction === 'left') {
                this.velocity.x = -this.speed;
            } else if (direction === 'right') {
                this.velocity.x = this.speed;
            } else {
                this.velocity.x = 0;
            }
        }

        jump() {
            if (!this.jumping) {
                this.jumping = true;
                this.velocity.y = -this.jumpStrength;
            }
        }

        activateJetpack() {
            this.jetpack = true;
        }

        deactivateJetpack() {
            this.jetpack = false;
        }

        update() {
            this.x += this.velocity.x;
            this.y += this.velocity.y;

            if (this.jumping || this.y < canvas.height - this.radius) {
                this.velocity.y += this.gravity;

                if (this.jetpack) {
                    this.velocity.y -= 0.8;
                }
            }

            if (this.y > canvas.height - this.radius) {
                this.y = canvas.height - this.radius;
                this.jumping = false;
                this.velocity.y = 0;
            } else if (this.y < this.radius) {
                this.y = this.radius;
                this.velocity.y = 0;
            }

            if (this.x < this.radius) {
                this.x = this.radius;
                this.velocity.x = 0;
            } else if (this.x > canvas.width - this.radius) {
                this.x = canvas.width - this.radius;
                this.velocity.x = 0;
            }

            if (!this.jumping) {
                this.velocity.x = 0;
            }
        }
    }

    class Coin {
        constructor() {
            this.x = Math.random() * (canvas.width - 20);
            this.y = Math.random() * (canvas.height * 0.7);
            this.radius = 10;
            this.rotation = 0;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffdf00';
            ctx.font = '12px Arial';
            ctx.fillText('$', -4, 4);
            ctx.restore();

            this.rotation += 0.1;
        }
    }

    class Obstacle {
        constructor() {
            this.x = canvas.width;
            this.y = Math.random() * (canvas.height - 50);
            this.radius = 15;
            this.speed = 2 + (level * 0.5);
            this.rotation = 0;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = '#ff6347';
            ctx.beginPath();
            ctx.moveTo(0, -this.radius);
            for (let i = 0; i < 7; i++) {
                ctx.rotate(Math.PI / 3.5);
                ctx.lineTo(0, -(this.radius / 2));
                ctx.rotate(Math.PI / 3.5);
                ctx.lineTo(0, -this.radius);
            }
            ctx.fill();
            ctx.restore();

            this.rotation += 0.1;
        }

        update() {
            this.x -= this.speed;
        }
    }

    function startGame() {
        if (!gameRunning) {
            player = new Player();
            coins = [];
            obstacles = [];
            score = 0;
            level = 1;
            createStars();
            gameLoop = setInterval(update, 1000 / 60);
            spawnCoin();
            spawnObstacle();
            gameRunning = true;
            document.getElementById('playAgain').style.display = 'none';
        }
    }

    function stopGame() {
        if (gameRunning) {
            clearInterval(gameLoop);
            gameRunning = false;
        }
    }

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackground();
        player.update();
        player.draw();

        updateCoins();
        updateObstacles();

        drawScore();
        checkLevelUp();
    }

    function spawnCoin() {
        if (coins.length < 5) {
            coins.push(new Coin());
        }
        setTimeout(spawnCoin, 2000 / level);
    }

    function spawnObstacle() {
        obstacles.push(new Obstacle());
        setTimeout(spawnObstacle, 3000 / Math.sqrt(level));
    }

    function updateCoins() {
        coins.forEach((coin, index) => {
            coin.draw();
            if (checkCollision(player, coin)) {
                coins.splice(index, 1);
                score += 10;
            }
        });
    }

    function updateObstacles() {
        obstacles.forEach((obstacle, index) => {
            obstacle.update();
            obstacle.draw();
            if (obstacle.x + obstacle.radius < 0) {
                obstacles.splice(index, 1);
            }
            if (checkCollision(player, obstacle)) {
                gameOver();
            }
        });
    }

    function checkCollision(obj1, obj2) {
        let dx = obj1.x - obj2.x;
        let dy = obj1.y - obj2.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance < obj1.radius + obj2.radius;
    }

    function drawScore() {
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Orbitron';
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.fillText(`Level: ${level}`, canvas.width - 100, 30);
    }

    function checkLevelUp() {
        if (score >= level * 100) {
            level++;
            player.speed += 0.2;
        }
    }

    function gameOver() {
        stopGame();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ffff';
        ctx.font = '40px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = '20px Orbitron';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Level Reached: ${level}`, canvas.width / 2, canvas.height / 2 + 30);
        
        document.getElementById('playAgain').style.display = 'inline-block';
    }

    document.addEventListener('keydown', (e) => {
        if (gameRunning) {
            switch (e.key) {
                case 'ArrowLeft':
                    player.move('left');
                    break;
                case 'ArrowRight':
                    player.move('right');
                    break;
                case 'ArrowUp':
                case ' ':
                    player.jump();
                    player.activateJetpack();
                    break;
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (gameRunning) {
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    player.move('stop');
                    break;
                case 'ArrowUp':
                case ' ':
                    player.deactivateJetpack();
                    break;
            }
        }
    });

    const playButton = document.getElementById('playButton');
    playButton.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('gameSection').style.display = 'block';
        startGame();
    });

    const exitButton = document.getElementById('exitGame');
    exitButton.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('gameSection').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        stopGame();
    });

    const playAgainButton = document.getElementById('playAgain');
    playAgainButton.addEventListener('click', function(e) {
        e.preventDefault();
        startGame();
    });

    function resizeCanvas() {
        canvas.width = Math.min(window.innerWidth * 0.9, 1200);
        canvas.height = Math.min(window.innerHeight * 0.8, 600);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
});