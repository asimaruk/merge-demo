export interface IMergeGame {
    readonly width: number
    readonly height: number
    getCell(x: number, y: number): Cell
    setCell(x: number, y: number, piece: IPiece): void
    clearCell(x: number, y: number): void
    setCells(pieces: Piece[]): void
    move(movement: Movement): Movement | null
    moveAuto(movement: Movement): Movement | null
    isCellEmpty(x: number, y: number): boolean
}

export interface IPiece {
    readonly info: PieceInfo
    readonly level: number
    mergesWith(other: IPiece): boolean
    merge(other: IPiece): IPiece
}

export enum PieceName {
    Flower,
    Box
}

type FlowerPieceInfo = {
    name: PieceName.Flower,
    maxLevel: 2
}
type BoxPieceInfo = {
    name: PieceName.Box,
    maxLevel: 1
}
export type PieceInfo = FlowerPieceInfo | BoxPieceInfo

type Movement = {
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    piece: IPiece
}

type Cell = IPiece | null;

export function createMovement(fromX: number, fromY: number, toX: number, toY: number, piece: IPiece): Movement {
    return { fromX, fromY, toX, toY, piece };
}

function isEqual(info1: PieceInfo, info2: PieceInfo): boolean {
    return info1.name == info2.name && info1.maxLevel == info2.maxLevel;
}

export class Piece implements IPiece {

    constructor(
        readonly info: PieceInfo,
        readonly level: number
    ) {}

    mergesWith(other: IPiece): boolean {
        return this.level < this.info.maxLevel && isEqual(this.info, other.info) && this.level == other.level;
    }

    merge(other: IPiece): IPiece {
        if (!this.mergesWith(other)) throw Error("Unstackable pieces");

        return new Piece(this.info, this.level + 1);
    }

    static flowerPiece(level: number = 1): IPiece {
        return new Piece({
            name: PieceName.Flower,
            maxLevel: 2
        }, level);
    }

    static boxPiece(level: number = 1): IPiece {
        return new Piece({
            name: PieceName.Box,
            maxLevel: 1
        }, level);
    }
}

export class MergeGame implements IMergeGame {

    private cells: Cell[]

    constructor(
        readonly width: number,
        readonly height: number,
    ) {
        let size = width * height;
        this.cells = Array(size).fill(null, 0, size);
    }

    move(movement: Movement): Movement | null {
        let fromIdx = this.idx(movement.fromX, movement.fromY);
        let toIdx = this.idx(movement.toX, movement.toY);
        this.cells[fromIdx] = null;
        let targetPiece = this.cells[toIdx]
        if (!targetPiece) {
            this.cells[toIdx] = movement.piece
            return null;
        } else if (movement.piece.mergesWith(targetPiece)) {
            this.cells[toIdx] = movement.piece.merge(targetPiece)
            return null;
        } else {
            this.cells[toIdx] = movement.piece;
            for (let searchShift = 1; searchShift < Math.max(this.width, this.height); searchShift++) {
                let leftEdge = Math.max(movement.toX - searchShift, 0);
                let rightEdge = Math.min(movement.toX + searchShift, this.width - 1);
                let bottomEdge = Math.max(movement.toY - searchShift, 0);
                let topEdge = Math.min(movement.toY + searchShift, this.height - 1);
                for (let i = leftEdge; i <= rightEdge; i++) {
                    if (this.isCellEmpty(i, topEdge)) {
                        return createMovement(movement.toX, movement.toY, i, topEdge, targetPiece);
                    } else if (this.isCellEmpty(i, bottomEdge)) {
                        return createMovement(movement.toX, movement.toY, i, bottomEdge, targetPiece);
                    }
                }
                for (let i = bottomEdge; i <= topEdge; i++) {
                    if (this.isCellEmpty(leftEdge, i)) {
                        return createMovement(movement.toX, movement.toY, leftEdge, i, targetPiece);
                    } else if (this.isCellEmpty(rightEdge, i)) {
                        return createMovement(movement.toX, movement.toY, rightEdge, i, targetPiece);
                    }
                }
            }
        }
        throw Error("Invalid move");
    }

    moveAuto(movement: Movement): Movement | null {
        let responseMove = this.move(movement);
        if (responseMove) {
            this.setCell(responseMove.toX, responseMove.toY, responseMove.piece);
        }
        return responseMove;
    }

    isCellEmpty(x: number, y: number): boolean {
        return this.getCell(x, y) === null;
    }

    getCell(x: number, y: number): Cell {
        return this.cells[this.idx(x, y)];
    }

    setCell(x: number, y: number, piece: IPiece): void {
        this.cells[this.idx(x, y)] = piece;
    }

    clearCell(x: number, y: number): void {
        this.cells[this.idx(x, y)] = null; 
    }

    setCells(pieces: Array<Piece|null>) {
        for (let i = 0; i < Math.min(this.width * this.height, pieces.length) - 1; i++) {
            this.cells[i] = pieces[i];
        }
    }

    private idx(x: number, y: number): number {
        return y * this.width + x;
    }
}
