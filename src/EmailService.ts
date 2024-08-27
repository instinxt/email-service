// src/EmailService.ts

import CircuitBreaker from "./CircuitBreaker";
import MockProvider from "./MockProvider";
import Queue from "./Queue";
import RateLimiter from "./RateLimiter";

interface Email {
	id: string;
	subject: string;
	body: string;
	recipient: string;
}

class EmailService {
	private providers: MockProvider[];
	private rateLimiter: RateLimiter;
	private queue: Queue;
	private circuitBreaker: CircuitBreaker;
	private status: Record<string, string>;

	constructor(
		providers: MockProvider[],
		rateLimit: number,
		circuitBreakerThreshold: number
	) {
		this.providers = providers;
		this.rateLimiter = new RateLimiter(rateLimit);
		this.queue = new Queue();
		this.circuitBreaker = new CircuitBreaker(circuitBreakerThreshold);
		this.status = {};
	}

	public async sendEmail(email: Email): Promise<string> {
		// Validate email fields
		if (!email.subject || !email.body || !email.recipient) {
			throw new Error(
				"Missing required fields: subject, body, and recipient are required."
			);
		}

		const sendAttempt = async (provider: MockProvider): Promise<string> => {
			try {
				this.circuitBreaker.reset();
				await this.rateLimiter.acquire();
				const response = await provider.sendEmail(email);
				this.status[email.id] = "Sent";
				return response;
			} catch (error) {
				this.status[email.id] = `Failed`;
				this.circuitBreaker.recordFailure();
				throw error;
			}
		};

		const tryProviders = async (): Promise<string> => {
			console.log(this.providers, "inside try providers");
			for (const provider of this.providers) {
				try {
					return await sendAttempt(provider);
				} catch (error) {
					if (this.circuitBreaker.isOpen()) {
						console.log(this.circuitBreaker.toString());
						throw new Error("All providers failed and circuit breaker is open");
					}
					console.log(`Provider failed, retrying with another provider...`);
				}
			}
			throw new Error("All providers failed");
		};

		this.queue.add(async () => {
			return await this.retryWithBackoff(tryProviders);
		});

		// Capture the response from the queue process
		const response = await this.queue.process();
		return response || "No response"; // Return the response or a default message
	}

	private async retryWithBackoff(fn: () => Promise<string>): Promise<string> {
		let attempts = 0;
		while (attempts < 5) {
			try {
				return await fn();
			} catch (error) {
				attempts++;
				const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
				await this.delay(delay);
			}
		}
		throw new Error("Max retries reached");
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

export default EmailService;
