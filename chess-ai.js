// Chess AI with 3 difficulty levels using Minimax with Alpha-Beta Pruning
class ChessAI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.depths = { easy: 1, medium: 2, hard: 3 };
        this.nodesEvaluated = 0;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    getBestMove(engine) {
        this.nodesEvaluated = 0;
        const depth = this.depths[this.difficulty];
        const isMaximizing = engine.turn === 'white';

        let bestMove = null;
        let bestScore = isMaximizing ? -Infinity : Infinity;

        const moves = this.getAllMoves(engine, engine.turn);

        // Add randomness for easy mode
        if (this.difficulty === 'easy' && Math.random() < 0.3) {
            return moves[Math.floor(Math.random() * moves.length)];
        }

        // Shuffle moves for variety
        this.shuffleArray(moves);

        for (const move of moves) {
            const clone = engine.clone();
            clone.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);

            const score = this.minimax(clone, depth - 1, -Infinity, Infinity, !isMaximizing);

            if (isMaximizing) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
        }

        return bestMove;
    }

    minimax(engine, depth, alpha, beta, isMaximizing) {
        this.nodesEvaluated++;

        if (depth === 0 || engine.gameOver) {
            return this.evaluate(engine);
        }

        const color = isMaximizing ? 'white' : 'black';
        const moves = this.getAllMoves(engine, color);

        if (moves.length === 0) {
            if (engine.isInCheck(color)) {
                return isMaximizing ? -50000 : 50000;
            }
            return 0; // Stalemate
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const clone = engine.clone();
                clone.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
                const evalScore = this.minimax(clone, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const clone = engine.clone();
                clone.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
                const evalScore = this.minimax(clone, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    evaluate(engine) {
        let score = engine.evaluateBoard();

        // Mobility bonus
        const whiteMoves = this.countMoves(engine, 'white');
        const blackMoves = this.countMoves(engine, 'black');
        score += (whiteMoves - blackMoves) * 10;

        // Check bonus
        if (engine.isInCheck('black')) score += 50;
        if (engine.isInCheck('white')) score -= 50;

        return score;
    }

    countMoves(engine, color) {
        let count = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = engine.getPiece(r, c);
                if (piece && piece.color === color) {
                    count += engine.getValidMoves(r, c).length;
                }
            }
        }
        return count;
    }

    getAllMoves(engine, color) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = engine.getPiece(r, c);
                if (piece && piece.color === color) {
                    const validMoves = engine.getValidMoves(r, c);
                    for (const move of validMoves) {
                        moves.push({
                            fromRow: r,
                            fromCol: c,
                            toRow: move.row,
                            toCol: move.col,
                            type: move.type
                        });
                    }
                }
            }
        }
        return moves;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
