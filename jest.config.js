/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'], // This line ensures Jest runs tests inside the __tests__ folder
  moduleFileExtensions: ['ts', 'js'],
};