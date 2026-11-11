// Écran "liste des étudiants" : /students (utilisateur connecté)
describe('Students list page', () => {
  beforeEach(() => {
    cy.loginByToken();
  });

  it('should display the students returned by the API', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');

    cy.visit('/students');

    cy.wait('@getStudents');
    cy.get('tbody tr').should('have.length', 2);
    cy.get('tbody tr').eq(0).should('contain', 'John').and('contain', 'Doe').and('contain', 'john@doe.com');
    cy.get('tbody tr').eq(1).should('contain', 'Jean').and('contain', 'jean@dupont.com');
    cy.contains('Aucun étudiant.').should('not.exist');
  });

  it('should display "Chargement..." while the list is loading', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json', delay: 1000 });

    cy.visit('/students');

    cy.contains('Chargement...').should('be.visible');
    cy.get('tbody tr').should('have.length', 2);
    cy.contains('Chargement...').should('not.exist');
  });

  it('should display a message when there is no student', () => {
    cy.intercept('GET', '/api/students', []);

    cy.visit('/students');

    cy.contains('Aucun étudiant.').should('be.visible');
    cy.get('table').should('not.exist');
  });

  it('should go to the creation form from "Ajouter un étudiant"', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' });
    cy.visit('/students');

    cy.contains('a', 'Ajouter un étudiant').click();

    cy.location('pathname').should('eq', '/students/new');
  });

  it('should go to the detail page from "Détail"', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' });
    // La page de détail charge l'étudiant 2 : on simule aussi cet appel
    cy.intercept('GET', '/api/students/2', { id: 2, firstName: 'Jean', lastName: 'Dupont', email: 'jean@dupont.com' });
    cy.visit('/students');

    cy.get('tbody tr').eq(1).contains('a', 'Détail').click();

    cy.location('pathname').should('eq', '/students/2');
    cy.contains('Prénom : Jean').should('be.visible');
  });

  it('should go to the edit form from "Modifier"', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' });
    // Le formulaire de modification charge l'étudiant 1 : on simule aussi cet appel
    cy.intercept('GET', '/api/students/1', { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@doe.com' });
    cy.visit('/students');

    cy.get('tbody tr').eq(0).contains('a', 'Modifier').click();

    cy.location('pathname').should('eq', '/students/1/edit');
    cy.get('input[formControlName="firstName"]').should('have.value', 'John');
  });

  describe('deletion', () => {
    // Le "faux back" garde une liste en mémoire : la suppression la modifie réellement,
    // et la liste rechargée par l'appli ne contient plus l'étudiant supprimé.
    let students: Array<{ id: number; firstName: string; lastName: string; email: string }>;

    beforeEach(() => {
      students = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@doe.com' },
        { id: 2, firstName: 'Jean', lastName: 'Dupont', email: 'jean@dupont.com' }
      ];
      cy.intercept('GET', '/api/students', req => req.reply(students)).as('getStudents');
    });

    it('should delete a student after confirmation and reload the list', () => {
      cy.intercept('DELETE', '/api/students/1', req => {
        students = students.filter(student => student.id !== 1);
        req.reply({ statusCode: 204 });
      }).as('deleteStudent');
      // Cypress accepte les confirm() par défaut ; on vérifie le message affiché
      const confirmStub = cy.stub().returns(true).as('confirm');
      cy.on('window:confirm', confirmStub);
      cy.visit('/students');

      cy.get('tbody tr').eq(0).contains('button', 'Supprimer').click();

      cy.get('@confirm').should('have.been.calledWith', 'Supprimer John Doe ?');
      cy.wait('@deleteStudent');
      cy.get('tbody tr').should('have.length', 1);
      cy.get('tbody tr').eq(0).should('contain', 'Jean');
      cy.contains('john@doe.com').should('not.exist');
    });

    it('should not delete anything when the confirmation is cancelled', () => {
      cy.intercept('DELETE', '/api/students/*', cy.spy().as('deleteCall'));
      cy.on('window:confirm', () => false);
      cy.visit('/students');

      cy.get('tbody tr').eq(0).contains('button', 'Supprimer').click();

      cy.get('@deleteCall').should('not.have.been.called');
      cy.get('tbody tr').should('have.length', 2);
    });
  });
});
