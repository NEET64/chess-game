class Piece {
    constructor(name, alias, color, letter, number, index, player, game) {
        this.data = {
            name, alias, color, letter, number, index, player, game,
            isFastPawn: name == "Pawn",
            canCastle: name == "King" || name == "Rook",
            image: null
        };

        this.buildPiece();
        this.listener();
    }

    buildPiece() {
        let image = new Image();
        image.src = `./pieces/${this.data.alias}.png`;
        image.className = "chessboard-piece";

        this.data.image = image;
    }

    listener() {
		const piece = this;
		const game = piece.data.game; 
		const element = piece.data.image;
		const board = game.data.board;
        let elemBelow, droppableBelow;
        let current = null;
        let player = piece.data.player;

		const mousedown = function (event) {
			const move = function (pageX, pageY) {
				element.style.cursor = "grabbing";
				element.style.left = pageX - element.offsetWidth / 2 + "px";
				element.style.top = pageY - element.offsetHeight / 2 + "px";
			};

			const mousemove = function (event) {
				move(event.pageX, event.pageY);

                element.hidden = true; // hide the element so it will not affect searching point
				elemBelow = document.elementFromPoint(event.clientX, event.clientY); // search from point x and y
				element.hidden = false; // then show again

                if(!elemBelow) return;

				droppableBelow = elemBelow.closest(".chessboard-square");

				if (current != droppableBelow) current = droppableBelow;
			};
			const drop = function () {
				document.removeEventListener("mousemove", mousemove);
				element.removeAttribute("style");

                if(!current) return;

                let cords = JSON.parse(current.getAttribute("cordinates"));

				piece.move(cords);
			};

			const setStyle = function () {
				element.style.position = "absolute";
				element.style.zIndex = 1000;
			};

			const manageListener = function () {
				element.onmouseup = drop;

				element.ondragstart = function () {
					return false;
				};

				document.addEventListener("mousemove", mousemove);
			};

            
			if (game.data.turn != player) return false;

			setStyle();
			manageListener();
			move(event.pageX, event.pageY);


            player.data.currentPiece = piece;
            board.setToRemovePossibilitiesToFalse();
            board.setSquarePossibilities(piece, true);
            
            // console.log(piece.square.data.cordinates);
		};

		element.addEventListener("mousedown", mousedown);
	}

    move(cordinates) {
        let {x, y} = cordinates;
        let player = this.data.player;
        let board = this.data.game.data.board;
        let targetSq = board.data[x][y];
        let prevSq = this.square;
        
        if(!targetSq.data.div.classList.contains("move") || targetSq == prevSq) return;

        if(this.data.name == "King" && this.isCastling(cordinates)) {
            if(x == 0) {
                if(y == 2) {
                    let rook = board.data[0][0].piece;
                    rook.moveTo({x:0, y:3});
                }else {
                    let rook = board.data[0][7].piece;
                    rook.moveTo({x:0, y:5});
                }
            }else {
                if(y == 2) {
                    let rook = board.data[7][0].piece;
                    rook.moveTo({x:7, y:3});
                }else {
                    let rook = board.data[7][7].piece;
                    rook.moveTo({x:7, y:5});
                }
            }
        }
        if(targetSq.data.enPassant) {
            let enimySq = null;
            if(this.data.color == "white") enimySq = board.data[x+1][y];
            else enimySq = board.data[x-1][y];
            let players = board.game.data.players;
            let enimyPi = enimySq.piece;
            let opponent = null;
            if(players[0] == player) opponent = players[1];
            else opponent = players[0];

            player.data.eated.push(enimyPi);
            enimySq.data.div.removeChild(enimyPi.data.image);
            opponent.removePiece(enimyPi);
            enimySq.piece = null;
            targetSq.data.enPassant = false;
        }
        this.moveTo(cordinates);

        player.data.moves.push(this.data.name+" "+board.getAlias(prevSq)+" to "+ board.getAlias(targetSq));

        console.log(player.data.moves[player.data.moves.length-1]);

        if(this.data.name == "Pawn") {
            if(this.data.color == "white" && x == 0) {
                this.setPawnToPiece();
            }
            else if(this.data.color == "black" && x == 7) {
                this.setPawnToPiece();
            }
        }

        this.data.game.swapTurn();
        if(board.isCheckmate()) {
            console.log("checkmate Bitch!!!");
        }
    }

    isCastling(cordinates) {
        let {x, y} = cordinates;
        if(
            this.data.canCastle && (
            (x == 0 && y == 2) ||
            (x == 0 && y == 6) ||
            (x == 7 && y == 2) ||
            (x == 7 && y == 6) )
        ) return true;
        else return false;
    }

    moveTo(cordinates) {
        let {x, y} = cordinates;
        let board = this.data.game.data.board;
        let targetSq = board.data[x][y];
        let prevSq = this.square;
        let game = this.data.game;
        let player = this.data.player;

        if(this.data.name == "Pawn") this.data.isFastPawn = false;
        if(this.data.name == "King" || this.data.name == "Rook") this.data.canCastle = false;

        if(targetSq.piece) {
            let eatedPiece = targetSq.piece;
            let otherPlayer = null;
            let players = game.data.players;
            
            if(players[0] == player) otherPlayer = players[1];
            else otherPlayer = players[0];

            player.data.eated.push(targetSq.piece);

            targetSq.data.div.removeChild(eatedPiece.data.image);

            otherPlayer.removePiece(eatedPiece);
        }

        prevSq.piece = null;
        this.square = targetSq;
        targetSq.piece = this;

        this.data.letter = targetSq.data.letter;
        this.data.number = targetSq.data.number;

        targetSq.data.div.appendChild(this.data.image);
        
        board.removeAllPossibilities();
    }

    setPawnToPiece() {
        let choice = prompt("Type one of these Queen, Rook, Bishope, Knight");
        let piece = this;
        piece.data.name = choice;
        let alias = "";
        if(piece.data.color == "white") alias+='w';
        else alias+='b';

        if(choice == "Queen") alias+='q';
        else if(choice == "Knight") alias+='n';
        else if(choice == "Bishope") alias+='b';
        else if(choice == "Rook") alias+='r';
        
        piece.data.alias = alias;
        let image = piece.data.image;
        image.src = `./pieces/${alias}.png`;
    }
}