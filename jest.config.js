module.exports = {
  collectCoverage: true,
  verbose: true,
  collectCoverageFrom: ['src/**/*.ts'],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(./tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
}