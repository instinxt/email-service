// src/server.ts

import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import EmailService from "./EmailService";
import MockProvider from "./MockProvider";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Mocking the providers to simulate different behaviors
const providers = [
	new MockProvider("Provider1", 0.0), // Always succeed
	new MockProvider("Provider2", 1.0), // Always fail
];

// Create an instance of EmailService
const emailService = new EmailService(providers, 10, 3); // 10 requests/min, 3 failures for circuit breaker

// Endpoint to send an email
app.post("/send-email", async (req: Request, res: Response) => {
	const email = req.body;

	try {
		const result = await emailService.sendEmail(email);
		res.status(200).json({ message: result });
	} catch (error) {
		console.log("Error sending email", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
