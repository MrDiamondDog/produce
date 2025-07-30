import { useEffect, useRef } from "react";
import Game, { GameProps } from "../Game";
import Subtext from "../Subtext";
import { randomFrom, shuffle } from "@/utils/random";
import { roundRect } from "@/utils/canvas";

let grid: number[][] = [];

const gapSize = 5;
const squareSize = 100 - gapSize;

let ctx: CanvasRenderingContext2D;

function init(canvas: HTMLCanvasElement) {
    shuffleGrid();

    ctx = canvas.getContext("2d")!;

    draw();

    window.addEventListener("keydown", onInput);
    ctx.canvas.addEventListener("mousedown", onClick);
}

function shuffleGrid() {
    grid = [];

    let numbers = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

    for (let y = 0; y < 4; y++) {
        grid.push([]);
        for (let x = 0; x < 4; x++) {
            let num = randomFrom(numbers);
            grid[y].push(num);

            numbers = numbers.filter(n => n !== num);
        }
    }
}

function reset() {
    window.removeEventListener("keydown", onInput);
    ctx.canvas.removeEventListener("mousedown", onClick);
}

function findEmpty(): { x: number, y: number } {
    let emptyX = -1;
    let emptyY = -1;

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] !== 0)
                continue;

            emptyX = x;
            emptyY = y;
        }
    }

    return { x: emptyX, y: emptyY };
}

function onClick(e: MouseEvent) {
    const mouseX = e.clientX - ctx.canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - ctx.canvas.getBoundingClientRect().top;

    const gridX = Math.floor(mouseX / (squareSize + gapSize));
    const gridY = Math.floor(mouseY / (squareSize + gapSize));

    const { x: emptyX, y: emptyY } = findEmpty();

    const neighbors = [
        { x: emptyX + 1, y: emptyY, moveDir: "left" },
        { x: emptyX, y: emptyY + 1, moveDir: "up" },
        { x: emptyX - 1, y: emptyY, moveDir: "right" },
        { x: emptyX, y: emptyY - 1, moveDir: "down" },
    ];

    let foundNeighbor = null;

    for (const neighbor of neighbors) {
        if (gridX === neighbor.x && gridY === neighbor.y) {
            foundNeighbor = neighbor;
            break;
        }
    }

    if (!foundNeighbor)
        return;

    move(foundNeighbor.moveDir);
}

function onInput(e: KeyboardEvent) {
    let dir = "";

    if (e.key === "ArrowLeft")
        dir = "left";
    if (e.key === "ArrowRight")
        dir = "right";
    if (e.key === "ArrowUp")
        dir = "up";
    if (e.key === "ArrowDown")
        dir = "down";

    if (!dir)
        return;

    move(dir);
}

function move(dir: string) {
    const { x: emptyX, y: emptyY } = findEmpty();

    let moveX = emptyX;
    let moveY = emptyY;

    if (dir === "left")
        moveX++;
    if (dir === "right")
        moveX--;
    if (dir === "up")
        moveY++;
    if (dir === "down")
        moveY--;

    if (!grid[moveY] || !grid[moveY][moveX])
        return;

    grid[emptyY][emptyX] = grid[moveY][moveX];
    grid[moveY][moveX] = 0;

    requestAnimationFrame(draw);
}

function draw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === 0)
                continue;

            const squareX = x * squareSize + x * gapSize;
            const squareY = y * squareSize + y * gapSize;

            ctx.fillStyle = "white";
            roundRect(ctx, squareX, squareY, squareSize, squareSize);

            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "50px Lexend";
            ctx.fillText(grid[y][x].toString(), squareX + squareSize / 2, squareY + squareSize / 2);
        }
    }
}

export default function SlidingPuzzleGame(props: GameProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current)
            return;

        init(canvasRef.current);

        return reset;
    }, [canvasRef.current]);

    return <Game {...props}>
        <canvas width={400} height={400} ref={canvasRef} />
        <Subtext>Use arrow keys or mouse to move blocks</Subtext>
    </Game>;
}
