import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "node",
	moduleNameMapper: {
		// Adjust if you have specific paths or aliases
		"^src/(.*)$": "<rootDir>/src/$1",
	},
};

export default config;
