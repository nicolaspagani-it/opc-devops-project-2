// Écran "détail d'un étudiant" : /students/:id (utilisateur connecté)
describe('Student detail page', () => {
  const student = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@doe.com' };

  beforeEach(() => {
    cy.loginByToken();
  });

  it('should display the student of the URL', () => {
    cy.intercept('GET', '/api/students/1', student).as('getStudent');

    cy.visit('/students/1');

    cy.wait('@getStudent');
    cy.contains('h2', "Détail de l'étudiant").should('be.visible');
    cy.contains('Prénom : John').should('be.visible');
    cy.contains('Nom : Doe').should('be.visible');
    cy.contains('Email : john@doe.com').should('be.visible');
  });

  it('should display "Chargement..." while the student is loading', () => {
    cy.intercept('GET', '/api/students/1', { body: student, delay: 1000 });

    cy.visit('/students/1');

    cy.contains('Chargement...').should('be.visible');
    cy.contains('Prénom : John').should('be.visible');
    cy.contains('Chargement...').should('not.exist');
  });

  it('should go to the edit form from "Modifier"', () => {
    cy.intercept('GET', '/api/students/1', student);
    cy.visit('/students/1');

    cy.contains('a', 'Modifier').click();

    cy.location('pathname').should('eq', '/students/1/edit');
  });

  it('should go back to the list from "Retour à la liste"', () => {
    cy.intercept('GET', '/api/students/1', student);
    cy.intercept('GET', '/api/students', { fixture: 'students.json' });
    cy.visit('/students/1');

    cy.contains('a', 'Retour à la liste').click();

    cy.location('pathname').should('eq', '/students');
    cy.get('tbody tr').should('have.length', 2);
  });

  describe('deletion', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/students/1', student);
    });

    it('should delete the student after confirmation and go back to the list', () => {
      cy.intercept('DELETE', '/api/students/1', { statusCode: 204 }).as('deleteStudent');
      cy.intercept('GET', '/api/students', []);
      cy.visit('/students/1');
      // On remplace window.confirm par un espion qui répond "OK" (le vrai confirm ne s'ouvre jamais)
      cy.window().then(win => cy.stub(win, 'confirm').returns(true).as('confirm'));

      cy.contains('button', 'Supprimer').click();

      cy.get('@confirm').should('have.been.calledWith', 'Supprimer John Doe ?');
      cy.wait('@deleteStudent');
      cy.location('pathname').should('eq', '/students');
      cy.contains('Aucun étudiant.').should('be.visible');
    });

    it('should stay on the page when the confirmation is cancelled', () => {
      cy.intercept('DELETE', '/api/students/1', cy.spy().as('deleteCall'));
      cy.visit('/students/1');
      // L'utilisateur répond "Annuler" à la confirmation
      cy.window().then(win => cy.stub(win, 'confirm').returns(false).as('confirm'));

      cy.contains('button', 'Supprimer').click();

      cy.get('@deleteCall').should('not.have.been.called');
      cy.location('pathname').should('eq', '/students/1');
    });
  });
});
