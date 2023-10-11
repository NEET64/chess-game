class Player {
    constructor(name, id, color) {
        this.data = {
            isWinner: false,
            isTimeout: false,
            isReady: false,
            name,
            id,
            color,
            total_moves: 0,
			timer: { m: null, s: null },
			piecesData: {},
			pieces: [],
			eated: [],
			moves: [],
			currentPiece: null, 
        };

        this.game = null;
    }

    async getPieces() {
        let color = this.data.color;
        let json = await fetch(`./json/${color}-pieces.json`);
        this.data.piecesData = await json.json();
    }

    async setPieces() {
        const piecesData = this.data.piecesData;
        const game = this.game;
        const player = this;

        const set = function (piece) {
            let name = piece.name;
            let alias = piece.alias;
            let color = player.data.color;
            let length = piece.length;
            let positions = piece.position;

            for(let i=0; i<length; i++) {
                const letter = positions.letter[i];
                const number = positions.number;
                const piece = new Piece(name, alias, color, letter, number, i, player, game);
                player.data.pieces.push(piece); 
            }
        };

        piecesData.forEach(set);
    }
    
    async init(game) {
        this.game = game;

        await this.getPieces();
        await this.setPieces();
    }

    removePiece(piece) {
        let pieces = this.data.pieces;
        for (let i = 0; i < pieces.length; i++) {
            const element = pieces[i];
            if(element == piece) {
                pieces.splice(i, 1);
            }
        }
    }
}