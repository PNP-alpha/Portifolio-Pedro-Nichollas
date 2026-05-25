const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const nextCanvas = document.getElementById("nextCanvas");
const nextCtx = nextCanvas.getContext("2d");

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const linesEl = document.getElementById("lines");
const startScreen = document.getElementById("start-screen");
const btnStart = document.getElementById("btn-start");
const scoresBody = document.getElementById("scores-body");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

let gameState = 'START';
let grid = [];
let score = 0;
let level = 1;
let lines = 0;
let dropCounter = 0;
let dropInterval = 1000; 
let lastTime = 0;

const SHAPES = {
    'I': [
        [0,0,0,0],
        ['I','I','I','I'],
        [0,0,0,0],
        [0,0,0,0]
    ],
    'J': [
        ['J',0,0],
        ['J','J','J'],
        [0,0,0]
    ],
    'L': [
        [0,0,'L'],
        ['L','L','L'],
        [0,0,0]
    ],
    'O': [
        ['O','O'],
        ['O','O']
    ],
    'S': [
        [0,'S','S'],
        ['S','S',0],
        [0,0,0]
    ],
    'Z': [
        ['Z','Z',0],
        [0,'Z','Z'],
        [0,0,0]
    ],
    'T': [
        [0,'T',0],
        ['T','T','T'],
        [0,0,0]
    ]
};

const COLORS = {
    'I': '#00f3ff', 
    'J': '#0044ff', 
    'L': '#ffaa00', 
    'O': '#ffea00', 
    'S': '#00ff88', 
    'Z': '#ff2a2a', 
    'T': '#9d00ff', 
    'X': '#ff3333'  
};

let playerPiece = null;
let nextPiece = null;
let particles = [];

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        window.location.href = "../../index.html";
    }
});

function saveScoreToHistory(finalScore) {
    let history = JSON.parse(localStorage.getItem('pnp_tetris_history')) || [];
    const dateStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    
    history.unshift({ score: finalScore, date: dateStr });
    if (history.length > 10) history = history.slice(0, 10);
    
    localStorage.setItem('pnp_tetris_history', JSON.stringify(history));
    updateLeaderboardUI();
}

function updateLeaderboardUI() {
    let history = JSON.parse(localStorage.getItem('pnp_tetris_history')) || [];
    scoresBody.innerHTML = '';
    
    if (history.length === 0) {
        scoresBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#444;">NENHUM REGISTRO ENCONTRADO</td></tr>`;
        return;
    }
    
    history.forEach((item, index) => {
        scoresBody.innerHTML += `
            <tr>
                <td>#${index + 1}</td>
                <td>${item.date}</td>
                <td>${String(item.score).padStart(6, '0')}</td>
            </tr>
        `;
    });
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// O Grid agora nasce blindado e preparado
grid = createMatrix(COLS, ROWS);

function createPiece(type) {
    return {
        matrix: SHAPES[type].map(row => [...row]), 
        color: COLORS[type],
        type: type,
        pos: { x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2), y: 0 }
    };
}

function getRandomPiece() {
    const pieces = 'IJLOSTZ';
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    return createPiece(type);
}

function injectCorruptedBlocks() {
    const amount = Math.min(3, level);
    for (let i = 0; i < amount; i++) {
        let randCol = Math.floor(Math.random() * COLS);
        if (grid[ROWS - 1][randCol] === 0) {
            grid[ROWS - 1][randCol] = 'X'; 
            createParticles(randCol, ROWS - 1, '#ff3333', 8);
        }
    }
}

function createParticles(x, y, color, amount) {
    for (let i = 0; i < amount; i++) {
        particles.push({
            x: x * BLOCK_SIZE + BLOCK_SIZE / 2,
            y: y * BLOCK_SIZE + BLOCK_SIZE / 2,
            size: Math.random() * 3 + 1,
            dx: (Math.random() - 0.5) * 6,
            dy: (Math.random() - 0.5) * 6,
            life: 1,
            color: color
        });
    }
}

function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.04;
        if (p.life <= 0) particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
}

function collide(grid, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (grid[y + o.y] &&
                grid[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(grid, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                grid[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerReset() {
    playerPiece = nextPiece;
    nextPiece = getRandomPiece();
    
    if (collide(grid, playerPiece)) {
        gameState = 'START';
        saveScoreToHistory(score);
        startScreen.style.opacity = '1';
        startScreen.style.visibility = 'visible';
    }
}

function playerMove(dir) {
    playerPiece.pos.x += dir;
    if (collide(grid, playerPiece)) {
        playerPiece.pos.x -= dir;
    }
}

function playerDrop() {
    playerPiece.pos.y++;
    if (collide(grid, playerPiece)) {
        playerPiece.pos.y--;
        merge(grid, playerPiece);
        arenaSweep();
        playerReset();
    }
    dropCounter = 0;
}

function playerInstantDrop() {
    while (!collide(grid, playerPiece)) {
        playerPiece.pos.y++;
    }
    playerPiece.pos.y--;
    merge(grid, playerPiece);
    arenaSweep();
    playerReset();
    dropCounter = 0;
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerRotate(dir) {
    const pos = playerPiece.pos.x;
    let offset = 1;
    rotate(playerPiece.matrix, dir);
    while (collide(grid, playerPiece)) {
        playerPiece.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > playerPiece.matrix[0].length) {
            rotate(playerPiece.matrix, -dir);
            playerPiece.pos.x = pos;
            return;
        }
    }
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = ROWS - 1; y >= 0; --y) {
        for (let x = 0; x < COLS; ++x) {
            if (grid[y][x] === 0) {
                continue outer;
            }
        }
        
        for (let x = 0; x < COLS; ++x) {
            createParticles(x, y, COLORS[grid[y][x]] || '#fff', 5);
        }

        const row = grid.splice(y, 1)[0];
        grid.unshift(new Array(COLS).fill(0));
        ++y;

        score += rowCount * 100 * level;
        lines++;
        rowCount *= 2; 

        if (lines > 0 && lines % 10 === 0) {
            level++;
            dropInterval = Math.max(80, 1000 - (level - 1) * 110); 
            injectCorruptedBlocks(); 
        }
    }
    updateHUD();
}

function updateHUD() {
    scoreEl.innerText = String(score).padStart(6, '0');
    levelEl.innerText = String(level).padStart(2, '0');
    linesEl.innerText = String(lines).padStart(2, '0');
}

window.addEventListener('keydown', e => {
    if (gameState !== 'PLAYING') return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') playerMove(-1);
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') playerMove(1);
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') playerDrop();
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') playerRotate(1);
    else if (e.key === ' ') playerInstantDrop();
});

function drawMatrix(matrix, offset, targetCtx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                targetCtx.fillStyle = COLORS[value];
                targetCtx.shadowBlur = 10;
                targetCtx.shadowColor = COLORS[value];
                targetCtx.fillRect((x + offset.x) * BLOCK_SIZE + 1, (y + offset.y) * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
            }
        });
    });
    targetCtx.shadowBlur = 0;
}

function drawNextPiece() {
    nextCtx.fillStyle = '#020202';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    nextCtx.strokeStyle = '#0a0a0a';
    for (let i = 0; i < nextCanvas.width; i += BLOCK_SIZE) {
        nextCtx.beginPath(); nextCtx.moveTo(i, 0); nextCtx.lineTo(i, nextCanvas.height); nextCtx.stroke();
        nextCtx.beginPath(); nextCtx.moveTo(0, i); nextCtx.lineTo(nextCanvas.width, i); nextCtx.stroke();
    }
    
    // A BLINDAGEM MÁGICA: Se não houver peça, o código para aqui e não explode!
    if (!nextPiece) return;

    const offset = {
        x: nextPiece.type === 'I' || nextPiece.type === 'O' ? 1 : 1,
        y: nextPiece.type === 'I' ? 1 : 1
    };
    drawMatrix(nextPiece.matrix, offset, nextCtx);
}

function draw() {
    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += BLOCK_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += BLOCK_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    drawMatrix(grid, { x: 0, y: 0 }, ctx);
    if (playerPiece) drawMatrix(playerPiece.matrix, playerPiece.pos, ctx);
    updateAndDrawParticles();
    drawNextPiece();
}

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    if (gameState === 'PLAYING') {
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
    }

    draw();
    requestAnimationFrame(update);
}

function resetWholeGameState() {
    grid = createMatrix(COLS, ROWS);
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    dropCounter = 0;
    playerPiece = getRandomPiece();
    nextPiece = getRandomPiece();
    updateHUD();
}

btnStart.addEventListener('click', () => {
    resetWholeGameState();
    gameState = 'PLAYING';
    startScreen.style.opacity = '0';
    startScreen.style.visibility = 'hidden';
});

updateLeaderboardUI();
update();