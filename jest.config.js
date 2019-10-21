module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  verbose: true,
  roots: [
    "<rootDir>/test"
  ],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
}