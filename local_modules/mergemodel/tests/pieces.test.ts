import { Piece, PieceName } from "../src/game";

test("Mergable pieces", () => {
    let piece1 = new Piece({ name: PieceName.Flower, maxLevel: 2 }, 1);
    let piece2 = new Piece({ name: PieceName.Flower, maxLevel: 2 }, 1);
    expect(piece1.merge(piece2)).toHaveProperty("level", 2)
})

test("Unmergable different kind pieces", () => {
    let piece1 = new Piece({ name: PieceName.Flower, maxLevel: 2 }, 1);
    let piece2 = new Piece({ name: PieceName.Box, maxLevel: 1 }, 1);
    expect(() => piece1.merge(piece2)).toThrow()
})

test("Unmergable same kind pieces different levels", () => {
    let piece1 = new Piece({ name: PieceName.Flower, maxLevel: 2 }, 1);
    let piece2 = new Piece({ name: PieceName.Flower, maxLevel: 2 }, 2);
    expect(() => piece1.merge(piece2)).toThrow()
})

test("Unmergable max level pieces", () => {
    let piece1 = new Piece({ name: PieceName.Flower, maxLevel: 2 }, 2);
    let piece2 = new Piece({ name: PieceName.Flower, maxLevel: 2 }, 2);
    expect(() => piece1.merge(piece2)).toThrow()
})