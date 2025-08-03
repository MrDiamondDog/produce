"use client";

import { randomInt, randomRange } from "@/utils/random";
import { useEffect, useRef } from "react";

// https://codepen.io/TC5550/pen/WNNWoaO

let width = 0;
let height = 0;

function compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: GLenum) {
    let shader = gl.createShader(shaderType)!;
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw `Shader compile failed with: ${gl.getShaderInfoLog(shader)}`;
    }

    return shader;
}

function getUniformLocation(gl: WebGLRenderingContext, program: WebGLProgram, name: string) {
    let uniformLocation = gl.getUniformLocation(program, name);
    if (uniformLocation === -1) {
        throw `Can not find uniform ${name}.`;
    }
    return uniformLocation;
}

function getAttribLocation(gl: WebGLRenderingContext, program: WebGLProgram, name: string) {
    let attributeLocation = gl.getAttribLocation(program, name);
    if (attributeLocation === -1) {
        throw `Can not find attribute ${name}.`;
    }
    return attributeLocation;
}

function init(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl")!;

    let numMetaballs = 30;
    let metaballs: { x: number, y: number, vx: number, vy: number, r: number }[] = [];

    for (let i = 0; i < numMetaballs; i++) {
        let radius = randomInt(25, 100);
        metaballs.push({
            x: Math.random() * (width - 2 * radius) + radius,
            y: Math.random() * (height - 2 * radius) + radius,
            vx: randomRange(-.25, .25),
            vy: randomRange(-.25, .25),
            r: radius * 0.75,
        });
    }

    const vertexShaderSrc = `
attribute vec2 position;

void main() {
// position specifies only x and y.
// We set z to be 0.0, and w to be 1.0
gl_Position = vec4(position, 0.0, 1.0);
}`;

    const fragmentShaderSrc = `
precision highp float;

const float WIDTH = ${width >> 0}.0;
const float HEIGHT = ${height >> 0}.0;

uniform vec3 metaballs[${numMetaballs}];

void main(){
float x = gl_FragCoord.x;
float y = gl_FragCoord.y;

float sum = 0.0;
for (int i = 0; i < ${numMetaballs}; i++) {
vec3 metaball = metaballs[i];
float dx = metaball.x - x;
float dy = metaball.y - y;
float radius = metaball.z;

sum += (radius * radius) / (dx * dx + dy * dy);
}

if (sum >= 0.99) {
gl_FragColor = vec4(mix(vec3(x / WIDTH, y / HEIGHT, 1.0), vec3(0, 0, 0), max(0.0, 1.0 - (sum - 0.99) * 100.0)), 1.0);
return;
}

gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}`;

    let vertexShader = compileShader(gl, vertexShaderSrc, gl.VERTEX_SHADER);
    let fragmentShader = compileShader(gl, fragmentShaderSrc, gl.FRAGMENT_SHADER);

    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    let vertexData = new Float32Array([
        -1.0,  1.0, // top left
        -1.0, -1.0, // bottom left
        1.0,  1.0, // top right
        1.0, -1.0, // bottom right
    ]);
    let vertexDataBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

    let positionHandle = getAttribLocation(gl, program, "position");
    gl.enableVertexAttribArray(positionHandle);
    gl.vertexAttribPointer(
        positionHandle,
        2, // position is a vec2
        gl.FLOAT, // each component is a float
        false, // don't normalize values
        2 * 4, // two 4 byte float components per vertex
        0 // offset into each span of vertex data
    );

    let metaballsHandle = getUniformLocation(gl, program, "metaballs");

    function draw() {
        for (let i = 0; i < numMetaballs; i++) {
            let metaball = metaballs[i];
            metaball.x += metaball.vx;
            metaball.y += metaball.vy;

            if (metaball.x < metaball.r || metaball.x > width - metaball.r)
                metaball.vx *= -1;
            if (metaball.y < metaball.r || metaball.y > height - metaball.r)
                metaball.vy *= -1;
        }

        let dataToSendToGPU = new Float32Array(3 * numMetaballs);
        for (let i = 0; i < numMetaballs; i++) {
            let baseIndex = 3 * i;
            let mb = metaballs[i];
            dataToSendToGPU[baseIndex + 0] = mb.x;
            dataToSendToGPU[baseIndex + 1] = mb.y;
            dataToSendToGPU[baseIndex + 2] = mb.r;
        }
        gl.uniform3fv(metaballsHandle, dataToSendToGPU);

        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(draw);
    }

    draw();
}

export default function Background() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const hasInit = useRef(false);

    useEffect(() => {
        if (!canvasRef.current || hasInit.current)
            return;

        function resize() {
            canvasRef.current!.width = window.innerWidth;
            canvasRef.current!.height = window.innerHeight;
            width = window.innerWidth;
            height = window.innerHeight;
        }

        window.addEventListener("resize", resize);
        resize();

        hasInit.current = true;

        init(canvasRef.current);

        return () => window.removeEventListener("resize", resize);
    }, [canvasRef.current]);

    return (
        <canvas
            className="absolute inset-0 z-[-1] motion-reduce:hidden blur-xl opacity-50"
            ref={canvasRef}
        />
    );
}
