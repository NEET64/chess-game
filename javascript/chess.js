
let chessboard = document.querySelector(".chess .chessboard");
let stockfish = new Worker('javascript/stockfish.js');

class Chess {
    constructor() {
        this.data = {
            turn: null,
            timer: 5,
            players: [],
            board: null
        };
    }

    async init(callback) {
        this.data.board = new Board(this);  

        await this.assignPlayers();

        await this.data.players[0].init(this);
        await this.data.players[1].init(this);

        callback && callback.call(this);
    }

    start() {
        this.data.board.setPiecesDefault();
    }

    async assignPlayers() {
        return new Promise((resolve) => {
			const player1 = new Player("Luffy", 1, "white", false);
			const player2 = new Player("Zoro", 2, "black", true);

			this.data.players = [player1, player2];

			this.data.turn = player1;

			resolve();
		});
    }

    swapTurn() {
        let turn = this.data.turn;
        let players = this.data.players;

        if(turn == players[0]) {
            this.data.turn = players[1];
        }else {
            this.data.turn = players[0];
        }

        if(this.data.turn.isComputer) {
            let board = this.data.board;
            let data = board.data;
            let fen = board.getFEN();
            getStockfishMove(fen, function(suggestedMove) {
                    let piece = board.getSquare(suggestedMove.charAt(0), suggestedMove.charAt(1)).piece;
                    let coords = board.getCoordinates(suggestedMove.charAt(2), suggestedMove.charAt(3));

                    piece.move(coords, true);
              });
        }
    }
}

const Game = new Chess();

Game.init(function () {
    this.start();
});

function getStockfishMove(positionFEN, callback) {
    stockfish.postMessage('position fen ' + positionFEN);
    stockfish.postMessage('go depth 1'); // You can adjust the depth for desired difficulty
  
    stockfish.onmessage = function (event) {
      if (event.data.startsWith('bestmove')) {
        const suggestedMove = event.data.split(' ')[1];
        callback(suggestedMove); // Pass the suggested move to the callback function
      }
    };
}

let close = document.querySelector(".close");
let share = document.querySelector(".share");
let playagain = document.querySelector(".playagain");

close.addEventListener('click', function () {
    console.log("close");
    location.reload();
});

share.addEventListener('click', function () {
    console.log("close");
});

playagain.addEventListener('click', function () {
    console.log("close");
});