const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const flipsEl = document.getElementById('flips');
const timeEl = document.getElementById('time-left');
const startScreen = document.getElementById('start-screen');
const btnStart = document.getElementById('btn-start');
const scoresBody = document.getElementById('scores-body');

// Ícones FontAwesome (Pares Tecnológicos)
const icons = [
    'fa-microchip', 'fa-database', 'fa-wifi', 'fa-terminal',
    'fa-satellite-dish', 'fa-server', 'fa-shield-halved', 'fa-network-wired'
];

let cards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let score = 0;
let flips = 0;
let matches = 0;

// Temporizador
const TOTAL_TIME = 60; // 60 segundos para vencer
let timeRemaining = TOTAL_TIME;
let timerInterval = null;
let gameState = 'START';

// ESCAPE UNIVERSAL
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        window.location.href = "../../index.html";
    }
});

// HISTÓRICO LOCALSTORAGE
function saveScoreToHistory(finalScore) {
    let history = JSON.parse(localStorage.getItem('pnp_memory_history')) || [];
    const dateStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    
    history.unshift({ score: finalScore, date: dateStr });
    if (history.length > 10) history = history.slice(0, 10);
    
    localStorage.setItem('pnp_memory_history', JSON.stringify(history));
    updateLeaderboardUI();
}

function updateLeaderboardUI() {
    let history = JSON.parse(localStorage.getItem('pnp_memory_history')) || [];
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
                <td>${String(item.score).padStart(4, '0')}</td>
            </tr>
        `;
    });
}

// INICIALIZAÇÃO DO TABULEIRO
function createBoard() {
    board.innerHTML = '';
    // Duplica os ícones para criar os pares e embaralha
    const cardArray = [...icons, ...icons];
    cardArray.sort(() => Math.random() - 0.5);

    cardArray.forEach(icon => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('memory-card');
        cardElement.dataset.icon = icon;

        cardElement.innerHTML = `
            <div class="card-face card-front">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="card-face card-back"></div>
        `;

        cardElement.addEventListener('click', flipCard);
        board.appendChild(cardElement);
    });
}

function flipCard() {
    // Bloqueios de segurança absolutos
    if (gameState !== 'PLAYING') return;
    if (lockBoard) return;
    
    // Se a carta já estiver virada (impedir que duplo-clique conte como 2 cartas)
    if (this.classList.contains('flip')) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        // Primeiro clique
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    // Segundo clique
    secondCard = this;
    flips++;
    flipsEl.innerText = flips;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
        disableCards();
        score += 50; // Bônus base por acerto
        matches++;
        
        if (matches === icons.length) {
            endGame(true); // Venceu
        }
    } else {
        unflipCards();
        score = Math.max(0, score - 5); // Penalidade leve por errar
    }
    scoreEl.innerText = score;
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1000); // 1 segundo para o player memorizar as cartas antes de virarem de novo
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// GESTÃO DE TEMPO E ESTADO
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function startTimer() {
    clearInterval(timerInterval);
    timeEl.classList.remove('urgent');
    timeRemaining = TOTAL_TIME;
    timeEl.innerText = formatTime(timeRemaining);

    timerInterval = setInterval(() => {
        timeRemaining--;
        timeEl.innerText = formatTime(timeRemaining);

        if (timeRemaining <= 10) {
            timeEl.classList.add('urgent');
        }

        if (timeRemaining <= 0) {
            endGame(false); // Perdeu (Timeout)
        }
    }, 1000);
}

function endGame(win) {
    gameState = 'START';
    clearInterval(timerInterval);
    
    if (win) {
        // Multiplicador de Score baseado no tempo restante
        score += (timeRemaining * 10); 
    }
    
    scoreEl.innerText = score;
    saveScoreToHistory(score);
    
    setTimeout(() => {
        startScreen.style.opacity = '1';
        startScreen.style.visibility = 'visible';
    }, 1500); // Pequeno atraso para ver o último acerto
}

function startGame() {
    score = 0;
    flips = 0;
    matches = 0;
    scoreEl.innerText = score;
    flipsEl.innerText = flips;
    
    createBoard();
    resetBoard();
    startTimer();
    
    gameState = 'PLAYING';
    startScreen.style.opacity = '0';
    startScreen.style.visibility = 'hidden';
}

btnStart.addEventListener('click', startGame);

// Inicialização da Tela
updateLeaderboardUI();