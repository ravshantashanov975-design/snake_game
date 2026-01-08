
        class SnakeGame {
            constructor() {
                this.canvas = document.getElementById('gameCanvas');
                this.ctx = this.canvas.getContext('2d');
                
                this.gridSize = 20;
                this.cols = this.canvas.width / this.gridSize;
                this.rows = this.canvas.height / this.gridSize;
                
                this.snake = [
                    { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) }
                ];
                this.direction = { x: 1, y: 0 };
                this.nextDirection = { x: 1, y: 0 };
                
                this.gameSpeed = parseInt(localStorage.getItem('snakeSpeed')) || 100;
                this.foodCount = parseInt(localStorage.getItem('snakeFoodCount')) || 1;
                this.snakeColor = localStorage.getItem('snakeColor') || '#00ff00';
                
                this.foods = [];
                for (let i = 0; i < this.foodCount; i++) {
                    this.foods.push(this.generateFood());
                }
                
                this.score = 0;
                this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
                this.gameRunning = false;
                this.gamePaused = false;
                this.gameLoopId = null;
                
                this.setupEventListeners();
                this.updateHighScore();
                this.draw();
            }
            
            setupEventListeners() {
                document.addEventListener('keydown', (e) => this.handleKeyPress(e));
                document.getElementById('startBtn').addEventListener('click', () => this.start());
                document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
                document.getElementById('restartBtn').addEventListener('click', () => this.restart());
                document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
                document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());
                document.getElementById('saveSSettingsBtn').addEventListener('click', () => this.saveSettings());
                
                // Mobil boshqaruv tugmalari
                document.querySelectorAll('.direction-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.handleMobileDirection(btn.dataset.direction);
                    });
                    
                    // Touch event uchun
                    btn.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        this.handleMobileDirection(btn.dataset.direction);
                    });
                });
                
                document.getElementById('speedSlider').addEventListener('input', (e) => {
                    document.getElementById('speedValue').textContent = e.target.value + 'ms';
                });
                
                document.getElementById('foodCountSlider').addEventListener('input', (e) => {
                    document.getElementById('foodCountValue').textContent = e.target.value;
                });
                
                document.querySelectorAll('.color-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                    });
                });
            }
            
            handleMobileDirection(direction) {
                if (!this.gameRunning) {
                    this.start();
                }
                
                switch(direction) {
                    case 'up':
                        if (this.direction.y === 0) {
                            this.nextDirection = { x: 0, y: -1 };
                        }
                        break;
                    case 'down':
                        if (this.direction.y === 0) {
                            this.nextDirection = { x: 0, y: 1 };
                        }
                        break;
                    case 'left':
                        if (this.direction.x === 0) {
                            this.nextDirection = { x: -1, y: 0 };
                        }
                        break;
                    case 'right':
                        if (this.direction.x === 0) {
                            this.nextDirection = { x: 1, y: 0 };
                        }
                        break;
                }
            }
            
            openSettings() {
                document.getElementById('settingsModal').classList.remove('hidden');
                document.getElementById('speedSlider').value = this.gameSpeed;
                document.getElementById('speedValue').textContent = this.gameSpeed + 'ms';
                document.getElementById('foodCountSlider').value = this.foodCount;
                document.getElementById('foodCountValue').textContent = this.foodCount;
                
                document.querySelectorAll('.color-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.color === this.snakeColor) {
                        btn.classList.add('active');
                    }
                });
            }
            
            closeSettings() {
                document.getElementById('settingsModal').classList.add('hidden');
            }
            
            saveSettings() {
                const newSpeed = document.getElementById('speedSlider').value;
                const newFoodCount = document.getElementById('foodCountSlider').value;
                const activeColor = document.querySelector('.color-btn.active');
                
                this.gameSpeed = parseInt(newSpeed);
                this.foodCount = parseInt(newFoodCount);
                this.snakeColor = activeColor ? activeColor.dataset.color : '#00ff00';
                
                localStorage.setItem('snakeSpeed', this.gameSpeed);
                localStorage.setItem('snakeFoodCount', this.foodCount);
                localStorage.setItem('snakeColor', this.snakeColor);
                
                this.foods = [];
                for (let i = 0; i < this.foodCount; i++) {
                    this.foods.push(this.generateFood());
                }
                
                this.closeSettings();
                this.draw();
                
                if (this.gameRunning && !this.gamePaused) {
                    clearInterval(this.gameLoopId);
                    this.gameLoopId = setInterval(() => this.update(), this.gameSpeed);
                }
            }
            
            handleKeyPress(e) {
                const key = e.key.toLowerCase();
                
                if (key.includes('arrow')) e.preventDefault();
                
                switch(key) {
                    case 'arrowup':
                    case 'w':
                        if (this.direction.y === 0) {
                            this.nextDirection = { x: 0, y: -1 };
                        }
                        break;
                    case 'arrowdown':
                    case 's':
                        if (this.direction.y === 0) {
                            this.nextDirection = { x: 0, y: 1 };
                        }
                        break;
                    case 'arrowleft':
                    case 'a':
                        if (this.direction.x === 0) {
                            this.nextDirection = { x: -1, y: 0 };
                        }
                        break;
                    case 'arrowright':
                    case 'd':
                        if (this.direction.x === 0) {
                            this.nextDirection = { x: 1, y: 0 };
                        }
                        break;
                    case ' ':
                        this.togglePause();
                        break;
                }
            }
            
            generateFood() {
                let food;
                let collision = true;
                
                while (collision) {
                    food = {
                        x: Math.floor(Math.random() * this.cols),
                        y: Math.floor(Math.random() * this.rows)
                    };
                    collision = this.snake.some(segment => 
                        segment.x === food.x && segment.y === food.y
                    ) || this.foods.some(f => f.x === food.x && f.y === food.y);
                }
                
                return food;
            }
            
            start() {
                if (this.gameRunning) return;
                
                this.gameRunning = true;
                this.gamePaused = false;
                document.getElementById('startBtn').textContent = 'Davom et';
                document.getElementById('pauseBtn').style.display = 'inline-block';
                
                this.gameLoopId = setInterval(() => this.update(), this.gameSpeed);
            }
            
            togglePause() {
                if (!this.gameRunning) return;
                
                this.gamePaused = !this.gamePaused;
                document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Davom' : 'Pauza';
                
                if (this.gamePaused) {
                    clearInterval(this.gameLoopId);
                } else {
                    this.gameLoopId = setInterval(() => this.update(), this.gameSpeed);
                }
            }
            
            update() {
                if (this.gamePaused) return;
                
                this.direction = this.nextDirection;
                
                const head = { ...this.snake[0] };
                head.x += this.direction.x;
                head.y += this.direction.y;
                
                head.x = (head.x + this.cols) % this.cols;
                head.y = (head.y + this.rows) % this.rows;
                
                if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                    this.gameOver();
                    return;
                }
                
                this.snake.unshift(head);
                
                let foodEaten = -1;
                for (let i = 0; i < this.foods.length; i++) {
                    if (head.x === this.foods[i].x && head.y === this.foods[i].y) {
                        foodEaten = i;
                        break;
                    }
                }
                
                if (foodEaten !== -1) {
                    this.score += 10;
                    document.getElementById('score').textContent = this.score;
                    
                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                        localStorage.setItem('snakeHighScore', this.highScore);
                        this.updateHighScore();
                    }
                    
                    if (this.score % 50 === 0 && this.gameSpeed > 50) {
                        this.gameSpeed -= 5;
                        clearInterval(this.gameLoopId);
                        this.gameLoopId = setInterval(() => this.update(), this.gameSpeed);
                    }
                    
                    this.foods[foodEaten] = this.generateFood();
                } else {
                    this.snake.pop();
                }
                
                this.draw();
            }
            
            gameOver() {
                clearInterval(this.gameLoopId);
                this.gameRunning = false;
                this.gamePaused = false;
                
                document.getElementById('finalScore').textContent = this.score;
                document.getElementById('gameOver').classList.remove('hidden');
                document.getElementById('pauseBtn').style.display = 'none';
            }
            
            restart() {
                this.snake = [
                    { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) }
                ];
                this.direction = { x: 1, y: 0 };
                this.nextDirection = { x: 1, y: 0 };
                this.foods = [];
                for (let i = 0; i < this.foodCount; i++) {
                    this.foods.push(this.generateFood());
                }
                this.score = 0;
                this.gameSpeed = parseInt(localStorage.getItem('snakeSpeed')) || 100;
                this.gameRunning = false;
                this.gamePaused = false;
                
                document.getElementById('score').textContent = '0';
                document.getElementById('gameOver').classList.add('hidden');
                document.getElementById('startBtn').textContent = 'O\'ynashni boshlash';
                document.getElementById('pauseBtn').textContent = 'Pauza';
                document.getElementById('pauseBtn').style.display = 'none';
                
                this.draw();
            }
            
            updateHighScore() {
                document.getElementById('highScore').textContent = this.highScore;
            }
            
            draw() {
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
                this.ctx.lineWidth = 1;
                for (let i = 0; i <= this.cols; i++) {
                    const x = i * this.gridSize;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 0);
                    this.ctx.lineTo(x, this.canvas.height);
                    this.ctx.stroke();
                }
                for (let i = 0; i <= this.rows; i++) {
                    const y = i * this.gridSize;
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    this.ctx.lineTo(this.canvas.width, y);
                    this.ctx.stroke();
                }
                
                this.snake.forEach((segment, index) => {
                    if (index === 0) {
                        this.ctx.fillStyle = this.snakeColor;
                    } else {
                        const colorMap = {
                            '#00ff00': '#00cc00',
                            '#00ffff': '#00aaaa',
                            '#ff00ff': '#cc00cc',
                            '#ffff00': '#cccc00'
                        };
                        this.ctx.fillStyle = colorMap[this.snakeColor] || '#00cc00';
                    }
                    this.ctx.fillRect(
                        segment.x * this.gridSize + 1,
                        segment.y * this.gridSize + 1,
                        this.gridSize - 2,
                        this.gridSize - 2
                    );
                });
                
                this.foods.forEach(food => {
                    this.ctx.fillStyle = '#ff0000';
                    this.ctx.beginPath();
                    this.ctx.arc(
                        food.x * this.gridSize + this.gridSize / 2,
                        food.y * this.gridSize + this.gridSize / 2,
                        this.gridSize / 2 - 2,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                });
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            const game = new SnakeGame();
        });
   