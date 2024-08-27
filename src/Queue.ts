// src/Queue.ts

class Queue {
	private queue: (() => Promise<string>)[];

	constructor() {
		this.queue = [];
	}

	public add(task: () => Promise<string>): void {
		this.queue.push(task);
	}

	public async process(): Promise<string | undefined> {
		while (this.queue.length) {
			const task = this.queue.shift();
			if (task) {
				const result = await task(); // Capture the result of the task
				return result; // Return the result of the processed task
			}
		}
		return undefined; // Return undefined if no tasks were processed
	}
}

export default Queue;
