module.exports = {
	roots: ["<rootDir>/src", "<rootDir>/tests"],
	collectCoverageFrom: ["**/src/**/*.ts"],
	collectCoverage: true,
	transform: {'^.+\\.ts?$': 'ts-jest'},
	testEnvironment: 'node',
	testMatch: ['**/tests/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    moduleNameMapper: {
        "@app(.*)$": "<rootDir>/src/$1",
    },
	globals: {
		"ts-jest": {
			tsConfig: "tsconfig.json"
		}
	},
	testEnvironment: 'node',
	testRunner: "jest-circus/runner"
};
