// Écran d'inscription : /register
// Les appels au back sont simulés avec cy.intercept : aucun vrai serveur n'est utilisé.
describe('Register page', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display the registration form', () => {
    cy.contains('h5', 'Registration Form').should('be.visible');
    cy.get('input[formControlName="firstName"]').should('be.visible');
    cy.get('input[formControlName="lastName"]').should('be.visible');
    cy.get('input[formControlName="login"]').should('be.visible');
    cy.get('input[formControlName="password"]').should('be.visible');
  });

  it('should send the form to the API and display a success message', () => {
    // Le "faux back" répond 201 (Created) à POST /api/register
    cy.intercept('POST', '/api/register', { statusCode: 201 }).as('register');
    // Le composant affiche un alert("SUCCESS!! :-)") : on remplace window.alert par un espion pour le vérifier.
    // (Le vrai alert ne s'ouvre donc jamais.) Fonctionne dans tous les modes de Cypress.
    cy.window().then(win => cy.stub(win, 'alert').as('alert'));

    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="login"]').type('jdoe');
    cy.get('input[formControlName="password"]').type('secret');
    cy.contains('button', 'Register').click();

    // L'appel est parti avec le JSON attendu par le RegisterDTO du back
    cy.wait('@register').its('request.body').should('deep.equal', {
      firstName: 'John',
      lastName: 'Doe',
      login: 'jdoe',
      password: 'secret'
    });
    cy.get('@alert').should('have.been.calledWith', 'SUCCESS!! :-)');
  });

  it('should empty the form when Cancel is clicked', () => {
    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="login"]').type('jdoe');

    cy.contains('button', 'Cancel').click();

    cy.get('input[formControlName="firstName"]').should('have.value', '');
    cy.get('input[formControlName="login"]').should('have.value', '');
  });
});
