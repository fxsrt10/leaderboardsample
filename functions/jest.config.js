module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: ['index.js'],
    coverageThreshold: {
        global: {
            statements: 60,
            branches: 60,
            functions: 60,
            lines: 60
        }
    },
    testTimeout: 10000
}; 