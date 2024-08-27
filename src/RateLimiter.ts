// src/RateLimiter.ts

class RateLimiter {
	private maxRequestsPerMinute: number;
	private requests: number;
	private resetInterval: number;
	private lastReset: number;

	constructor(maxRequestsPerMinute: number) {
		this.maxRequestsPerMinute = maxRequestsPerMinute;
		this.requests = 0;
		this.resetInterval = 60000; // 1 minute
		this.lastReset = Date.now();
	}

	public async acquire(): Promise<void> {
		const now = Date.now();
		if (now - this.lastReset > this.resetInterval) {
			this.requests = 0;
			this.lastReset = now;
		}

		if (this.requests >= this.maxRequestsPerMinute) {
			throw new Error("Rate limit exceeded");
		}

		this.requests++;
	}
}

export default RateLimiter;
