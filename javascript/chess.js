
let chessboard = document.querySelector(".chess .chessboard");
let stockfish = new Worker('javascript/stockfish.js');

let defaultBoard = new Board();
let p1  = {
    name: "",
    id: 1,
    color: "white",
    isComputer: false
};
let p2  = {
    name: "",
    id: 2,
    color: "black",
    isComputer: false
};
class Chess {
    constructor(p1, p2) {
        this.data = {
            turn: null,
            timer: 5,
            players: [],
            board: null
        };
        this.p1 = p1;
        this.p2 = p2;
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
			const player1 = new Player(this.p1);
			const player2 = new Player(this.p2);

            let p1 = document.querySelector("#white .player-title");
            let p2 = document.querySelector("#black .player-title");

            p1.innerHTML = player1.data.name;
            p2.innerHTML = player2.data.name;

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
}

let Game; 

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


let choice = document.querySelectorAll(".choice");

let c = document.querySelector(".computer");
let p = document.querySelector(".player-options");

choice.forEach(element => {
    element.addEventListener("click", function () {
        choice.forEach(e => {
            e.classList.remove("selected");
        });
        element.classList.add("selected");
        if(element.classList.contains("p")) {
            p.style.display = "block";
            c.style.display = "none";
        }else {
            c.style.display = "block";
            p.style.display = "none";
        }
    })
});

let timers = document.querySelectorAll(".time")

timers.forEach(element => {
    element.addEventListener("click", function () {
        timers.forEach(e => {
            e.classList.remove("selected");
        });
        element.classList.add("selected");
    })
});

let cubes = document.querySelectorAll(".cube")

cubes.forEach(element => {
    element.addEventListener("click", function () {
        cubes.forEach(e => {
            e.classList.remove("selected");
        });
        element.classList.add("selected");
    })
});


let close = document.querySelector(".close");

close.addEventListener('click', function () {
    console.log("close");
    let dialogbox = document.querySelector(".winnerDialog");
    dialogbox.style.visibility = "hidden";
    document.querySelector(".right-section").style.display = "block";
});

let play = document.querySelector(".play");

play.addEventListener("click", function () {
    let w = document.querySelector(".w");
    if(document.querySelector(".p").classList.contains("selected")){
        p1.name = document.querySelector(".wname").value;
        p2.name = document.querySelector(".bname").value;
    }else {
        if(w.classList.contains("selected")) {
            p1.name = document.querySelector(".computer > .name").value;
            p2.name = "Computer";
            p2.isComputer = true;
        }else {
            p2.name = document.querySelector(".computer > .name").value;
            p1.name = "Computer";
            p1.isComputer = true;
        }
    }
    document.querySelector(".right-section").style.display = "none";
    chessboard.innerHTML = "";
    Game = new Chess(p1, p2);
    Game.init(function () {
        this.start();
    });
});