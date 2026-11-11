// Chargé automatiquement avant chaque fichier de test E2E.

// Collecte la couverture de code (V8) pendant les tests : voir cypress.config.ts
import 'cypress-monocart-coverage/support';
import { fakeJwt } from './jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Simule un utilisateur déjà connecté : place un token valide dans le localStorage. */
      loginByToken(): Chainable<void>;
    }
  }
}

// Garde-fou : tout appel /api qu'un test n'a pas simulé fait échouer le test.
// Sans lui, la requête partirait vers le vrai back (proxy de ng serve) et le résultat dépendrait de lui.
// Les cy.intercept définis dans les tests sont prioritaires sur celui-ci (le plus récent gagne).
beforeEach(() => {
  cy.intercept('/api/**', req => {
    throw new Error(`Appel API non simulé : ${req.method} ${req.url}`);
  });
});

Cypress.Commands.add('loginByToken', () => {
  // Le localStorage est vidé entre deux tests par Cypress : on le remplit avant chaque besoin.
  // On visite d'abord une page quelconque du site pour avoir accès à son localStorage.
  cy.visit('/login');
  cy.window().then(win => win.localStorage.setItem('auth_token', fakeJwt()));
});
