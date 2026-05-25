const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scorePlayerEl = document.getElementById("score-player");
const scoreAiEl = document.getElementById("score-ai");
const livesDisplay = document.getElementById("lives-display");
const startScreen = document.getElementById("start-screen");
const btnStart = document.getElementById("btn-start");
const scoresBody = document.getElementById("scores-body");

let gameState = 'START';
let score = 0;
let aiLevel = 1;
let lives = 3;

// Cores do Tema
const COLOR_PLAYER = "#00ff88"; // Verde Neon
const COLOR_AI = "#ff3333"; // Vermelho IA
const COLOR_BALL = "#ffffff";
const COLOR_NET = "#333333";

// Entidades do Jogo
const paddleWidth = 12;
const paddleHeight = 100;

const player = { x: 20, y: canvas.height/2 - paddleHeight/2, width: paddleWidth, height: paddleHeight, dy: 0, speed: 8 };
const ai = { x: canvas.width - 20 - paddleWidth, y: canvas.height/2 - paddleHeight/2, width: paddleWidth, height: paddleHeight, speed: 4 };
const ball = { x: canvas.width/2, y: canvas.height/2, radius: 8, speed: 6, dx: 6, dy: 6 };

let particles = [];

// BOTÃO ESCAPE
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") window.location.href = "../../index.html";
});

// HISTÓRICO
function saveScoreToHistory(finalScore) {
    let history = JSON.parse(localStorage.getItem('pnp_pong_history')) || [];
    const dateStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    history.unshift({ score: finalScore, date: dateStr });
    if (history.length > 10) history = history.slice(0, 10);
    localStorage.setItem('pnp_pong_history', JSON.stringify(history));
    updateLeaderboardUI();
}

function updateLeaderboardUI() {
    let history = JSON.parse(localStorage.getItem('pnp_pong_history')) || [];
    scoresBody.innerHTML = '';
    if (history.length === 0) {
        scoresBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#444;">NENHUM REGISTRO ENCONTRADO</td></tr>`;
        return;
    }
    history.forEach((item, index) => {
        scoresBody.innerHTML += `<tr><td>#${index + 1}</td><td>${item.date}</td><td>${item.score} PTS</td></tr>`;
    });
}

// CONTROLES DO JOGADOR
window.addEventListener('keydown', e => {
    if(e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') player.dy = -player.speed;
    else if(e.key === 'ArrowDown' || e.key.toLowerCase() === 's') player.dy = player.speed;
});
window.addEventListener('keyup', e => {
    if(['ArrowUp', 'w', 'W', 'ArrowDown', 's', 'S'].includes(e.key)) player.dy = 0;
});

// PARTÍCULAS CYBER
function createParticles(x, y, color, amount) {
    for (let i = 0; i < amount; i++) {
        particles.push({
            x: x, y: y, size: Math.random() * 3 + 1,
            dx: (Math.random() - 0.5) * 10, dy: (Math.random() - 0.5) * 10,
            life: 1, color: color
        });
    }
}

function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        ctx.fillStyle = p.color; ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        p.x += p.dx; p.y += p.dy; p.life -= 0.04;
        if (p.life <= 0) particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
}

// FÍSICA E ATUALIZAÇÃO
function resetBall(scorer) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 6;
    ball.dx = scorer === 'player' ? -ball.speed : ball.speed;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
}

function updateHUD() {
    scorePlayerEl.innerText = score;
    scoreAiEl.innerText = `NÍVEL ${aiLevel}`;
    livesDisplay.innerHTML = '';
    for(let i=0; i<3; i++) {
        livesDisplay.innerHTML += `<i class="fa-solid fa-heart ${i >= lives ? 'lost' : ''}"></i>`;
    }
}

function endGame() {
    gameState = 'START';
    saveScoreToHistory(score);
    startScreen.style.opacity = '1';
    startScreen.style.visibility = 'visible';
}

function update() {
    if (gameState !== 'PLAYING') return;

    // Movimento Player
    player.y += player.dy;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    // Movimento IA Avançado (Segue a bola com limite de velocidade baseado no Nível)
    let aiTargetCenter = ball.y - ai.height/2;
    if (ai.y < aiTargetCenter) ai.y += ai.speed;
    else if (ai.y > aiTargetCenter) ai.y -= ai.speed;
    
    // Movimento Bola
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Colisão Teto e Chão
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy *= -1;
        createParticles(ball.x, ball.y < 50 ? 0 : canvas.height, COLOR_BALL, 5);
    }

    // Detecção de Colisão com Raquetes (AABB Básica)
    let hitPaddle = (ball.x < canvas.width/2) ? player : ai;

    if (ball.x - ball.radius < hitPaddle.x + hitPaddle.width && 
        ball.x + ball.radius > hitPaddle.x && 
        ball.y + ball.radius > hitPaddle.y && 
        ball.y - ball.radius < hitPaddle.y + hitPaddle.height) {
        
        // Física de Ângulo Dinâmico
        let collidePoint = (ball.y - (hitPaddle.y + hitPaddle.height/2));
        collidePoint = collidePoint / (hitPaddle.height/2);
        let angleRad = (Math.PI/4) * collidePoint; // Max 45 graus

        let direction = (ball.x < canvas.width/2) ? 1 : -1;
        ball.speed += 0.5; // Aumenta a velocidade a cada rebatida (Ping Pong Frenético)
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);

        let hitColor = (ball.x < canvas.width/2) ? COLOR_PLAYER : COLOR_AI;
        createParticles(ball.x, ball.y, hitColor, 15);
    }

    // Pontuação e Reset
    if (ball.x - ball.radius < 0) {
        // IA Marcou (Player perde vida)
        lives--;
        updateHUD();
        createParticles(0, ball.y, COLOR_AI, 30);
        if (lives <= 0) endGame();
        else resetBall('ai');
    } else if (ball.x + ball.radius > canvas.width) {
        // Player Marcou
        score += 100;
        aiLevel++;
        ai.speed += 0.8; // IA fica mais rápida
        updateHUD();
        createParticles(canvas.width, ball.y, COLOR_PLAYER, 30);
        resetBall('player');
    }
}

// RENDERIZAÇÃO
function drawRect(x, y, w, h, color, blurObj) {
    ctx.fillStyle = color;
    if(blurObj) { ctx.shadowBlur = blurObj.blur; ctx.shadowColor = blurObj.color; }
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.shadowBlur = 15; ctx.shadowColor = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2, false); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
}

function draw() {
    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Linha do Meio (Rede)
    for(let i=0; i<=canvas.height; i+=30) { drawRect(canvas.width/2 - 1, i, 2, 15, COLOR_NET); }

    // Raquetes
    drawRect(player.x, player.y, player.width, player.height, COLOR_PLAYER, {blur: 15, color: COLOR_PLAYER});
    drawRect(ai.x, ai.y, ai.width, ai.height, COLOR_AI, {blur: 15, color: COLOR_AI});

    // Bola
    drawCircle(ball.x, ball.y, ball.radius, COLOR_BALL);

    drawParticles();
}

// LOOP REAL-TIME
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

btnStart.addEventListener('click', () => {
    score = 0;
    aiLevel = 1;
    lives = 3;
    ai.speed = 4;
    updateHUD();
    resetBall('player');
    gameState = 'PLAYING';
    startScreen.style.opacity = '0';
    startScreen.style.visibility = 'hidden';
});

// Inicialização
updateLeaderboardUI();
loop();