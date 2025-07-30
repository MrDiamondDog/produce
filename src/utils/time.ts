export function toTimerString(seconds: number) {
    const minutes = Math.floor(seconds / 60) % 60;
    const hours = Math.floor(seconds / 60 / 60);
    seconds = seconds % 60;

    return `${hours > 0 ? `${hours}:` : ""}${(minutes || "").toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
