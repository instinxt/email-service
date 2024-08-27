// src/MockProvider.ts

class MockProvider {
	private name: string;
	private failProbability: number;

	constructor(name: string, failProbability: number = 0) {
		this.name = name;
		this.failProbability = failProbability;
	}

	public async sendEmail(email: { id: string }): Promise<string> {
		const randomProbability = Math.random();
		if (randomProbability < this.failProbability) {
			throw new Error(`${this.name} failed to send email.`);
		}
		return `Email sent by ${this.name}`;
	}
}

export default MockProvider;
