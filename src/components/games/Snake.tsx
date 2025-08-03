import { useEffect, useRef } from "react";
import Game, { GameProps } from "../Game";
import Subtext from "../Subtext";
import { randomInt } from "@/utils/random";

const gameOverScreen = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const gapSize = 1;
const squareSize = 20 - gapSize;
const gridSize = 20;

let applePos = { x: 0, y: 0 };
let snakePos = [{ x: gridSize / 2 - 5, y: gridSize / 2, dir: { x: 1, y: 0 } }];
let inputs: { x: number, y: number }[] = [];

let ctx: CanvasRenderingContext2D;

let updateInterval: NodeJS.Timeout | null = null;

function init(canvas: HTMLCanvasElement) {
    ctx = canvas.getContext("2d")!;

    restart();
    draw();

    window.addEventListener("keydown", onInput);

    if (!updateInterval)
        updateInterval = setInterval(update, 1000 / 5);
}

function reset() {
    window.removeEventListener("keydown", onInput);
    updateInterval && clearInterval(updateInterval);
    updateInterval = null;
}

function restart() {
    snakePos = [{ x: gridSize / 2 - 5, y: gridSize / 2, dir: { x: 1, y: 0 } }];
    inputs = [];
    placeApple();

    if (!updateInterval)
        updateInterval = setInterval(update, 1000 / 5);
}

function die() {
    snakePos = [];
    updateInterval && clearInterval(updateInterval);
    updateInterval = null;
    applePos = { x: -1, y: -1 };

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const square = gameOverScreen[y][x];

            if (square)
                ctx.fillStyle = "red";
            else
                ctx.fillStyle = "black";

            ctx.fillRect(x * squareSize + x * gapSize, y * squareSize + y * gapSize, squareSize, squareSize);
        }
    }
}

function update() {
    if (inputs.length)
        snakePos[0].dir = inputs.shift()!;

    for (let i = 0; i < snakePos.length; i++) {
        snakePos[i].x += snakePos[i].dir.x;
        snakePos[i].y += snakePos[i].dir.y;
    }

    for (let i = snakePos.length - 2; i >= 0; i--) {
        snakePos[i + 1].dir = { ...snakePos[i].dir };
    }

    if (snakePos[0].x === applePos.x && snakePos[0].y === applePos.y) {
        snakePos.push({ ...snakePos[snakePos.length - 1] });
        snakePos[snakePos.length - 1].x -= snakePos[snakePos.length - 1].dir.x;
        snakePos[snakePos.length - 1].y -= snakePos[snakePos.length - 1].dir.y;

        placeApple();
    }

    if (snakePos[0].x >= gridSize || snakePos[0].y >= gridSize || snakePos[0].x < 0 || snakePos[0].y < 0)
        return void die();

    for (const pos of snakePos) {
        if (snakePos.filter(p => p.x === pos.x && p.y === pos.y).length >= 2)
            return void die();
    }

    requestAnimationFrame(draw);
}

function placeApple() {
    while (true) {
        let appleX = randomInt(0, gridSize - 1);
        let appleY = randomInt(0, gridSize - 1);

        if (snakePos.find(v => v.x === appleX && v.y === appleY))
            continue;

        applePos = { x: appleX, y: appleY };

        break;
    }
}

let lastKey = "";

function onInput(e: KeyboardEvent) {
    if (e.key === "r") {
        restart();
        return;
    }

    let dir = { x: 0, y: 0 };

    if (e.key === "ArrowLeft" && lastKey !== "ArrowRight")
        dir = { x: -1, y: 0 };
    if (e.key === "ArrowRight" && lastKey !== "ArrowLeft")
        dir = { x: 1, y: 0 };
    if (e.key === "ArrowUp" && lastKey !== "ArrowDown")
        dir = { x: 0, y: -1 };
    if (e.key === "ArrowDown" && lastKey !== "ArrowUp")
        dir = { x: 0, y: 1 };

    if (!dir.x && !dir.y)
        return;

    if (inputs.length > 2)
        return;

    lastKey = e.key;

    inputs.push(dir);
}

function draw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            ctx.fillStyle = "black";
            const snakePixel = snakePos.find(v => v.x === x && v.y === y);

            if (applePos.x === x && applePos.y === y)
                ctx.fillStyle = "red";
            if (snakePixel)
                ctx.fillStyle = "green";

            ctx.strokeStyle = "#1b222a";
            ctx.lineWidth = 1;
            ctx.fillRect(x * squareSize + x * gapSize, y * squareSize + y * gapSize, squareSize, squareSize);
        }
    }
}

export default function SnakeGame(props: GameProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current)
            return;

        init(canvasRef.current);

        return reset;
    }, [canvasRef.current]);

    return <Game {...props}>
        <canvas width={400} height={400} ref={canvasRef} />
        <Subtext className="whitespace-pre-wrap">Use arrow keys to change direction{"\n"}Press R to restart</Subtext>
    </Game>;
}
