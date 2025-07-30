export function shuffle(array: any[]) {
    let currentIndex = array.length;

    while (currentIndex !== 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

export function randomFrom(arr: any[]): any {
    return arr[Math.floor(Math.random() * arr.length)];
}
