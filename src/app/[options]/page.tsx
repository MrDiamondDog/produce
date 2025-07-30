"use client";

import Button, { ButtonStyles } from "@/components/Button";
import TodoItem from "@/components/Todo";
import Divider from "@/components/Divider";
import Input from "@/components/Input";
import Subtext from "@/components/Subtext";
import { toTimerString } from "@/utils/time";
import { Gauge, gaugeClasses } from "@mui/x-charts";
import { ArrowLeft, Eye, EyeOff, Pause, Play, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import SlidingPuzzleGame from "@/components/games/SlidingPuzzle";

export type Options = {
    timer: number;
    break: number;
    tasks: string[];
}

function GaugeCenter({ children }: React.PropsWithChildren) {
    return <foreignObject width="100%" height="100%" className="relative">
        <div className="absolute-center flex flex-col items-center">
            {children}
        </div>
    </foreignObject>;
}

export default function HomePage({ params }: { params: Promise<{ options: string }> }) {
    const [tasks, setTasks] = useState<Record<string, boolean>>({});

    const [timerSeconds, setTimerSeconds] = useState(0);
    const [breakSeconds, setBreakSeconds] = useState(0);

    const [secondsPassed, setSecondsPassed] = useState(0);

    const [state, setState] = useState<"work" | "break" | "finished">("work");
    const [paused, setPaused] = useState(false);
    const [timerVisible, setTimerVisible] = useState(true);

    const [gamesOpen, setGamesOpen] = useState(false);
    const [game, setGame] = useState("");

    const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout>();

    const [taskInput, setTaskInput] = useState("");

    function updateTimer() {
        setSecondsPassed(curr => curr + 1);
    }

    function makeInterval() {
        if (!updateInterval)
            setUpdateInterval(setInterval(updateTimer, 1000));
    }

    function addTask() {
        if (!taskInput)
            return;
        setTasks({ ...tasks, [taskInput]: false });
        setTaskInput("");
    }

    useEffect(() => {
        params.then(p => {
            const options = JSON.parse(atob(decodeURIComponent(p.options))) as Options;

            setTasks(options.tasks.reduce((prev, curr) => ({ ...prev, [curr]: false }), { }));
            setTimerSeconds(options.timer * 60);
            setBreakSeconds(options.break * 60);

            makeInterval();
        });
    }, []);

    useEffect(() => {
        if (!timerSeconds)
            return;
        if (secondsPassed <= (state === "work" ? timerSeconds : breakSeconds))
            return;

        setSecondsPassed(0);
        setState(state === "work" ? "break" : "work");
    }, [secondsPassed]);

    useEffect(() => {
        if (!timerSeconds)
            return;

        if (paused) {
            clearInterval(updateInterval);
            setUpdateInterval(undefined);
        } else {
            makeInterval();
        }
    }, [paused]);

    return timerSeconds && <>
        <div
            className={`transition-opacity flex gap-2 items-center 
                ${gamesOpen ? "absolute top-2 left-2" : "absolute-center"} 
                ${state === "finished" && "pointer-events-none"}`}
            style={{ opacity: state === "finished" ? "0" : "100%" }}
        >
            <div>
                <Gauge
                    width={200}
                    height={200}
                    value={((state === "work" ? timerSeconds : breakSeconds) - secondsPassed) /
                (state === "work" ? timerSeconds : breakSeconds) * 100}
                    sx={() => ({
                        [`& .${gaugeClasses.valueText}`]: {
                            display: "none",
                        },
                        [`& .${gaugeClasses.valueText} text`]: {
                            fill: "white",
                        },
                        [`& .${gaugeClasses.valueArc}`]: {
                            fill: "var(--color-primary)",
                        },
                        [`& .${gaugeClasses.referenceArc}`]: {
                            fill: "var(--color-bg-light)",
                        },
                    })}
                    className="drop-shadow-lg"
                >
                    <GaugeCenter>
                        <Subtext>{state}</Subtext>
                        {timerVisible && <h3>{toTimerString((state === "work" ? timerSeconds : breakSeconds) - secondsPassed)}</h3>}
                        {!timerVisible && <h3>--</h3>}

                        <div className="flex gap-1">
                            {!paused && <Pause className="cursor-pointer" onClick={() => setPaused(true)} />}
                            {paused && <Play className="cursor-pointer" onClick={() => setPaused(false)} />}

                            {timerVisible && <Eye className="cursor-pointer" onClick={() => setTimerVisible(false)} />}
                            {!timerVisible && <EyeOff className="cursor-pointer" onClick={() => setTimerVisible(true)} />}
                        </div>
                    </GaugeCenter>
                </Gauge>

                {(state === "break" && !gamesOpen) && <Button className="w-full" onClick={() => {
                    setGamesOpen(true);
                    setGame("");
                }}>
                    Break Games
                </Button>}
            </div>

            {!gamesOpen && <>
                <Divider vertical />

                <div>
                    <h2>Todo</h2>

                    <div className="flex gap-1 w-full">
                        <Input
                            placeholder="Add task"
                            className="w-full"
                            value={taskInput}
                            onChange={e => setTaskInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter")
                                    addTask();
                            }}
                        />
                        <Button onClick={addTask}><Plus /></Button>
                    </div>

                    <div className="flex flex-col gap-1 max-h-[400px] overflow-y-scroll overflow-x-hidden">
                        {Object.keys(tasks).map((t, i) => <TodoItem
                            label={t}
                            key={i}
                            checked={tasks[t]}
                            onChange={c => setTasks({ ...tasks, [t]: c })}
                            onEdit={label => {
                                const v = tasks[t];
                                delete tasks[t];
                                setTasks({ ...tasks, [label]: v });
                            }}
                            onDelete={() => {
                                delete tasks[t];
                                setTasks({ ...tasks });
                            }}
                        />)}
                    </div>

                    {Object.keys(tasks).filter(k => !tasks[k]).length === 0 && <Button
                        className="mt-1"
                        onClick={() => setState("finished")}
                    >
                        All Done
                    </Button>}
                </div>
            </>}
        </div>

        {gamesOpen && <>
            {!game && <div className="flex flex-col gap-1 absolute-center">
                <Button onClick={() => setGamesOpen(false)}><ArrowLeft /> Back</Button>
                <Divider className="!mb-0" />
                <h2>Games</h2>
                <Button onClick={() => setGame("puzzle")}>Sliding Puzzle</Button>
                <Button onClick={() => setGame("snake")}>Snake</Button>
                <Button onClick={() => setGame("pong")}>Pong</Button>
            </div>}

            <SlidingPuzzleGame open={game === "puzzle"} onClose={() => setGame("")} />
        </>}

        <div className={`${state !== "finished" && "pointer-events-none !opacity-0"} opacity-100 transition-opacity`}>
            <Confetti
                className="absolute inset-0"
                numberOfPieces={50}
                initialVelocityX={4}
                initialVelocityY={{ min: -5, max: -15 }}
                confettiSource={{ x: window.innerWidth / 2, y: window.innerHeight / 2, w: 0, h: 0 }}
                tweenDuration={200}
                gravity={0.2}
                recycle={false}
                run={state === "finished"}
            />
            <div className="absolute-center text-center flex flex-col gap-1 items-center max-w-[300px]">
                <h1>Good job!</h1>
                <p>You got stuff done.</p>
                <Subtext>Tip: Bookmark this page and it will keep the options you set!</Subtext>
                <a href="/"><Button><ArrowLeft /> Home</Button></a>
                <a href="https://github.com/mrdiamonddog/produce">
                    <Button look={ButtonStyles.secondary} className="flex items-center gap-1">
                        <Star /> Star us on GitHub!
                    </Button>
                </a>
            </div>
        </div>
    </>;
}
