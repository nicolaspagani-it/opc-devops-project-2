// Sécurité : un utilisateur non connecté ne doit pouvoir ouvrir aucun écran étudiant (authGuard).
describe('Access control', () => {
  describe('when the user is not logged in', () => {
    // Aucun token dans le localStorage : le guard doit rediriger vers /login
    ['/students', '/students/new', '/students/1', '/students/1/edit', '/', '/unknown-page'].forEach(url => {
      it(`should redirect ${url} to /login`, () => {
        // Aucun appel au back ne doit partir : l'écran n'est jamais ouvert
        cy.intercept('GET', '/api/students*', cy.spy().as('apiCall'));

        cy.visit(url);

        cy.location('pathname').should('eq', '/login');
        cy.contains('h5', 'Login Form').should('be.visible');
        cy.get('@apiCall').should('not.have.been.called');
      });
    });

    it('should not display the navigation bar', () => {
      cy.visit('/login');

      cy.get('nav').should('not.exist');
    });
  });

  describe('when the user is logged in', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
      cy.loginByToken();
    });

    it('should open the students list, and redirect "/" to it', () => {
      cy.visit('/');

      cy.location('pathname').should('eq', '/students');
      cy.contains('h2', 'Étudiants').should('be.visible');
    });

    it('should send the Bearer token with the API calls', () => {
      cy.visit('/students');

      cy.wait('@getStudents').its('request.headers.authorization').should('match', /^Bearer .+/);
    });

    it('should display the navigation bar and log out', () => {
      cy.visit('/students');
      cy.get('nav').should('be.visible');
      cy.get('nav').contains('a', 'Étudiants');

      cy.contains('button', 'Se déconnecter').click();

      cy.location('pathname').should('eq', '/login');
      cy.window().its('localStorage').invoke('getItem', 'auth_token').should('be.null');
      cy.get('nav').should('not.exist');
      // Après la déconnexion, les écrans protégés sont de nouveau interdits
      cy.visit('/students');
      cy.location('pathname').should('eq', '/login');
    });
  });
});
