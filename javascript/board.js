class Board {
    constructor(game) {
        this.data  = [];
        this.game = game;

        this.buildBoard();
    }

    buildBoard() {
        let color = "white";
        let col = ["a", "b", "c", "d", "e", "f", "g", "h"];
	    let row = [8, 7, 6, 5, 4, 3, 2, 1];

        const swap = function () {
            return color = color == "white" ? "black" : "white";  
        };

        for(let i=0; i<8; i++) {
            const squares = [];
            for(let j=0; j<8; j++) {
                let letter = col[j];
                let number = row[i];
                let cordinates = {x: i, y: j};
                let square = new Square(color, cordinates, letter, number, this.game);
                squares.push(square);
                swap();
            }
            this.data.push(squares);
            swap();
        }
    }

    setPiecesDefault(callback) {
        const board = this;
        const game = this.game;
        const players = game.data.players;

        const set = function (piece) {
            const letter = piece.data.letter;
            const number = piece.data.number;
            const square = board.getSquare(letter, number);
            square.piece = piece;
            piece.square = square;
            square.data.div.appendChild(piece.data.image);
        }

        players.forEach((player) => player.data.pieces.forEach(set));

        if(game.data.players[0].isComputer) {
            let board = this;

            setTimeout(() => {
                let fen = board.getFEN();
                getStockfishMove(fen, function (suggestedMove) {
                    let piece = board.getSquare(suggestedMove.charAt(0), suggestedMove.charAt(1)).piece;
                    let coords = board.getCoordinates(suggestedMove.charAt(2), suggestedMove.charAt(3));
        
                    piece.move(coords, true);
                });
            }, 500);
        }
    }

    getSquare(letter, number) {
        let {x, y} = this.getCoordinates(letter, number);
        return this.data[x][y];
    }

    getCoordinates(letter, number) {
        return {x: 8-number, y: letter.charCodeAt(0)-97};
    }

    isValidIndex(x, y, color) {
        if(x<0 || y<0 || x>=8 || y>=8) return false;
        const sqPiece = this.data[x][y].piece;
        if(sqPiece && sqPiece.data.color == color) return false;
        return true;
    }

    isEnemy(x, y, color) {
        const sqPiece = this.data[x][y].piece;
        if(sqPiece){
            return sqPiece.data.color != color;
        }
        return false;
    }

    isCheckmate() {
        let playerPieces = this.game.data.turn.data.pieces;

        for (let i = 0; i < playerPieces.length; i++) {
            const piece = playerPieces[i];
            if(this.setSquarePossibilities(piece, true, true).length > 0) {
                return false;
            }
        }
        return true;
    }

    setSquarePossibilities(piece, checkKingSafty, returnOnlyPossible) {
        let square = this.getSquare(piece.data.letter, piece.data.number);
        let pieceName = piece.data.name;
        let allPosibilities = [];
        let color = piece.data.color;
        let player = piece.data.player;
        let {x, y} = square.data.cordinates;
        let game = this.game;
        let board = this;
        let opponent=null;
        if(game.data.players[0] == player) opponent = game.data.players[1];
        else opponent = game.data.players[0];

        this.removeAllPossibilities();

        const Pattern = {
            Bishop: function () {
                for (let i = 1; i < 8; i++) {
                    if(board.isValidIndex(x+i, y+i, color)) {
                        allPosibilities.push(board.data[x+i][y+i]);
                        if(board.isEnemy(x+i, y+i, color)) break;
                    }else break;
                }
                for (let i = 1; i < 8; i++) {
                    if(board.isValidIndex(x-i, y-i, color)) {
                        allPosibilities.push(board.data[x-i][y-i]);
                        if(board.isEnemy(x-i, y-i, color)) break;
                    }else break;
                }
                for (let i = 1; i < 8; i++) {
                    if(board.isValidIndex(x-i, y+i, color)) {
                        allPosibilities.push(board.data[x-i][y+i]);
                        if(board.isEnemy(x-i, y+i, color)) break;
                    }else break;
                }
                for (let i = 1; i < 8; i++) {
                    if(board.isValidIndex(x+i, y-i, color)) {
                        allPosibilities.push(board.data[x+i][y-i]);
                        if(board.isEnemy(x+i, y-i, color)) break;
                    }else break;
                }
            },
            Rook: function () {
                for (let i = 1; i < 8; i++) {
                    if(board.isValidIndex(x+i, y, color)) {
                        allPosibilities.push(board.data[x+i][y]);
                        if(board.isEnemy(x+i, y, color)) break;
                    }else break;
                }
                for (let i = 1; i < 8; i++) {
                    if(board.isValidIndex(x-i, y, color)) {
                        allPosibilities.push(board.data[x-i][y]);
                        if(board.isEnemy(x-i, y, color)) break;
                    }else break;
                }
                for (let i = 1; i < 8; i++) {
                    if(board.isValidIndex(x, y+i, color)) {
                        allPosibilities.push(board.data[x][y+i]);
                        if(board.isEnemy(x, y+i, color)) break;
                    }else break;
                }
                for (let i = 1; i < 8; i++) {
                    if(board.isValidIndex(x, y-i, color)) {
                        allPosibilities.push(board.data[x][y-i]);
                        if(board.isEnemy(x, y-i, color)) break;
                    }else break;
                }
            }
        };

        if(pieceName == "Pawn") {
            if(color == "white") {
                if(this.isValidIndex(x-1, y) && !this.data[x-1][y].piece) {
                    allPosibilities.push(this.data[x-1][y]);
                    if(piece.data.isFastPawn && !this.data[x-2][y].piece) allPosibilities.push(this.data[x-2][y]);
                }
                if(this.isValidIndex(x-1, y-1, color) && this.isEnemy(x-1, y-1, color)) allPosibilities.push(this.data[x-1][y-1]);
                if(this.isValidIndex(x-1, y+1, color) && this.isEnemy(x-1, y+1, color)) allPosibilities.push(this.data[x-1][y+1]);

                
                let lastMove = opponent.data.moves[opponent.data.moves.length-1];
                if (lastMove) {
                    let moveRow = parseInt(lastMove.charAt(lastMove.length-1));
                    let moveCol = lastMove.charAt(lastMove.length-2);
                    let pieceName = lastMove.substring(0, 4);
                    let col = moveCol.charCodeAt(0)-97;
                    if(x == 3 && moveRow == 5 && pieceName == "Pawn" && Math.abs(col-y)==1){
                        let sq = this.getSquare(moveCol, moveRow+1);
                        allPosibilities.push(sq);
                        sq.data.enPassant = true;
                    }
                }
            }else {
                if(this.isValidIndex(x+1, y) && !this.data[x+1][y].piece) {
                    allPosibilities.push(this.data[x+1][y]);
                    if(piece.data.isFastPawn && !this.data[x+2][y].piece) allPosibilities.push(this.data[x+2][y]);
                }
                if(this.isValidIndex(x+1, y-1, color) && this.isEnemy(x+1, y-1, color)) allPosibilities.push(this.data[x+1][y-1]);
                if(this.isValidIndex(x+1, y+1, color) && this.isEnemy(x+1, y+1, color)) allPosibilities.push(this.data[x+1][y+1]);

                let lastMove = opponent.data.moves[opponent.data.moves.length-1];
                if (lastMove) {
                    let moveRow = parseInt(lastMove.charAt(lastMove.length-1));
                    let moveCol = lastMove.charAt(lastMove.length-2);
                    let pieceName = lastMove.substring(0, 4);
                    let col = moveCol.charCodeAt(0)-97;
                    if(x == 4 && moveRow == 4 && pieceName == "Pawn" && Math.abs(col-y)==1){
                        let sq = this.getSquare(moveCol, moveRow-1);
                        allPosibilities.push(sq);
                        sq.data.enPassant = true;
                    }
                }
            }
        }else if(pieceName == "Knight") {
            if(this.isValidIndex(x-2, y-1, color)) allPosibilities.push(this.data[x-2][y-1]);
            if(this.isValidIndex(x-2, y+1, color)) allPosibilities.push(this.data[x-2][y+1]);
            if(this.isValidIndex(x-1, y-2, color)) allPosibilities.push(this.data[x-1][y-2]);
            if(this.isValidIndex(x-1, y+2, color)) allPosibilities.push(this.data[x-1][y+2]);
            if(this.isValidIndex(x+1, y-2, color)) allPosibilities.push(this.data[x+1][y-2]);
            if(this.isValidIndex(x+1, y+2, color)) allPosibilities.push(this.data[x+1][y+2]);
            if(this.isValidIndex(x+2, y-1, color)) allPosibilities.push(this.data[x+2][y-1]);
            if(this.isValidIndex(x+2, y+1, color)) allPosibilities.push(this.data[x+2][y+1]);
        }else if(pieceName == "King") {
            if(this.isValidIndex(x-1, y-1, color)) allPosibilities.push(this.data[x-1][y-1]);
            if(this.isValidIndex(x-1, y, color)) allPosibilities.push(this.data[x-1][y]);
            if(this.isValidIndex(x-1, y+1, color)) allPosibilities.push(this.data[x-1][y+1]);
            if(this.isValidIndex(x+1, y-1, color)) allPosibilities.push(this.data[x+1][y-1]);
            if(this.isValidIndex(x+1, y, color)) allPosibilities.push(this.data[x+1][y]);
            if(this.isValidIndex(x+1, y+1, color)) allPosibilities.push(this.data[x+1][y+1]);
            if(this.isValidIndex(x, y-1, color)) allPosibilities.push(this.data[x][y-1]);
            if(this.isValidIndex(x, y+1, color)) allPosibilities.push(this.data[x][y+1]);
            if(piece.data.canCastle) {
                if(color == "white") {
                    if(!this.data[7][5].piece && !this.data[7][6].piece && this.data[7][7].piece && this.data[7][7].piece.data.canCastle){
                        allPosibilities.push(this.data[7][6]);
                    }
                    if(!this.data[7][1].piece && !this.data[7][2].piece && !this.data[7][3].piece && this.data[7][0].piece && this.data[7][0].piece.data.canCastle){
                        allPosibilities.push(this.data[7][2]);
                    }
                }else{
                    if(!this.data[0][5].piece && !this.data[0][6].piece && this.data[0][7].piece && this.data[0][7].piece.data.canCastle){
                        allPosibilities.push(this.data[0][6]);
                    }
                    if(!this.data[0][1].piece && !this.data[0][2].piece && !this.data[0][3].piece && this.data[0][0].piece && this.data[0][0].piece.data.canCastle){
                        allPosibilities.push(this.data[0][2]);
                    }
                }
            }
        }else if(pieceName == "Bishop") {
            Pattern["Bishop"].call();
        }else if(pieceName == "Rook") {
            Pattern["Rook"].call();
        }else if(pieceName == "Queen") {
            Pattern["Bishop"].call();
            Pattern["Rook"].call();
        }

        const removeDuplicates = function (arr) {
            return arr.filter((item,
                index) => arr.indexOf(item) === index);
        }

        allPosibilities = removeDuplicates(allPosibilities);
        
        const isCheckingKing = function (allPoss) {
            let ans = false;
            allPoss.forEach((sq) => {
                if(sq.piece && sq.piece.data.name == "King") ans = true;
            });
            return ans;
        }

        if(checkKingSafty) {
            let opponentPieces = opponent.data.pieces;
            for (let i = 0; i < allPosibilities.length; i++) {
                let possibleSq = allPosibilities[i];
                let prevSq = piece.square;
                let prevPiece = possibleSq.piece ? possibleSq.piece : null;
                let pieceAtPosSq = null;

                piece.square = possibleSq;
                prevSq.piece = null;
                possibleSq.piece = piece;

                if(prevPiece) opponentPieces = opponentPieces.filter(function(p) { return p != prevPiece; }); 

                let len = opponentPieces.length;
                for (let j = 0; j < len; j++) {
                    const opponentPiece = opponentPieces[j];
                    let opponentPiecePossibilities = board.setSquarePossibilities(opponentPiece, false);
                    if(isCheckingKing(opponentPiecePossibilities)) {
                        possibleSq.data.toRemoveFromPossible = true;
                    }
                }

                if(prevPiece) opponentPieces.push(prevPiece);

                prevSq.piece = piece;
                piece.square = prevSq;
                possibleSq.piece = prevPiece;
            }

            allPosibilities = allPosibilities.filter(sq => !sq.data.toRemoveFromPossible);

        }else return allPosibilities;

        if(returnOnlyPossible) return allPosibilities;

        this.showPossibilities(allPosibilities);
    }

    removeAllPossibilities() {
        for (let squares of this.data) {
            for (let square of squares) {
                const div = square.data.div;
                div.classList.remove("move");
            }
        }
    }

    setToRemovePossibilitiesToFalse() {
        for (let squares of this.data) {
            for (let square of squares) {
                square.data.toRemoveFromPossible = false;
            }
        }
    }

    showPossibilities(allPosibilities) {
        allPosibilities.forEach((sq) => {
            sq.data.div.classList.add("move");
        })
    }

    getAlias(sq) {
        let alias = sq.data.letter + sq.data.number;
        return alias;
    }

    getFEN() {
        let board = this;
        let data = this.data;
        let turn = this.game.data.turn.data.color.charAt(0);

        let fen = "";

        let getInitial = function (piece) {
            let alias = piece.data.alias;
            return alias[0] == 'w' ? alias.toUpperCase().charAt(1) : alias.charAt(1);
        }

        for (let i = 0; i < 8; i++) {
            let row = "";
            let gap = 0;
            for (let j = 0; j < 8; j++) {
                let piece = data[i][j].piece;
                if(!piece) gap++;
                else {
                    if(gap>0){
                        row += gap;
                        gap=0;
                    }
                    row+=getInitial(piece);
                }
            }
            if(gap>0) row+=gap;
            row+='/';
            fen+=row;
        }
        fen+=" "+turn;
        return fen;
    }
}