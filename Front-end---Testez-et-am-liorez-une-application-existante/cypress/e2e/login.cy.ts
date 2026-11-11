import { fakeJwt } from '../support/jwt';

// Écran de connexion : /login
describe('Login page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.contains('h5', 'Login Form').should('be.visible');
    cy.get('input[formControlName="login"]').should('be.visible');
    // Le mot de passe est masqué
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'password');
  });

  it('should log in, store the token and go to the students list', () => {
    const token = fakeJwt();
    // Le back renvoie le JWT en texte brut (pas en JSON)
    cy.intercept('POST', '/api/login', { statusCode: 200, body: token }).as('login');
    // Après la connexion, l'appli affiche la liste : on simule aussi cet appel
    cy.intercept('GET', '/api/students', []).as('getStudents');

    cy.get('input[formControlName="login"]').type('jdoe');
    cy.get('input[formControlName="password"]').type('secret');
    cy.contains('button', 'Login').click();

    // L'appel est parti avec le JSON attendu par le LoginRequestDTO du back
    cy.wait('@login').its('request.body').should('deep.equal', { login: 'jdoe', password: 'secret' });
    cy.location('pathname').should('eq', '/students');
    cy.window().its('localStorage').invoke('getItem', 'auth_token').should('eq', token);
    cy.contains('h2', 'Étudiants').should('be.visible');
  });

  it('should display "Connexion en cours..." and disable the button while waiting for the API', () => {
    // Réponse retardée de 1 seconde pour pouvoir observer l'état de chargement
    cy.intercept('POST', '/api/login', { statusCode: 200, body: fakeJwt(), delay: 1000 });
    cy.intercept('GET', '/api/students', []);

    cy.get('input[formControlName="login"]').type('jdoe');
    cy.get('input[formControlName="password"]').type('secret');
    cy.contains('button', 'Login').click();

    cy.contains('Connexion en cours...').should('be.visible');
    cy.contains('button', 'Login').should('be.disabled');
    // Une fois la réponse reçue, on quitte la page de login
    cy.location('pathname').should('eq', '/students');
  });
});
