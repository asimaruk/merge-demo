import { _decorator, Component, Graphics, UITransform, v3, Prefab, v2, instantiate, Node } from 'cc';
import { GamePiece, GamePieceEventType, GamePieceNames } from './GamePiece';
import { IMergeGame, MergeGame, IPiece, Piece, PieceName } from 'mergemodel';
const { ccclass, property, executeInEditMode } = _decorator;

type Measures = { 
    halfW: number, 
    halfH: number, 
    vStep: number, 
    hStep: number 
}
type Coordinates = {
    x: number,
    y: number
};
type Cell = Coordinates; 

@ccclass("Piece Prefab")
class PiecePrefabInfo {

    @property({
        type: Prefab
    })
    prefab: Prefab = null

    @property({
        type: GamePieceNames
    })
    pieceName = GamePieceNames.Box

    @property
    level: number = 1
}

@ccclass('Board')
@executeInEditMode(true)
export class Board extends Component {
    
    @property({
        min: 1,
        step: 1
    })
    width = 3;

    @property({
        min: 1,
        step: 1
    })
    height = 2;

    @property({
        type: [PiecePrefabInfo],
        serializable: true,
        displayName: "Piece Prefabs"
    })
    piecePrefabs: PiecePrefabInfo[] = []

    private transform: UITransform = null;
    private g: Graphics = null;
    private gamePieces: GamePiece[] = [];
    private game: IMergeGame = null;
    private currentCell = v2();

    public get measures() : Measures {
        return {
            halfW: this.transform.width / 2,
            halfH: this.transform.height / 2,
            vStep: this.transform.width / this.width,
            hStep: this.transform.height / this.height
        }
    }
    

    onLoad() {
        this.transform = this.getComponent(UITransform);
        this.g = this.getComponent(Graphics);
        this.gamePieces = this.getComponentsInChildren(GamePiece);
        this.game = new MergeGame(this.width, this.height);
    }

    start() {
        this.drawGameBoard();
        for (let gamePiece of this.gamePieces) {
            const cell = this.cellFromePiece(gamePiece);
            this.onSpawnedPiece(gamePiece, cell);
        }
    }

    private drawGameBoard() {
        const measures = this.measures;

        for (let i = 1; i < this.height; i++) {
            this.g.moveTo(-measures.halfW, -measures.halfH + measures.vStep * i);
            this.g.lineTo(measures.halfW, -measures.halfH + measures.vStep * i);
        }
        for (let i = 1; i < this.width; i++) {
            this.g.moveTo(-measures.halfW + measures.hStep * i, -measures.halfH);
            this.g.lineTo(-measures.halfW + measures.hStep * i, measures.halfH);
        }
        this.g.close();
        this.g.stroke();
    }

    private cellFromCoordinates(x: number, y: number): Cell {
        const measures = this.measures;
        return {
            x: Math.floor((x + measures.halfW) / measures.hStep),
            y: Math.floor((y + measures.halfH) / measures.vStep)
        }
    }

    private coordinatesFromCell(x: number, y: number): Coordinates {
        const measures = this.measures;
        return {
            x: x * measures.hStep + measures.hStep / 2 - measures.halfW,
            y: y * measures.vStep + measures.vStep / 2 - measures.halfH
        }
    }

    private cellFromePiece(gamePiece: GamePiece): Cell {
        const position = gamePiece.node.position;
        return this.cellFromCoordinates(position.x, position.y);
    }

    private onPieceDestroyed(gamePiece: GamePiece) {
        this.onPieceNodeDestroyed(gamePiece.node);
    }

    private onPieceNodeDestroyed(node: Node) {
        node.off(GamePieceEventType.GRABBED, this.onPieceGrabbed, this);
        node.off(GamePieceEventType.DROPPED, this.onPieceDropped, this);
    }

    private onPieceGrabbed(gamePiece: GamePiece) {
        gamePiece.node.removeFromParent();
        this.node.addChild(gamePiece.node);

        const cell = this.cellFromePiece(gamePiece);
        this.currentCell.set(cell.x, cell.y);
    }

    private onPieceDropped(gamePiece: GamePiece) {
        const newCell = this.cellFromePiece(gamePiece);
        const newCoordinates = this.coordinatesFromCell(newCell.x, newCell.y);
        const currentPiece = this.game.getCell(this.currentCell.x, this.currentCell.y);
        const targetPiece = this.game.getCell(newCell.x, newCell.y);
        
        if (targetPiece == null) {
            this.game.move({
                fromX: this.currentCell.x,
                fromY: this.currentCell.y,
                toX: newCell.x,
                toY: newCell.y,
                piece: currentPiece
            });
            gamePiece.node.position = v3(newCoordinates.x, newCoordinates.y);
        } else if (targetPiece.mergesWith(currentPiece)) {
            const mergedPiece = targetPiece.merge(currentPiece);
            this.game.clearCell(this.currentCell.x, this.currentCell.y);
            this.game.clearCell(newCell.x, newCell.y);
            const responseGamePiece = this.node.children.find((value) => 
                value.position.equals3f(newCoordinates.x, newCoordinates.y, 0));
            this.onPieceDestroyed(gamePiece);
            this.onPieceNodeDestroyed(responseGamePiece);
            gamePiece.node.destroy();
            responseGamePiece.destroy();
            this.spawnPiece(mergedPiece, newCell);
        } else {
            const responseMove = this.game.moveAuto({
                fromX: this.currentCell.x,
                fromY: this.currentCell.y,
                toX: newCell.x,
                toY: newCell.y,
                piece: currentPiece
            });
            const responseGamePiece = this.node.children.find((value) => 
                value.position.equals3f(newCoordinates.x, newCoordinates.y, 0));
            gamePiece.node.position = v3(newCoordinates.x, newCoordinates.y);
            const responseCoordinates = this.coordinatesFromCell(responseMove.toX, responseMove.toY);
            responseGamePiece.setPosition(responseCoordinates.x, responseCoordinates.y);
        }
    }

    private onSpawnedPiece(gamePiece: GamePiece, cell: Cell) {
        const coordinates = this.coordinatesFromCell(cell.x, cell.y);
        gamePiece.node.position = v3(coordinates.x, coordinates.y);

        switch (gamePiece.pieceName) {
            case GamePieceNames.Box:
                this.game.setCell(cell.x, cell.y, Piece.boxPiece(gamePiece.level));
                break;
            case GamePieceNames.Flower:
                this.game.setCell(cell.x, cell.y, Piece.flowerPiece(gamePiece.level));
                break;
        }

        gamePiece.node.on(GamePieceEventType.GRABBED, this.onPieceGrabbed, this);
        gamePiece.node.on(GamePieceEventType.DROPPED, this.onPieceDropped, this);
    }

    private spawnPiece(piece: IPiece, cell: Cell) {
        for (let prefab of this.piecePrefabs) {
            if (prefab.pieceName == piece.info.name && prefab.level == piece.level) {
                const node = instantiate(prefab.prefab)
                const uiTransform = node.getComponent(UITransform);
                const measures = this.measures;
                const scale = Math.min(
                    measures.vStep / uiTransform.height, 
                    measures.hStep / uiTransform.width
                ) * 0.9;
                node.setScale(scale, scale, 1);
                this.node.addChild(node);
                this.onSpawnedPiece(node.getComponent(GamePiece), cell);
            }
        }
    }
}
