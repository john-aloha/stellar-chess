// Chess Engine - Complete chess game logic
class ChessEngine {
    constructor() {
        this.reset();
    }

    reset() {
        this.board = this.createInitialBoard();
        this.turn = 'white';
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.castlingRights = { whiteKing: true, whiteQueen: true, blackKing: true, blackQueen: true };
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.kings = { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } };
        this.gameOver = false;
        this.gameResult = null;
    }

    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

        for (let col = 0; col < 8; col++) {
            board[0][col] = { type: backRow[col], color: 'black' };
            board[1][col] = { type: 'pawn', color: 'black' };
            board[6][col] = { type: 'pawn', color: 'white' };
            board[7][col] = { type: backRow[col], color: 'white' };
        }
        return board;
    }

    getPiece(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        return this.board[row][col];
    }

    setPiece(row, col, piece) {
        this.board[row][col] = piece;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getValidMoves(row, col, checkKingSafety = true) {
        const piece = this.getPiece(row, col);
        if (!piece) return [];

        let moves = [];
        switch (piece.type) {
            case 'pawn': moves = this.getPawnMoves(row, col, piece.color); break;
            case 'rook': moves = this.getRookMoves(row, col, piece.color); break;
            case 'knight': moves = this.getKnightMoves(row, col, piece.color); break;
            case 'bishop': moves = this.getBishopMoves(row, col, piece.color); break;
            case 'queen': moves = this.getQueenMoves(row, col, piece.color); break;
            case 'king': moves = this.getKingMoves(row, col, piece.color, checkKingSafety); break;
        }

        if (checkKingSafety) {
            moves = moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col, piece.color));
        }
        return moves;
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Forward move
        if (this.isValidPosition(row + direction, col) && !this.getPiece(row + direction, col)) {
            moves.push({ row: row + direction, col, type: 'move' });
            // Double move from start
            if (row === startRow && !this.getPiece(row + 2 * direction, col)) {
                moves.push({ row: row + 2 * direction, col, type: 'move' });
            }
        }

        // Captures
        [-1, 1].forEach(dc => {
            const newCol = col + dc;
            if (this.isValidPosition(row + direction, newCol)) {
                const target = this.getPiece(row + direction, newCol);
                if (target && target.color !== color) {
                    moves.push({ row: row + direction, col: newCol, type: 'capture' });
                }
                // En passant
                if (this.enPassantTarget && this.enPassantTarget.row === row + direction && this.enPassantTarget.col === newCol) {
                    moves.push({ row: row + direction, col: newCol, type: 'enpassant' });
                }
            }
        });
        return moves;
    }

    getSlidingMoves(row, col, color, directions) {
        const moves = [];
        directions.forEach(([dr, dc]) => {
            let r = row + dr, c = col + dc;
            while (this.isValidPosition(r, c)) {
                const target = this.getPiece(r, c);
                if (!target) {
                    moves.push({ row: r, col: c, type: 'move' });
                } else if (target.color !== color) {
                    moves.push({ row: r, col: c, type: 'capture' });
                    break;
                } else {
                    break;
                }
                r += dr; c += dc;
            }
        });
        return moves;
    }

    getRookMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [[0, 1], [0, -1], [1, 0], [-1, 0]]);
    }

    getBishopMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    }

    getQueenMoves(row, col, color) {
        return [...this.getRookMoves(row, col, color), ...this.getBishopMoves(row, col, color)];
    }

    getKnightMoves(row, col, color) {
        const moves = [];
        const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        offsets.forEach(([dr, dc]) => {
            const r = row + dr, c = col + dc;
            if (this.isValidPosition(r, c)) {
                const target = this.getPiece(r, c);
                if (!target) {
                    moves.push({ row: r, col: c, type: 'move' });
                } else if (target.color !== color) {
                    moves.push({ row: r, col: c, type: 'capture' });
                }
            }
        });
        return moves;
    }

    getKingMoves(row, col, color, includeCastling = true) {
        const moves = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr, c = col + dc;
                if (this.isValidPosition(r, c)) {
                    const target = this.getPiece(r, c);
                    if (!target) {
                        moves.push({ row: r, col: c, type: 'move' });
                    } else if (target.color !== color) {
                        moves.push({ row: r, col: c, type: 'capture' });
                    }
                }
            }
        }

        if (includeCastling && !this.isInCheck(color)) {
            // Kingside
            const kingSide = color === 'white' ? 'whiteKing' : 'blackKing';
            const queenSide = color === 'white' ? 'whiteQueen' : 'blackQueen';
            const kingRow = color === 'white' ? 7 : 0;

            if (this.castlingRights[kingSide]) {
                if (!this.getPiece(kingRow, 5) && !this.getPiece(kingRow, 6) &&
                    !this.isSquareAttacked(kingRow, 5, color) && !this.isSquareAttacked(kingRow, 6, color)) {
                    moves.push({ row: kingRow, col: 6, type: 'castle-king' });
                }
            }
            // Queenside
            if (this.castlingRights[queenSide]) {
                if (!this.getPiece(kingRow, 1) && !this.getPiece(kingRow, 2) && !this.getPiece(kingRow, 3) &&
                    !this.isSquareAttacked(kingRow, 2, color) && !this.isSquareAttacked(kingRow, 3, color)) {
                    moves.push({ row: kingRow, col: 2, type: 'castle-queen' });
                }
            }
        }
        return moves;
    }

    isSquareAttacked(row, col, byColor) {
        const enemyColor = byColor === 'white' ? 'black' : 'white';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.getPiece(r, c);
                if (piece && piece.color === enemyColor) {
                    const moves = this.getValidMoves(r, c, false);
                    if (moves.some(m => m.row === row && m.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isInCheck(color) {
        const king = this.kings[color];
        return this.isSquareAttacked(king.row, king.col, color);
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Simulate move
        const piece = this.getPiece(fromRow, fromCol);
        const captured = this.getPiece(toRow, toCol);
        const oldKing = { ...this.kings[color] };

        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);
        if (piece.type === 'king') {
            this.kings[color] = { row: toRow, col: toCol };
        }

        const inCheck = this.isInCheck(color);

        // Restore
        this.setPiece(fromRow, fromCol, piece);
        this.setPiece(toRow, toCol, captured);
        this.kings[color] = oldKing;

        return inCheck;
    }

    makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece || piece.color !== this.turn) return { success: false };

        const validMoves = this.getValidMoves(fromRow, fromCol);
        const move = validMoves.find(m => m.row === toRow && m.col === toCol);
        if (!move) return { success: false };

        const moveRecord = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            captured: null,
            type: move.type,
            castling: null,
            enPassant: null,
            promotion: null
        };

        // Handle capture
        if (move.type === 'capture' || move.type === 'enpassant') {
            let capturedPiece;
            if (move.type === 'enpassant') {
                const captureRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
                capturedPiece = this.getPiece(captureRow, toCol);
                this.setPiece(captureRow, toCol, null);
                moveRecord.enPassant = { row: captureRow, col: toCol };
            } else {
                capturedPiece = this.getPiece(toRow, toCol);
            }
            this.capturedPieces[piece.color].push(capturedPiece);
            moveRecord.captured = capturedPiece;
        }

        // Move piece
        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);

        // Handle castling
        if (move.type === 'castle-king' || move.type === 'castle-queen') {
            const rookFromCol = move.type === 'castle-king' ? 7 : 0;
            const rookToCol = move.type === 'castle-king' ? 5 : 3;
            const rook = this.getPiece(toRow, rookFromCol);
            this.setPiece(toRow, rookToCol, rook);
            this.setPiece(toRow, rookFromCol, null);
            moveRecord.castling = { rookFrom: rookFromCol, rookTo: rookToCol };
        }

        // Update king position
        if (piece.type === 'king') {
            this.kings[piece.color] = { row: toRow, col: toCol };
            if (piece.color === 'white') {
                this.castlingRights.whiteKing = false;
                this.castlingRights.whiteQueen = false;
            } else {
                this.castlingRights.blackKing = false;
                this.castlingRights.blackQueen = false;
            }
        }

        // Update castling rights for rook moves
        if (piece.type === 'rook') {
            if (fromRow === 7 && fromCol === 0) this.castlingRights.whiteQueen = false;
            if (fromRow === 7 && fromCol === 7) this.castlingRights.whiteKing = false;
            if (fromRow === 0 && fromCol === 0) this.castlingRights.blackQueen = false;
            if (fromRow === 0 && fromCol === 7) this.castlingRights.blackKing = false;
        }

        // Update en passant target
        this.enPassantTarget = null;
        if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = { row: (fromRow + toRow) / 2, col: fromCol };
        }

        // Handle pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            const promoType = promotionPiece || 'queen';
            this.setPiece(toRow, toCol, { type: promoType, color: piece.color });
            moveRecord.promotion = promoType;
        }

        this.moveHistory.push(moveRecord);
        this.turn = this.turn === 'white' ? 'black' : 'white';

        // Check game state
        const result = { success: true, moveRecord, isCheck: false, isCheckmate: false, isStalemate: false };

        if (this.isInCheck(this.turn)) {
            result.isCheck = true;
            if (!this.hasLegalMoves(this.turn)) {
                result.isCheckmate = true;
                this.gameOver = true;
                this.gameResult = piece.color === 'white' ? 'white-wins' : 'black-wins';
            }
        } else if (!this.hasLegalMoves(this.turn)) {
            result.isStalemate = true;
            this.gameOver = true;
            this.gameResult = 'draw';
        }

        return result;
    }

    hasLegalMoves(color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.getPiece(r, c);
                if (piece && piece.color === color) {
                    if (this.getValidMoves(r, c).length > 0) return true;
                }
            }
        }
        return false;
    }

    undoMove() {
        if (this.moveHistory.length === 0) return false;

        const move = this.moveHistory.pop();

        // Restore piece
        let piece = { ...move.piece };
        if (move.promotion) {
            piece = { type: 'pawn', color: move.piece.color };
        }
        this.setPiece(move.from.row, move.from.col, piece);
        this.setPiece(move.to.row, move.to.col, null);

        // Restore captured piece
        if (move.captured) {
            if (move.enPassant) {
                this.setPiece(move.enPassant.row, move.enPassant.col, move.captured);
            } else {
                this.setPiece(move.to.row, move.to.col, move.captured);
            }
            this.capturedPieces[move.piece.color].pop();
        }

        // Restore castling
        if (move.castling) {
            const rook = this.getPiece(move.to.row, move.castling.rookTo);
            this.setPiece(move.to.row, move.castling.rookFrom, rook);
            this.setPiece(move.to.row, move.castling.rookTo, null);
        }

        // Restore king position
        if (move.piece.type === 'king') {
            this.kings[move.piece.color] = { row: move.from.row, col: move.from.col };
        }

        this.turn = move.piece.color;
        this.gameOver = false;
        this.gameResult = null;

        return true;
    }

    evaluateBoard() {
        const pieceValues = { pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000 };

        const pawnTable = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5, 5, 10, 25, 25, 10, 5, 5],
            [0, 0, 0, 20, 20, 0, 0, 0],
            [5, -5, -10, 0, 0, -10, -5, 5],
            [5, 10, 10, -20, -20, 10, 10, 5],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        const knightTable = [
            [-50, -40, -30, -30, -30, -30, -40, -50],
            [-40, -20, 0, 0, 0, 0, -20, -40],
            [-30, 0, 10, 15, 15, 10, 0, -30],
            [-30, 5, 15, 20, 20, 15, 5, -30],
            [-30, 0, 15, 20, 20, 15, 0, -30],
            [-30, 5, 10, 15, 15, 10, 5, -30],
            [-40, -20, 0, 5, 5, 0, -20, -40],
            [-50, -40, -30, -30, -30, -30, -40, -50]
        ];

        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.getPiece(r, c);
                if (piece) {
                    let value = pieceValues[piece.type];
                    const row = piece.color === 'white' ? r : 7 - r;

                    if (piece.type === 'pawn') value += pawnTable[row][c];
                    if (piece.type === 'knight') value += knightTable[row][c];

                    score += piece.color === 'white' ? value : -value;
                }
            }
        }
        return score;
    }

    clone() {
        const clone = new ChessEngine();
        clone.board = this.board.map(row => row.map(cell => cell ? { ...cell } : null));
        clone.turn = this.turn;
        clone.castlingRights = { ...this.castlingRights };
        clone.enPassantTarget = this.enPassantTarget ? { ...this.enPassantTarget } : null;
        clone.kings = { white: { ...this.kings.white }, black: { ...this.kings.black } };
        clone.capturedPieces = {
            white: [...this.capturedPieces.white],
            black: [...this.capturedPieces.black]
        };
        return clone;
    }
}
