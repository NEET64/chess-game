class Square {
    constructor(color, cordinates, letter, number, game) {
        this.data = {
            color,
            cordinates,
            letter, 
            number,
            enPassant: false,
            div: null,
        };

        this.game = game;
        this.piece = null;

        this.buildSquare();
        this.listener();
    }

    buildSquare() {
        const squareDiv = document.createElement("div");
        squareDiv.className = "chessboard-square";
        squareDiv.setAttribute("color", this.data.color);
        squareDiv.setAttribute("cordinates", JSON.stringify(this.data.cordinates));

        chessboard.appendChild(squareDiv);
        this.data.div = squareDiv;
    }

    listener() {
        let game = this.game;
        const checkIfMove = function () {
            if(this.classList.contains("move")) {
                let cords = JSON.parse(this.getAttribute("cordinates"));
                let turn = game.data.turn;
				turn.data.currentPiece.move(cords);
            }
        };

        this.data.div.addEventListener("click", checkIfMove);
    }
}