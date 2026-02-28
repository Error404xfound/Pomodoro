import nextJest from "next/jest.js";

/**
 * Creates a Jest config compatible with Next.js transforms.
 */
const createJestConfig = nextJest({
  dir: "./",
});

/**
 * Project-specific Jest settings for browser-like component tests.
 */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(customJestConfig);
