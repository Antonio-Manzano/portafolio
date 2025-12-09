const cardsArray = [
    { name: 'sword', icon: '⚔️' },
    { name: 'pickaxe', icon: '⛏️' },
    { name: 'dirt', icon: '🧱' },
    { name: 'gold', icon: '🪙' },
    { name: 'creeper', icon: '💣' },
    { name: 'heart', icon: '❤️' }
];

let gameCards = [];
let cardsFlipped = [];
let matchesFound = 0;
let isBoardLocked = false;
const maxMatches = cardsArray.length;
const totalTime = 60;
let timeLeft = totalTime;
let timerInterval;

const gameBoard = document.getElementById('game-board');
const timeDisplay = document.getElementById('time-display');
const matchesDisplay = document.getElementById('matches-display');
const startButton = document.getElementById('start-button');
const endGameMessage = document.getElementById('end-game-message');
const endGameTitle = document.getElementById('end-game-title');
const endGameText = document.getElementById('end-game-text');
const restartButton = document.getElementById('restart-button');

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createBoard() {
    gameBoard.innerHTML = '';
    const doubledCards = [...cardsArray, ...cardsArray];
    shuffle(doubledCards);
    gameCards = doubledCards.map((card, index) => ({ ...card, id: index, matched: false }));

    gameCards.forEach(card => {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container');
        cardContainer.dataset.name = card.name;
        cardContainer.dataset.id = card.id;
        cardContainer.addEventListener('click', flipCard);

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');
        cardFront.textContent = card.icon;

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-face', 'card-back');
        cardBack.textContent = 'MC'; 

        cardContainer.appendChild(cardFront);
        cardContainer.appendChild(cardBack);
        gameBoard.appendChild(cardContainer);
    });
}

function flipCard() {
    if (isBoardLocked) return;
    if (this.classList.contains('flipped')) return;

    this.classList.add('flipped');
    cardsFlipped.push(this);

    if (cardsFlipped.length === 2) {
        isBoardLocked = true;
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = cardsFlipped;
    const isMatch = card1.dataset.name === card2.dataset.name;

    if (isMatch) {
        disableCards();
        matchesFound++;
        matchesDisplay.textContent = `${matchesFound} / ${maxMatches}`;
        if (matchesFound === maxMatches) {
            endGame(true);
        }
    } else {
        unflipCards();
    }
}

function disableCards() {
    cardsFlipped.forEach(card => {
        card.classList.add('matched');
    });
    resetBoard();
}

function unflipCards() {
    setTimeout(() => {
        cardsFlipped.forEach(card => {
            card.classList.remove('flipped');
        });
        resetBoard();
    }, 1000); 
}

function resetBoard() {
    cardsFlipped = [];
    isBoardLocked = false;
}

function startTimer() {
    timeLeft = totalTime;
    timeDisplay.textContent = `${timeLeft}s`;
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = `${timeLeft}s`;

        if (timeLeft <= 10) {
             timeDisplay.style.color = 'var(--minecraft-redstone)';
             timeDisplay.style.textShadow = '2px 2px #FFF';
        } else {
             timeDisplay.style.color = 'var(--minecraft-glowstone)';
             timeDisplay.style.textShadow = '2px 2px #000';
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame(false);
        }
    }, 1000);
}

function startGame() {
    endGameMessage.classList.add('hidden');
    startButton.classList.add('hidden');
    gameBoard.style.pointerEvents = 'auto';
    
    matchesFound = 0;
    matchesDisplay.textContent = `${matchesFound} / ${maxMatches}`;
    resetBoard();
    createBoard();
    startTimer();
}

function endGame(win) {
    clearInterval(timerInterval);
    gameBoard.style.pointerEvents = 'none';

    if (win) {
        endGameTitle.textContent = '¡VICTORIA MINECRAFT!';
        endGameText.textContent = `¡Despejaste el inventario en ${totalTime - timeLeft} segundos!`;
        endGameTitle.style.color = 'var(--minecraft-creeper-green)';
    } else {
        endGameTitle.textContent = '¡EXPLOSIÓN CREEPER!';
        endGameText.textContent = 'Se acabó el tiempo. ¡Inténtalo de nuevo!';
        endGameTitle.style.color = 'var(--minecraft-redstone)';
    }
    
    endGameMessage.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    createBoard();
    gameBoard.style.pointerEvents = 'none';
    timeDisplay.textContent = `${totalTime}s`;
    endGameMessage.classList.add('hidden');
});