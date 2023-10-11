
let chessboard = document.querySelector(".chess .chessboard");

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
			const player1 = new Player("Luffy", 1, "white");
			const player2 = new Player("Zoro", 2, "black");

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
    }
}

const Game = new Chess();

Game.init(function () {
    this.start();
});