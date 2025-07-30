"use client";

import Button, { ButtonStyles } from "@/components/Button";
import TodoItem from "@/components/Todo";
import Divider from "@/components/Divider";
import Input from "@/components/Input";
import Subtext from "@/components/Subtext";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
    const [step, setStep] = useState(0);

    const [taskInput, setTaskInput] = useState<string>("");
    const [tasks, setTasks] = useState<string[]>([]);
    const [timerLength, setTimerLength] = useState("");
    const [breakLength, setBreakLength] = useState("");

    const [error, setError] = useState("");

    const router = useRouter();

    function addTask() {
        if (!taskInput)
            return;
        setTaskInput("");
        setTasks([...tasks, taskInput]);
    }

    function start() {
        const options = {
            timer: timerLength || 45,
            break: breakLength || 10,
            tasks,
        };

        const optionsString = encodeURIComponent(btoa(JSON.stringify(options)));

        router.push(`/${optionsString}`);
    }

    useEffect(() => {
        if (Number.isNaN(timerLength) || Number.isNaN(breakLength) || parseInt(timerLength) <= 0 || parseInt(breakLength) <= 0)
            setError("Please input valid timer lengths");
        else
            setError("");
    }, [timerLength, breakLength]);

    return (<div className="absolute-center w-[375px]">
        <h1
            className="text-transparent bg-clip-text inline-block bg-gradient-to-r from-primary to-success text-6xl text-center w-full"
        >
            Produce
        </h1>
        <Subtext className="text-center w-full">Make a todo list, set a timer and Produce!</Subtext>

        <Divider />

        {step === 0 && <>
            <div className="flex gap-1 w-full">
                <Input
                    placeholder="What are you getting done?"
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

            <div className="flex flex-col gap-1 mt-1 max-h-[200px] overflow-y-scroll overflow-x-hidden">
                {tasks.map((t, i) => <TodoItem
                    label={t}
                    disabled
                    key={i}
                    onEdit={label => setTasks([...tasks.slice(0, i), label, ...tasks.slice(i + 1)])}
                    onDelete={() => setTasks([...tasks.slice(0, i), ...tasks.slice(i + 1)])}
                />)}
            </div>
        </>}

        {step === 1 && <div className="flex flex-col gap-1">
            <Input label="Timer Length (m)" value={timerLength} onChange={e => setTimerLength(e.target.value)} placeholder="45" />
            <Input label="Break Length (m)" value={breakLength} onChange={e => setBreakLength(e.target.value)} placeholder="10" />
        </div>}

        {step === 2 && <div className="text-center">
            <p className="text-wrap">{tasks.length} tasks</p>
            <p className="text-wrap">{breakLength || 10} minute breaks every {timerLength || 45} minutes</p>
            <b>Ready?</b>
        </div>}

        <Divider />

        <p className="text-danger">{error}</p>

        <div className="flex gap-2 justify-end">
            {step > 0 && <Button disabled={!!error} onClick={() => setStep(p => p - 1)} look={ButtonStyles.secondary}>
                <ArrowLeft /> Back
            </Button>}
            {step !== 2 && <Button disabled={!!error} onClick={() => setStep(p => p + 1)}>
                Next <ArrowRight />
            </Button>}
            {step === 2 && <Button disabled={!!error} onClick={start}>
                <Check /> Start
            </Button>}
        </div>
    </div>);
}
