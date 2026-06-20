/** @type {import("jest").Config} */
const config = {
  testEnvironment: "node",
  clearMocks: true,
  coverageProvider: "v8",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
};

export default config;
