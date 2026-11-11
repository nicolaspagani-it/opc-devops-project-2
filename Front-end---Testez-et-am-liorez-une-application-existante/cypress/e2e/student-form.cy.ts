// Écran "formulaire étudiant" : création (/students/new) et modification (/students/:id/edit)
describe('Student form page', () => {
  beforeEach(() => {
    cy.loginByToken();
  });

  describe('creation (/students/new)', () => {
    beforeEach(() => {
      cy.visit('/students/new');
    });

    it('should display an empty form', () => {
      cy.contains('h2', 'Ajouter un étudiant').should('be.visible');
      cy.get('input[formControlName="firstName"]').should('have.value', '');
      cy.get('input[formControlName="lastName"]').should('have.value', '');
      cy.get('input[formControlName="email"]').should('have.value', '');
      cy.contains('button', 'Ajouter').should('be.visible');
    });

    it('should create the student and go back to the list', () => {
      // Le "faux back" répond 201 avec l'étudiant créé (son id est généré par le back)
      cy.intercept('POST', '/api/students', {
        statusCode: 201,
        body: { id: 3, firstName: 'John', lastName: 'Doe', email: 'john@doe.com' }
      }).as('createStudent');
      cy.intercept('GET', '/api/students', { fixture: 'students.json' });

      cy.get('input[formControlName="firstName"]').type('John');
      cy.get('input[formControlName="lastName"]').type('Doe');
      cy.get('input[formControlName="email"]').type('john@doe.com');
      cy.contains('button', 'Ajouter').click();

      // Le JSON envoyé correspond au StudentRequestDTO du back (sans id)
      cy.wait('@createStudent').its('request.body').should('deep.equal', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com'
      });
      cy.location('pathname').should('eq', '/students');
    });

    it('should display "Chargement..." and disable the button while saving', () => {
      cy.intercept('POST', '/api/students', {
        statusCode: 201,
        body: { id: 3, firstName: 'John', lastName: 'Doe', email: 'john@doe.com' },
        delay: 1000
      });
      cy.intercept('GET', '/api/students', []);
      cy.get('input[formControlName="firstName"]').type('John');
      cy.get('input[formControlName="lastName"]').type('Doe');
      cy.get('input[formControlName="email"]').type('john@doe.com');

      cy.contains('button', 'Ajouter').click();

      cy.contains('Chargement...').should('be.visible');
      cy.contains('button', 'Ajouter').should('be.disabled');
      cy.location('pathname').should('eq', '/students');
    });

    it('should go back to the list with "Annuler" without saving', () => {
      cy.intercept('POST', '/api/students', cy.spy().as('createCall'));
      cy.intercept('GET', '/api/students', { fixture: 'students.json' });

      cy.contains('a', 'Annuler').click();

      cy.location('pathname').should('eq', '/students');
      cy.get('@createCall').should('not.have.been.called');
    });
  });

  describe('modification (/students/1/edit)', () => {
    const student = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@doe.com' };

    it('should load the student and fill the form', () => {
      cy.intercept('GET', '/api/students/1', student).as('getStudent');

      cy.visit('/students/1/edit');

      cy.wait('@getStudent');
      cy.contains('h2', "Modifier l'étudiant").should('be.visible');
      cy.get('input[formControlName="firstName"]').should('have.value', 'John');
      cy.get('input[formControlName="lastName"]').should('have.value', 'Doe');
      cy.get('input[formControlName="email"]').should('have.value', 'john@doe.com');
      cy.contains('button', 'Enregistrer').should('be.visible');
    });

    it('should update the student and go back to the list', () => {
      cy.intercept('GET', '/api/students/1', student);
      cy.intercept('PUT', '/api/students/1', {
        statusCode: 200,
        body: { id: 1, firstName: 'Jean', lastName: 'Dupont', email: 'jean@dupont.com' }
      }).as('updateStudent');
      cy.intercept('GET', '/api/students', { fixture: 'students.json' });
      cy.visit('/students/1/edit');

      cy.get('input[formControlName="firstName"]').clear().type('Jean');
      cy.get('input[formControlName="lastName"]').clear().type('Dupont');
      cy.get('input[formControlName="email"]').clear().type('jean@dupont.com');
      cy.contains('button', 'Enregistrer').click();

      cy.wait('@updateStudent').its('request.body').should('deep.equal', {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@dupont.com'
      });
      cy.location('pathname').should('eq', '/students');
    });
  });
});
