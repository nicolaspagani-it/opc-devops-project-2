module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts|js)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  // Compte TOUS les fichiers de l'appli, même ceux qu'aucun test n'importe encore
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/*mock*.ts',
    '!src/app/app.config.ts',
    '!src/app/app.routes.ts',
  ],
  // "text" : tableau dans le terminal / "html" : rapport détaillé dans coverage/
  coverageReporters: ['text', 'html'],
};
