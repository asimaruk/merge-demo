import { createMovement, MergeGame, Piece, PieceName } from "../src/game";

test("Creation 3x2", () => {
    let game = new MergeGame(2, 3);
    game.setCells([
        Piece.flowerPiece(), null               ,             
        Piece.boxPiece()   , Piece.flowerPiece(),
        null               , null               ,
    ]);
    expect(game.getCell(0, 0)?.info.name).toBe(PieceName.Flower);
    expect(game.getCell(1, 0)).toBe(null);
    expect(game.getCell(0, 1)?.info.name).toBe(PieceName.Box);
    expect(game.getCell(1, 1)?.info.name).toBe(PieceName.Flower);
    expect(game.getCell(0, 2)).toBe(null);
    expect(game.getCell(1, 2)).toBe(null);
})

test("Minimum size swap", () => {
    let game = new MergeGame(2, 1)
    let boxPiece = Piece.boxPiece();
    let flowerPiece = Piece.flowerPiece();
    game.setCell(0, 0, boxPiece);
    game.setCell(1, 0, flowerPiece);
    let movement = createMovement(0, 0, 1, 0, boxPiece);
    let responseMove = game.moveAuto(movement);
    expect(responseMove?.fromX).toBe(1);
    expect(responseMove?.fromY).toBe(0);
    expect(responseMove?.toX).toBe(0);
    expect(responseMove?.toY).toBe(0);
    expect(responseMove?.piece).toBe(flowerPiece);
    expect(game.getCell(0, 0)).toBe(flowerPiece);
})

test("Merge success", () => {
    let game = new MergeGame(2, 1)
    let flowerPiece1 = Piece.flowerPiece();
    let flowerPiece2 = Piece.flowerPiece();
    game.setCell(0, 0, flowerPiece1);
    game.setCell(1, 0, flowerPiece2);
    let movement = createMovement(0, 0, 1, 0, flowerPiece1);
    let responseMove = game.moveAuto(movement);
    expect(responseMove).toBeNull();
    expect(game.isCellEmpty(0, 0)).toBeTruthy();
    expect(game.getCell(1, 0)?.level).toBe(2);
    expect(game.getCell(1, 0)?.info.name).toBe(PieceName.Flower);
})

test("Push to empty space nearby", () => {
    let game = new MergeGame(2, 3);
    let flowerPiece = Piece.flowerPiece();
    let boxPiece = Piece.boxPiece();
    game.setCells([
        Piece.flowerPiece(), null       ,             
        boxPiece           , flowerPiece,
        null               , null       ,
    ]);

    expect(game.getCell(0, 1)).toBe(boxPiece);
    expect(game.getCell(1, 1)).toBe(flowerPiece);

    let movement = createMovement(1, 1, 0, 1, flowerPiece);
    let responseMovement = game.moveAuto(movement);

    expect(responseMovement).toEqual({
        fromX: 0,
        fromY: 1,
        toX: 0,
        toY: 2,
        piece: boxPiece
    });
    expect(game.getCell(1, 1)).toBeNull();
    expect(game.getCell(0, 1)).toBe(flowerPiece);
    expect(game.getCell(0, 2)).toBe(boxPiece);
})

test("Push to empty space faraway", () => {
    let game = new MergeGame(4, 4);
    let flowerPiece = Piece.flowerPiece();
    let boxPiece = Piece.boxPiece();
    game.setCells([
        null    , Piece.flowerPiece(), Piece.flowerPiece(), flowerPiece,
        null    , Piece.flowerPiece(), Piece.flowerPiece(), Piece.flowerPiece(),
        null    , Piece.flowerPiece(), Piece.flowerPiece(), Piece.flowerPiece(),
        boxPiece, null               , null               , null
    ]);

    expect(game.getCell(0, 3)).toBe(boxPiece);
    expect(game.getCell(3, 0)).toBe(flowerPiece);

    let movement = createMovement(0, 3, 3, 0, boxPiece);
    let responseMovement = game.moveAuto(movement);
    
    expect(responseMovement).toEqual({
        fromX: 3,
        fromY: 0,
        toX: 0,
        toY: 3,
        piece: flowerPiece
    });
    expect(game.getCell(0, 3)).toBe(flowerPiece);
    expect(game.getCell(3, 0)).toBe(boxPiece);
})