// src/CircuitBreaker.ts

class CircuitBreaker {
	private threshold: number;
	private failures: number;
	private state: "CLOSED" | "OPEN" | "HALF_OPEN";

	constructor(threshold: number) {
		this.threshold = threshold;
		this.failures = 0;
		this.state = "CLOSED"; // Other states: OPEN, HALF_OPEN
	}

	public recordFailure(): void {
		this.failures++;
		if (this.failures >= this.threshold) {
			this.state = "OPEN";
		}
	}

	public reset(): void {
		this.failures = 0;
		this.state = "CLOSED";
	}

	public isOpen(): boolean {
		return this.state === "OPEN";
	}

	public toString(): string {
		return `CircuitBreaker state: ${this.state}`;
	}
}

export default CircuitBreaker;
