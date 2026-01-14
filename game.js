// Game Controller - Main game logic, UI, and scoring system
class StellarChess {
    constructor() {
        this.engine = new ChessEngine();
        this.ai = new ChessAI();
        this.selectedSquare = null;
        this.validMoves = [];
        this.gameMode = null; // 'ai' or 'pvp'
        this.playerColor = 'white';
        this.difficulty = 'medium';
        this.isPlayerTurn = true;
        this.moveCount = 0;
        this.gameStartTime = null;
        this.timerInterval = null;
        this.playerTime = 600;
        this.opponentTime = 600;
        this.showHints = true;
        this.pendingPromotion = null;

        // Scoring & Stats
        this.stats = this.loadStats();
        this.ranks = [
            { name: 'CADET', xp: 0 },
            { name: 'ENSIGN', xp: 500 },
            { name: 'LIEUTENANT', xp: 1500 },
            { name: 'COMMANDER', xp: 3000 },
            { name: 'CAPTAIN', xp: 5000 },
            { name: 'ADMIRAL', xp: 8000 },
            { name: 'FLEET ADMIRAL', xp: 12000 },
            { name: 'GALACTIC SUPREME', xp: 20000 }
        ];

        this.xpRewards = { easy: 50, medium: 100, hard: 200 };
        this.pieceSymbols = {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateMenuStats();
        this.loadSettings();
    }

    loadStats() {
        const saved = localStorage.getItem('stellarChessStats');
        return saved ? JSON.parse(saved) : { xp: 0, wins: 0, losses: 0, draws: 0, totalGames: 0 };
    }

    saveStats() {
        localStorage.setItem('stellarChessStats', JSON.stringify(this.stats));
    }

    loadSettings() {
        const saved = localStorage.getItem('stellarChessSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            document.getElementById('toggle-sfx').checked = settings.sfx !== false;
            document.getElementById('toggle-music').checked = settings.music !== false;
            document.getElementById('toggle-hints').checked = settings.hints !== false;
            document.getElementById('volume-slider').value = settings.volume || 70;

            audioManager.setSfxEnabled(settings.sfx !== false);
            audioManager.setMusicEnabled(settings.music !== false);
            audioManager.setVolume((settings.volume || 70) / 100);
            this.showHints = settings.hints !== false;
        }
    }

    saveSettings() {
        const settings = {
            sfx: document.getElementById('toggle-sfx').checked,
            music: document.getElementById('toggle-music').checked,
            hints: document.getElementById('toggle-hints').checked,
            volume: parseInt(document.getElementById('volume-slider').value)
        };
        localStorage.setItem('stellarChessSettings', JSON.stringify(settings));
    }

    getCurrentRank() {
        for (let i = this.ranks.length - 1; i >= 0; i--) {
            if (this.stats.xp >= this.ranks[i].xp) return this.ranks[i];
        }
        return this.ranks[0];
    }

    getNextRank() {
        const current = this.getCurrentRank();
        const idx = this.ranks.findIndex(r => r.name === current.name);
        return idx < this.ranks.length - 1 ? this.ranks[idx + 1] : null;
    }

    updateMenuStats() {
        document.getElementById('menu-rank').textContent = this.getCurrentRank().name;
        document.getElementById('menu-xp').textContent = this.stats.xp;
        document.getElementById('menu-wins').textContent = this.stats.wins;
        document.getElementById('stat-total-games').textContent = this.stats.totalGames;
        document.getElementById('stat-wins').textContent = this.stats.wins;
        document.getElementById('stat-losses').textContent = this.stats.losses;
    }

    updateXPDisplay() {
        const current = this.getCurrentRank();
        const next = this.getNextRank();
        const xpForCurrent = current.xp;
        const xpForNext = next ? next.xp : current.xp + 1000;
        const progress = ((this.stats.xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100;

        document.getElementById('xp-fill').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('xp-text').textContent = `${this.stats.xp} / ${xpForNext} XP`;
        document.getElementById('current-rank').textContent = current.name;
        document.getElementById('player-rank').textContent = current.name;
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        audioManager.playButtonClick();
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    bindEvents() {
        // Menu buttons
        document.getElementById('btn-vs-computer').addEventListener('click', () => {
            this.showScreen('difficulty-screen');
        });

        document.getElementById('btn-two-player').addEventListener('click', () => {
            this.gameMode = 'pvp';
            this.startGame();
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            this.showScreen('settings-screen');
        });

        // Back buttons
        document.getElementById('btn-back-difficulty').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('btn-back-settings').addEventListener('click', () => {
            this.saveSettings();
            this.showScreen('main-menu');
        });

        // Difficulty selection
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.difficulty = card.dataset.difficulty;
                audioManager.playSelect();
            });
        });

        // Color selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.playerColor = btn.dataset.color;
                audioManager.playSelect();
            });
        });

        // Start game
        document.getElementById('btn-start-vs-ai').addEventListener('click', () => {
            this.gameMode = 'ai';
            this.ai.setDifficulty(this.difficulty);
            this.startGame();
        });

        // Game controls
        document.getElementById('btn-undo').addEventListener('click', () => this.undoMove());
        document.getElementById('btn-pause').addEventListener('click', () => this.showModal('pause-modal'));
        document.getElementById('btn-resign').addEventListener('click', () => this.resign());
        document.getElementById('btn-menu').addEventListener('click', () => this.showModal('pause-modal'));

        // Modal buttons
        document.getElementById('btn-resume').addEventListener('click', () => this.hideModal('pause-modal'));
        document.getElementById('btn-quit-game').addEventListener('click', () => {
            this.hideModal('pause-modal');
            this.endGame();
            this.showScreen('main-menu');
        });

        document.getElementById('btn-play-again').addEventListener('click', () => {
            this.hideModal('game-over-modal');
            this.startGame();
        });

        document.getElementById('btn-main-menu').addEventListener('click', () => {
            this.hideModal('game-over-modal');
            this.showScreen('main-menu');
        });

        // Settings
        document.getElementById('toggle-sfx').addEventListener('change', (e) => {
            audioManager.setSfxEnabled(e.target.checked);
            this.saveSettings();
        });

        document.getElementById('toggle-music').addEventListener('change', (e) => {
            audioManager.setMusicEnabled(e.target.checked);
            this.saveSettings();
        });

        document.getElementById('toggle-hints').addEventListener('change', (e) => {
            this.showHints = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('volume-slider').addEventListener('input', (e) => {
            audioManager.setVolume(parseInt(e.target.value) / 100);
            this.saveSettings();
        });

        document.getElementById('btn-reset-stats').addEventListener('click', () => {
            if (confirm('Reset all statistics?')) {
                this.stats = { xp: 0, wins: 0, losses: 0, draws: 0, totalGames: 0 };
                this.saveStats();
                this.updateMenuStats();
            }
        });
    }

    startGame() {
        this.engine.reset();
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveCount = 0;
        this.gameStartTime = Date.now();
        this.playerTime = 600;
        this.opponentTime = 600;

        this.showScreen('game-screen');
        this.renderBoard();
        this.updateGameUI();
        this.updateXPDisplay();

        // Set up player info
        if (this.gameMode === 'ai') {
            document.getElementById('opponent-icon').textContent = '🤖';
            document.getElementById('opponent-name').textContent = 'AI ' + this.difficulty.toUpperCase();
            document.getElementById('opponent-rank').textContent =
                this.difficulty === 'easy' ? 'ENSIGN' : this.difficulty === 'medium' ? 'COMMANDER' : 'ADMIRAL';

            // AI plays the opposite color
            this.aiColor = this.playerColor === 'white' ? 'black' : 'white';
            this.isPlayerTurn = this.playerColor === 'white';
            if (!this.isPlayerTurn) {
                setTimeout(() => this.makeAIMove(), 500);
            }
        } else {
            document.getElementById('opponent-icon').textContent = '👤';
            document.getElementById('opponent-name').textContent = 'PLAYER 2';
            document.getElementById('opponent-rank').textContent = this.getCurrentRank().name;
        }

        audioManager.playGameStart();
        this.startTimer();
    }

    renderBoard() {
        const board = document.getElementById('chess-board');
        board.innerHTML = '';

        // Flip board if player is black (so player's pieces are at bottom)
        const flipped = this.gameMode === 'ai' && this.playerColor === 'black';

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                // Calculate actual board position based on flip
                const row = flipped ? 7 - i : i;
                const col = flipped ? 7 - j : j;

                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = this.engine.getPiece(row, col);
                if (piece) {
                    const pieceEl = document.createElement('span');
                    pieceEl.className = `piece ${piece.color}`;
                    pieceEl.textContent = this.pieceSymbols[piece.color][piece.type];
                    square.appendChild(pieceEl);
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                board.appendChild(square);
            }
        }

        this.highlightLastMove();
        this.highlightCheck();
    }

    handleSquareClick(row, col) {
        if (this.engine.gameOver) return;
        if (this.gameMode === 'ai' && !this.isPlayerTurn) return;
        if (this.pendingPromotion) return;

        const piece = this.engine.getPiece(row, col);

        // If a piece is selected and clicking on valid move
        if (this.selectedSquare) {
            const validMove = this.validMoves.find(m => m.row === row && m.col === col);

            if (validMove) {
                // Check for pawn promotion
                const selectedPiece = this.engine.getPiece(this.selectedSquare.row, this.selectedSquare.col);
                if (selectedPiece.type === 'pawn' && (row === 0 || row === 7)) {
                    this.pendingPromotion = { from: this.selectedSquare, to: { row, col } };
                    this.showPromotionModal(selectedPiece.color);
                    return;
                }

                this.executeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                return;
            }
        }

        // Select new piece
        if (piece && piece.color === this.engine.turn) {
            if (this.gameMode === 'ai' && piece.color !== this.playerColor) return;

            this.selectedSquare = { row, col };
            this.validMoves = this.engine.getValidMoves(row, col);
            this.renderBoard();
            this.highlightSelectedAndMoves();
            audioManager.playSelect();
        } else {
            this.clearSelection();
        }
    }

    executeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
        const result = this.engine.makeMove(fromRow, fromCol, toRow, toCol, promotionPiece);

        if (result.success) {
            this.moveCount++;
            this.clearSelection();
            this.renderBoard();
            this.updateGameUI();

            // Play sounds
            if (result.isCheckmate) {
                audioManager.playCheckmate();
            } else if (result.isCheck) {
                audioManager.playCheck();
            } else if (result.moveRecord.captured) {
                audioManager.playCapture();
            } else if (result.moveRecord.castling) {
                audioManager.playCastle();
            } else if (result.moveRecord.promotion) {
                audioManager.playPromotion();
            } else {
                audioManager.playMove();
            }

            // Check game over
            if (result.isCheckmate || result.isStalemate) {
                this.handleGameOver(result);
                return;
            }

            // AI move
            if (this.gameMode === 'ai') {
                this.isPlayerTurn = !this.isPlayerTurn;
                if (!this.isPlayerTurn) {
                    setTimeout(() => this.makeAIMove(), 500);
                }
            }
        }
    }

    makeAIMove() {
        if (this.engine.gameOver) return;

        // Only make AI move if it's actually the AI's turn
        if (this.engine.turn !== this.aiColor) return;

        const move = this.ai.getBestMove(this.engine);
        if (move) {
            this.executeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
        }
    }

    showPromotionModal(color) {
        const container = document.getElementById('promotion-pieces');
        container.innerHTML = '';

        ['queen', 'rook', 'bishop', 'knight'].forEach(type => {
            const pieceEl = document.createElement('div');
            pieceEl.className = 'promotion-piece';
            pieceEl.textContent = this.pieceSymbols[color][type];
            pieceEl.addEventListener('click', () => {
                this.hideModal('promotion-modal');
                const promo = this.pendingPromotion;
                this.pendingPromotion = null;
                this.executeMove(promo.from.row, promo.from.col, promo.to.row, promo.to.col, type);
            });
            container.appendChild(pieceEl);
        });

        this.showModal('promotion-modal');
    }

    highlightSelectedAndMoves() {
        if (!this.selectedSquare) return;

        const squares = document.querySelectorAll('.square');
        squares.forEach(sq => {
            const row = parseInt(sq.dataset.row);
            const col = parseInt(sq.dataset.col);

            if (row === this.selectedSquare.row && col === this.selectedSquare.col) {
                sq.classList.add('selected');
            }

            if (this.showHints) {
                const move = this.validMoves.find(m => m.row === row && m.col === col);
                if (move) {
                    sq.classList.add(move.type === 'capture' || move.type === 'enpassant' ? 'can-capture' : 'valid-move');
                }
            }
        });
    }

    highlightLastMove() {
        if (this.engine.moveHistory.length === 0) return;

        const lastMove = this.engine.moveHistory[this.engine.moveHistory.length - 1];
        const squares = document.querySelectorAll('.square');

        squares.forEach(sq => {
            const row = parseInt(sq.dataset.row);
            const col = parseInt(sq.dataset.col);

            if ((row === lastMove.from.row && col === lastMove.from.col) ||
                (row === lastMove.to.row && col === lastMove.to.col)) {
                sq.classList.add('last-move');
            }
        });
    }

    highlightCheck() {
        if (!this.engine.isInCheck(this.engine.turn)) return;

        const king = this.engine.kings[this.engine.turn];
        const squares = document.querySelectorAll('.square');

        squares.forEach(sq => {
            const row = parseInt(sq.dataset.row);
            const col = parseInt(sq.dataset.col);

            if (row === king.row && col === king.col) {
                sq.classList.add('check');
            }
        });
    }

    clearSelection() {
        this.selectedSquare = null;
        this.validMoves = [];
        this.renderBoard();
    }

    updateGameUI() {
        document.getElementById('turn-indicator').textContent = this.engine.turn.toUpperCase();

        // Update captured pieces
        const playerCaptured = document.getElementById('player-captured');
        const opponentCaptured = document.getElementById('opponent-captured');

        playerCaptured.innerHTML = '';
        opponentCaptured.innerHTML = '';

        const playerColor = this.gameMode === 'ai' ? this.playerColor : 'white';
        const opponentColor = playerColor === 'white' ? 'black' : 'white';

        this.engine.capturedPieces[playerColor].forEach(p => {
            const span = document.createElement('span');
            span.textContent = this.pieceSymbols[opponentColor][p.type];
            playerCaptured.appendChild(span);
        });

        this.engine.capturedPieces[opponentColor].forEach(p => {
            const span = document.createElement('span');
            span.textContent = this.pieceSymbols[playerColor][p.type];
            opponentCaptured.appendChild(span);
        });

        // Update game message
        const message = document.getElementById('game-message');
        if (this.engine.isInCheck(this.engine.turn)) {
            message.textContent = 'CHECK!';
        } else {
            message.textContent = '';
        }

        // Update active player panel
        const isWhiteTurn = this.engine.turn === 'white';
        const topPanel = document.querySelector('.top-panel');
        const bottomPanel = document.querySelector('.bottom-panel');

        if (this.gameMode === 'ai') {
            if ((this.playerColor === 'white' && isWhiteTurn) || (this.playerColor === 'black' && !isWhiteTurn)) {
                bottomPanel.classList.add('active');
                topPanel.classList.remove('active');
            } else {
                topPanel.classList.add('active');
                bottomPanel.classList.remove('active');
            }
        } else {
            if (isWhiteTurn) {
                bottomPanel.classList.add('active');
                topPanel.classList.remove('active');
            } else {
                topPanel.classList.add('active');
                bottomPanel.classList.remove('active');
            }
        }
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            if (this.engine.gameOver) return;

            if (this.gameMode === 'ai') {
                if (this.isPlayerTurn) {
                    this.playerTime--;
                } else {
                    this.opponentTime--;
                }
            } else {
                if (this.engine.turn === 'white') {
                    this.playerTime--;
                } else {
                    this.opponentTime--;
                }
            }

            this.updateTimerDisplay();

            if (this.playerTime <= 0 || this.opponentTime <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const formatTime = (seconds) => {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m}:${s.toString().padStart(2, '0')}`;
        };

        document.getElementById('player-timer').textContent = formatTime(this.playerTime);
        document.getElementById('opponent-timer').textContent = formatTime(this.opponentTime);
    }

    handleTimeout() {
        clearInterval(this.timerInterval);
        this.engine.gameOver = true;

        const playerWon = this.opponentTime <= 0;
        this.engine.gameResult = playerWon ? 'white-wins' : 'black-wins';

        this.handleGameOver({
            isCheckmate: false,
            isStalemate: false,
            timeout: true,
            playerWon
        });
    }

    handleGameOver(result) {
        clearInterval(this.timerInterval);

        let title, message, icon, xpEarned = 0;
        const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);

        if (result.isStalemate) {
            title = 'STALEMATE';
            message = 'The battle ends in a draw!';
            icon = '🤝';
            this.stats.draws++;
            xpEarned = Math.floor(this.xpRewards[this.difficulty] / 2);
        } else {
            const playerWon = this.didPlayerWin();

            if (playerWon) {
                title = 'VICTORY';
                message = result.isCheckmate ? 'Checkmate! The galaxy is yours!' : 'Your opponent ran out of time!';
                icon = '🏆';
                this.stats.wins++;
                xpEarned = this.xpRewards[this.difficulty];
            } else {
                title = 'DEFEAT';
                message = result.isCheckmate ? 'Checkmate! Your fleet has fallen.' : 'Time has run out!';
                icon = '💀';
                this.stats.losses++;
                xpEarned = Math.floor(this.xpRewards[this.difficulty] / 4);
            }
        }

        this.stats.totalGames++;
        this.stats.xp += xpEarned;
        this.saveStats();
        this.updateMenuStats();

        // Show result modal
        document.getElementById('result-icon').textContent = icon;
        document.getElementById('result-title').textContent = title;
        document.getElementById('result-message').textContent = message;
        document.getElementById('result-moves').textContent = this.moveCount;
        document.getElementById('result-time').textContent = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`;
        document.getElementById('result-xp').textContent = `+${xpEarned}`;

        if (title === 'VICTORY') {
            audioManager.playVictory();
        } else if (title === 'DEFEAT') {
            audioManager.playDefeat();
        }

        setTimeout(() => this.showModal('game-over-modal'), 500);
    }

    didPlayerWin() {
        const winner = this.engine.gameResult;
        if (!winner || winner === 'draw') return false;

        const winnerColor = winner === 'white-wins' ? 'white' : 'black';

        if (this.gameMode === 'ai') {
            return winnerColor === this.playerColor;
        }
        return winnerColor === 'white'; // In PvP, player 1 is white
    }

    undoMove() {
        if (this.gameMode === 'ai') {
            // Undo both AI and player move
            if (this.engine.undoMove()) {
                this.engine.undoMove();
                this.moveCount -= 2;
            }
        } else {
            if (this.engine.undoMove()) {
                this.moveCount--;
            }
        }

        this.clearSelection();
        this.updateGameUI();
        audioManager.playButtonClick();
    }

    resign() {
        if (confirm('Are you sure you want to resign?')) {
            this.engine.gameOver = true;
            this.engine.gameResult = this.gameMode === 'ai'
                ? (this.playerColor === 'white' ? 'black-wins' : 'white-wins')
                : (this.engine.turn === 'white' ? 'black-wins' : 'white-wins');

            this.handleGameOver({ isCheckmate: false, isStalemate: false });
        }
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.engine.reset();
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new StellarChess();
});
