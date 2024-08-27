import request from "supertest";
import app from "../server";
import MockProvider from "../MockProvider";
import EmailService from "../EmailService";

describe("Email Service API", () => {
	it("should send an email successfully", async () => {
		const emailData = {
			id: "1",
			subject: "Test Email",
			body: "This is a test email.",
			recipient: "test@example.com",
		};

		const response = await request(app)
			.post("/send-email")
			.send(emailData)
			.set("Accept", "application/json");

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("message");
		expect(response.body.message).toBe("Email sent by Provider1"); // Expecting the first provider to succeed
	});

	it("should return an error for missing subject", async () => {
		const invalidEmailData = {
			id: "2",
			body: "This is a test email.",
			recipient: "test@example.com",
		};

		const response = await request(app)
			.post("/send-email")
			.send(invalidEmailData)
			.set("Accept", "application/json");

		expect(response.status).toBe(500);
		expect(response.body).toHaveProperty("error", "Internal server error");
	});

	it("should return an error for missing recipient", async () => {
		const invalidEmailData = {
			id: "3",
			subject: "Test Email",
			body: "This is a test email.",
		};

		const response = await request(app)
			.post("/send-email")
			.send(invalidEmailData)
			.set("Accept", "application/json");

		expect(response.status).toBe(500);
		expect(response.body).toHaveProperty("error", "Internal server error");
	});

	it("should return an error for rate limit exceeded", async () => {
		const emailData = {
			id: "4",
			subject: "Test Email",
			body: "This is a test email.",
			recipient: "test@example.com",
		};

		// Send requests that exceed the rate limit
		for (let i = 0; i < 10; i++) {
			await request(app)
				.post("/send-email")
				.send(emailData)
				.set("Accept", "application/json");
		}

		const response = await request(app)
			.post("/send-email")
			.send(emailData)
			.set("Accept", "application/json");

		expect(response.status).toBe(500);
		expect(response.body).toHaveProperty("error", "Rate limit exceeded");
	});

	it("should handle circuit breaker when all providers fail", async () => {
		const failingProviders = [
			new MockProvider("Provider1", 1.0), // Always fail
			new MockProvider("Provider2", 1.0), // Always fail
		];

		const failingEmailService = new EmailService(failingProviders, 10, 3);
		const emailData = {
			id: "5",
			subject: "Test Email",
			body: "This is a test email.",
			recipient: "test@example.com",
		};

		const response = await request(app)
			.post("/send-email")
			.send(emailData)
			.set("Accept", "application/json");

		expect(response.status).toBe(500);
		expect(response.body).toHaveProperty("error", "All providers failed");
	});
});
