import { defineConfig } from 'cypress';
import CypressCoveragePlugin from 'cypress-monocart-coverage';

export default defineConfig({
  e2e: {
    // Le front doit tourner (ng serve) : Cypress y accède comme un vrai navigateur.
    // Le back n'est PAS nécessaire : tous les appels /api sont simulés dans les tests (cy.intercept).
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    setupNodeEvents(on, config) {
      // Couverture de code des tests E2E : Chrome mesure quelles lignes du code de l'appli sont exécutées.
      // Elle ne fonctionne que dans un navigateur Chromium : lancer avec "--browser chrome".
      CypressCoveragePlugin(on, config, {
        name: 'Couverture E2E du front-end',
        outputDir: './coverage-e2e',
        // Fichiers servis par ng serve à mesurer (le code de l'appli est dans main.js et les chunks)
        entryFilter: {
          '**/main.js': true,
          '**/chunk-*.js': true,
        },
        // Grâce aux source maps, on ne garde que les fichiers TypeScript de l'appli
        sourceFilter: {
          '**/src/app/**': true,
        },
        reports: ['v8', 'console-summary', 'json-summary', 'lcov'],
      });
      return config;
    },
  },
});
