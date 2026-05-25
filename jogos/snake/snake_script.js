const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const startScreen = document.getElementById("start-screen");
const btnStart = document.getElementById("btn-start");
const scoresBody = document.getElementById("scores-body");

const hud = document.querySelector('.hud');
const powerUpTimerEl = document.createElement('div');
powerUpTimerEl.className = 'power-up-timer';
hud.appendChild(powerUpTimerEl);

// Cores do Tema
const COLOR_SNAKE = "#00ff88";
const COLOR_FOOD = "#ff00ff"; 
const COLOR_SPECIAL = "#00f3ff"; 
const COLOR_OBSTACLE = "#ff3333"; // Vermelho Alerta para Obstáculos
const COLOR_HEAD = "#ffffff";

let gridSize = 25; 
let tileCountX, tileCountY;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tileCountX = Math.floor(canvas.width / gridSize);
    tileCountY = Math.floor(canvas.height / gridSize);
}
window.addEventListener("resize", resize);
resize();

// Estados: 'START' ou 'PLAYING'
let gameState = 'START';

let snake = [];
let velocity = { x: 0, y: 0 };
let nextVelocity = { x: 0, y: 0 };
let food = { x: 10, y: 10 };
let specialFood = null; 
let obstacles = []; // Array de obstáculos dinâmicos
let score = 0;
let speed = 120; 
const minSpeed = 45; 
let lastMoveTime = 0;
let pulseAngle = 0;

let ghostMode = false;
let ghostTimer = 0;
let ghostInterval = null;
let particles = [];

// BOTÃO DE ESC ESCAPE UNIVERSAL
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        window.location.href = "../../index.html";
    }
});

// HISTÓRICO DE PLACARES (LOCAL STORAGE)
function saveScoreToHistory(finalScore) {
    let history = JSON.parse(localStorage.getItem('pnp_snake_history')) || [];
    const dateStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    
    // Adiciona o novo resultado no início do array
    history.unshift({ score: finalScore, date: dateStr });
    
    // Corta para manter apenas os últimos 10
    if (history.length > 10) history = history.slice(0, 10);
    
    localStorage.setItem('pnp_snake_history', JSON.stringify(history));
    updateLeaderboardUI();
}

function updateLeaderboardUI() {
    let history = JSON.parse(localStorage.getItem('pnp_snake_history')) || [];
    scoresBody.innerHTML = '';
    
    if (history.length === 0) {
        scoresBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#555;">NENHUM REGISTRO ENCONTRADO</td></tr>`;
        return;
    }
    
    history.forEach((item, index) => {
        scoresBody.innerHTML += `
            <tr>
                <td>#${index + 1}</td>
                <td>${item.date}</td>
                <td>${item.score} PTS</td>
            </tr>
        `;
    });
}

// CONTROLE DOS OBSTÁCULOS VOLÁTEIS
function placeObstacles() {
    obstacles = [];
    // Define quantos blocos de obstáculos vão surgir no mapa
    const totalObstacles = 4; 

    for (let i = 0; i < totalObstacles; i++) {
        let obsPos;
        let safe = false;
        
        while (!safe) {
            obsPos = {
                x: Math.floor(Math.random() * (tileCountX - 2)) + 1,
                y: Math.floor(Math.random() * (tileCountY - 2)) + 1
            };
            
            // Filtros de segurança para não prender o player injustamente
            const hitSnake = snake.some(s => s.x === obsPos.x && s.y === obsPos.y);
            const hitFood = (obsPos.x === food.x && obsPos.y === food.y);
            const hitSpecial = specialFood ? (obsPos.x === specialFood.x && obsPos.y === specialFood.y) : false;
            const hitOtherObs = obstacles.some(o => o.x === obsPos.x && o.y === obsPos.y);
            
            // Evita spawnar a menos de 4 blocos de distância da cabeça da cobra
            const nearHead = Math.abs(obsPos.x - snake[0].x) < 4 && Math.abs(obsPos.y - snake[0].y) < 4;

            if (!hitSnake && !hitFood && !hitSpecial && !hitOtherObs && !nearHead) {
                safe = true;
            }
        }
        obstacles.push(obsPos);
    }
}

function createParticles(x, y, color, amount) {
    for (let i = 0; i < amount; i++) {
        particles.push({
            x: x * gridSize + gridSize / 2,
            y: y * gridSize + gridSize / 2,
            size: Math.random() * 4 + 2,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            life: 1,
            color: color
        });
    }
}

function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${p.life})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.03;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function hexToRgb(hex) {
    let r = 0, g = 255, b = 136;
    if(hex === COLOR_FOOD) { r = 255; g = 0; b = 255; }
    if(hex === COLOR_SPECIAL) { r = 0; g = 243; b = 255; }
    if(hex === COLOR_OBSTACLE) { r = 255; g = 51; b = 51; }
    return `${r},${g},${b}`;
}

function resetGame() {
    snake = [
        { x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) },
        { x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) + 1 },
        { x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) + 2 }
    ];
    velocity = { x: 0, y: -1 }; 
    nextVelocity = { x: 0, y: -1 };
    score = 0;
    scoreEl.innerText = score;
    speed = 120; 
    ghostMode = false;
    specialFood = null;
    powerUpTimerEl.style.display = 'none';
    clearInterval(ghostInterval);
    placeFood();
    placeObstacles(); // Gera obstáculos iniciais
}

function placeFood() {
    let newFoodPos;
    let safe = false;
    while (!safe) {
        newFoodPos = {
            x: Math.floor(Math.random() * (tileCountX - 2)) + 1,
            y: Math.floor(Math.random() * (tileCountY - 2)) + 1
        };
        const hitSnake = snake.some(s => s.x === newFoodPos.x && s.y === newFoodPos.y);
        const hitObs = obstacles.some(o => o.x === newFoodPos.x && o.y === newFoodPos.y);
        if (!hitSnake && !hitObs) safe = true;
    }
    food = newFoodPos;

    if (Math.random() < 0.15 && !specialFood && !ghostMode) {
        let specialSafe = false;
        while (!specialSafe) {
            specialFood = {
                x: Math.floor(Math.random() * (tileCountX - 2)) + 1,
                y: Math.floor(Math.random() * (tileCountY - 2)) + 1
            };
            specialSafe = !snake.some(s => s.x === specialFood.x && s.y === specialFood.y) && 
                          !obstacles.some(o => o.x === specialFood.x && o.y === specialFood.y) &&
                          (specialFood.x !== food.x || specialFood.y !== food.y);
        }
    }
}

function activateGhostMode() {
    ghostMode = true;
    ghostTimer = 8; 
    powerUpTimerEl.style.display = 'block';
    powerUpTimerEl.innerText = `OVERCLOCK: ${ghostTimer}s`;
    
    clearInterval(ghostInterval);
    ghostInterval = setInterval(() => {
        ghostTimer--;
        powerUpTimerEl.innerText = `OVERCLOCK: ${ghostTimer}s`;
        if (ghostTimer <= 0) {
            ghostMode = false;
            powerUpTimerEl.style.display = 'none';
            clearInterval(ghostInterval);
        }
    }, 1000);
}

window.addEventListener("keydown", (e) => {
    if (gameState !== 'PLAYING') return;
    const key = e.key.toLowerCase();
    if ((key === "arrowup" || key === "w") && velocity.y === 0) nextVelocity = { x: 0, y: -1 };
    if ((key === "arrowdown" || key === "s") && velocity.y === 0) nextVelocity = { x: 0, y: 1 };
    if ((key === "arrowleft" || key === "a") && velocity.x === 0) nextVelocity = { x: -1, y: 0 };
    if ((key === "arrowright" || key === "d") && velocity.x === 0) nextVelocity = { x: 1, y: 0 };
});

function updateSnake() {
    velocity = { ...nextVelocity };
    let head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    // Colisão com Paredes
    if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        if (ghostMode) {
            if (head.x < 0) head.x = tileCountX - 1;
            if (head.x >= tileCountX) head.x = 0;
            if (head.y < 0) head.y = tileCountY - 1;
            if (head.y >= tileCountY) head.y = 0;
        } else {
            handleGameOver();
            return;
        }
    }

    // Colisão com os Obstáculos Dinâmicos
    if (!ghostMode && obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
        createParticles(head.x, head.y, COLOR_OBSTACLE, 40);
        handleGameOver();
        return;
    }

    // Colisão com o Próprio Corpo
    if (!ghostMode && snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        createParticles(head.x, head.y, COLOR_SNAKE, 40);
        handleGameOver();
        return;
    }

    snake.unshift(head);

    // Capturar Esfera Comum
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.innerText = score;
        createParticles(food.x, food.y, COLOR_FOOD, 15);
        
        if (speed > minSpeed) speed -= 3; // Escalonamento de dificuldade

        placeObstacles(); // DESTRÓI OS VELHOS E SPAWNA NOVOS EM OUTRO LUGAR
        placeFood();
    } 
    // Capturar Esfera de Upgrade
    else if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
        score += 50; 
        scoreEl.innerText = score;
        createParticles(specialFood.x, specialFood.y, COLOR_SPECIAL, 30);
        activateGhostMode();
        specialFood = null;
        placeObstacles(); // Reseta os obstáculos no upgrade também
    } 
    else {
        snake.pop(); 
    }
}

function handleGameOver() {
    gameState = 'START';
    saveScoreToHistory(score);
    startScreen.style.opacity = '1';
    startScreen.style.visibility = 'visible';
}

function drawElements() {
    ctx.fillStyle = ghostMode ? "rgba(0, 20, 30, 0.7)" : "rgba(5, 5, 5, 0.6)";
    ctx.shadowBlur = 0;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    pulseAngle += 0.15;
    let pulseSize = Math.sin(pulseAngle) * 3;
    
    // Desenha os Obstáculos Dinâmicos
    obstacles.forEach(obs => {
        ctx.fillStyle = COLOR_OBSTACLE;
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLOR_OBSTACLE;
        ctx.fillRect(obs.x * gridSize + 2, obs.y * gridSize + 2, gridSize - 4, gridSize - 4);
        
        // Detalhe interno de perigo (X no centro do bloco)
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(obs.x * gridSize + 6, obs.y * gridSize + 6);
        ctx.lineTo(obs.x * gridSize + gridSize - 6, obs.y * gridSize + gridSize - 6);
        ctx.moveTo(obs.x * gridSize + gridSize - 6, obs.y * gridSize + 6);
        ctx.lineTo(obs.x * gridSize + 6, obs.y * gridSize + gridSize - 6);
        ctx.stroke();
    });

    // Desenha Comida Normal
    ctx.fillStyle = COLOR_FOOD;
    ctx.shadowBlur = 20;
    ctx.shadowColor = COLOR_FOOD;
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, (gridSize / 2 - 2) + pulseSize, 0, Math.PI * 2);
    ctx.fill();

    // Desenha Comida Especial
    if (specialFood) {
        ctx.fillStyle = COLOR_SPECIAL;
        ctx.shadowColor = COLOR_SPECIAL;
        ctx.beginPath();
        let sx = specialFood.x * gridSize + gridSize / 2;
        let sy = specialFood.y * gridSize + gridSize / 2;
        let size = (gridSize / 2) + pulseSize;
        ctx.moveTo(sx, sy - size);
        ctx.lineTo(sx + size, sy);
        ctx.lineTo(sx, sy + size);
        ctx.lineTo(sx - size, sy);
        ctx.fill();
    }

    // Desenha Cobra
    snake.forEach((segment, index) => {
        let currentColor = ghostMode ? COLOR_SPECIAL : COLOR_SNAKE;
        ctx.fillStyle = index === 0 ? COLOR_HEAD : currentColor;
        ctx.shadowBlur = index === 0 ? 25 : 15;
        ctx.shadowColor = currentColor;
        ctx.globalAlpha = ghostMode ? 0.8 : 1;
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
        ctx.globalAlpha = 1; 
    });

    updateAndDrawParticles();
}

function gameLoop(timestamp) {
    if (!lastMoveTime) lastMoveTime = timestamp;
    let deltaTime = timestamp - lastMoveTime;

    if (gameState === 'PLAYING') {
        if (deltaTime > speed) {
            updateSnake();
            lastMoveTime = timestamp;
        }
    }

    drawElements();
    requestAnimationFrame(gameLoop);
}

// Inicialização e ganchos de eventos
btnStart.addEventListener('click', () => {
    resetGame();
    gameState = 'PLAYING';
    startScreen.style.opacity = '0';
    startScreen.style.visibility = 'hidden';
});

// Execução inicial do histórico e do loop estável
updateLeaderboardUI();
requestAnimationFrame(gameLoop);