class MemoryGame {
    constructor() {
        this.cards = [];
        this.score = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.flippedCards = [];
        this.gameStarted = false;
        this.bindEvents();
        this.displayLeaderboard();
    }

    bindEvents() {
        const startButton = document.getElementById('start');
        if (startButton) {
            startButton.addEventListener('click', () => this.startGame());
        }
    }

    startGame() {
        this.resetGame();
        const difficulty = document.getElementById('difficulty').value;
        this.initializeGame(difficulty);
        this.startTimer();
        this.gameStarted = true;
    }

    resetGame() {
        this.cards = [];
        this.score = 0;
        this.moves = 0;
        this.timer = 0;
        this.flippedCards = [];
        clearInterval(this.timerInterval);
        
        document.getElementById('score').textContent = '0';
        document.getElementById('moves').textContent = '0';
        document.getElementById('time').textContent = '0';
    }

    initializeGame(difficulty) {
        const gridSizes = {
            easy: { size: 4, pairs: 8 },
            medium: { size: 6, pairs: 18 },
            hard: { size: 8, pairs: 32 }
        };

        const { size, pairs } = gridSizes[difficulty];
        const gameBoard = document.querySelector('.game-board');
        gameBoard.setAttribute('data-difficulty', difficulty);
        gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

        this.cards = this.generateCards(pairs);
        this.renderBoard();
    }

    generateCards(numberOfPairs) {
        const emojis = ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎢', '🎡', 
                       '🎠', '🌟', '🎵', '🎹', '🎸', '🎺', '🎻', '🥁',
                       '🎼', '🎧', '🎤', '🎬', '🎪', '🎭', '🎨', '🎯',
                       '🎲', '🎮', '🎪', '🌈', '🌞', '🌙', '⭐', '🌟'];
        
        const selectedEmojis = emojis.slice(0, numberOfPairs);
        const cardPairs = [...selectedEmojis, ...selectedEmojis];
        return this.shuffleArray(cardPairs);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    renderBoard() {
        const gameBoard = document.querySelector('.game-board');
        gameBoard.innerHTML = '';

        this.cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.index = index;
            card.dataset.value = emoji;
            
            card.innerHTML = `
                <div class="card-front"></div>
                <div class="card-back">${emoji}</div>
            `;

            card.addEventListener('click', () => this.flipCard(card));
            gameBoard.appendChild(card);
        });
    }

    flipCard(card) {
        if (!this.gameStarted || 
            this.flippedCards.length >= 2 || 
            card.classList.contains('flipped') ||
            card.classList.contains('matched')) {
            return;
        }

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            document.getElementById('moves').textContent = this.moves;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.value === card2.dataset.value;

        if (match) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        const difficulty = document.getElementById('difficulty').value;
        const scoreMultiplier = {
            easy: 10,
            medium: 15,
            hard: 20
        };
        
        this.score += scoreMultiplier[difficulty];
        document.getElementById('score').textContent = this.score;
        this.flippedCards = [];
        
        this.checkWin();
    }

    handleMismatch(card1, card2) {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.flippedCards = [];
        }, 1000);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('time').textContent = this.timer;
        }, 1000);
    }

    checkWin() {
        const matchedCards = document.querySelectorAll('.matched').length;
        if (matchedCards === this.cards.length) {
            clearInterval(this.timerInterval);
            this.gameStarted = false;
            
            const difficulty = document.getElementById('difficulty').value;
            const timeBonus = {
                easy: Math.max(0, 100 - this.timer),
                medium: Math.max(0, 150 - this.timer),
                hard: Math.max(0, 200 - this.timer)
            }[difficulty];
            
            const finalScore = this.score + timeBonus;
            
            setTimeout(() => {
                alert(`Congratulations! You Won!\nScore: ${finalScore}\nTime Bonus: ${timeBonus}\nTotal Time: ${this.timer}s\nMoves: ${this.moves}`);
                this.saveScore(finalScore);
            }, 500);
        }
    }

    saveScore(finalScore) {
        const scores = JSON.parse(localStorage.getItem('scores') || '[]');
        const difficulty = document.getElementById('difficulty').value;
        
        scores.push({
            score: finalScore,
            time: this.timer,
            moves: this.moves,
            difficulty: difficulty,
            date: new Date().toLocaleDateString()
        });

        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem('scores', JSON.stringify(scores.slice(0, 5)));
        
        this.displayLeaderboard();
    }

    displayLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('scores') || '[]');
        const leaderboard = document.getElementById('highScores');
        
        leaderboard.innerHTML = scores
            .map((score, index) => `
                <li>
                    #${index + 1} - Score: ${score.score} 
                    | Time: ${score.time}s 
                    | Moves: ${score.moves}
                    | Difficulty: ${score.difficulty}
                    | Date: ${score.date}
                </li>
            `)
            .join('');
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});