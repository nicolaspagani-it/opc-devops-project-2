import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { StudentService } from './student.service';
import { Student, StudentRequest } from '../models/Student';

describe('StudentService', () => {
  let service: StudentService;
  // Faux serveur HTTP : il intercepte les requêtes du service, rien ne part sur le réseau.
  // On vérifie la requête envoyée et on choisit la réponse renvoyée.
  let httpMock: HttpTestingController;

  const student: Student = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@doe.com' };
  const studentRequest: StudentRequest = { firstName: 'John', lastName: 'Doe', email: 'john@doe.com' };

  // Exécuté avant CHAQUE test (comme @BeforeEach en JUnit)
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),         // le vrai HttpClient...
        provideHttpClientTesting(),  // ...branché sur le faux serveur
      ]
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Exécuté après chaque test : vérifie qu'aucune requête inattendue n'est restée sans réponse
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll should send a GET on /api/students and return the students', () => {
    // GIVEN : la liste que le "serveur" va renvoyer
    const students: Student[] = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@doe.com' },
      { id: 2, firstName: 'Jean', lastName: 'Dupont', email: 'jean@dupont.com' }
    ];

    // WHEN : on appelle le service et on s'abonne (sans subscribe, aucune requête ne part).
    // Le contenu du subscribe s'exécute quand la réponse arrive : c'est là qu'on vérifie le résultat.
    let result: Student[] | undefined;
    service.getAll().subscribe(response => result = response);

    // THEN 1 : une requête a été envoyée sur cette URL...
    const req = httpMock.expectOne('/api/students');
    // ... avec cette méthode HTTP
    expect(req.request.method).toBe('GET');

    // THEN 2 : on simule la réponse du serveur, ce qui déclenche le subscribe ci-dessus
    req.flush(students);
    expect(result).toEqual(students);

    // Preuve affichée dans le terminal
    console.log('===== PREUVE getAll =====');
    console.log('Requête envoyée : ' + req.request.method + ' ' + req.request.url);
    console.log('Réponse reçue   : ' + JSON.stringify(result));
    console.log('===== TEST REUSSI =====');
  });

  it('getById should send a GET on /api/students/1 and return the student', () => {
    let result: Student | undefined;
    service.getById(1).subscribe(response => result = response);

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('GET');
    req.flush(student);

    expect(result).toEqual(student);
  });

  it('create should send a POST on /api/students with the student', () => {
    let result: Student | undefined;
    service.create(studentRequest).subscribe(response => result = response);

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(studentRequest);
    req.flush(student);

    expect(result).toEqual(student);
  });

  it('update should send a PUT on /api/students/1 with the student', () => {
    let result: Student | undefined;
    service.update(1, studentRequest).subscribe(response => result = response);

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(studentRequest);
    req.flush(student);

    expect(result).toEqual(student);
  });

  it('delete should send a DELETE on /api/students/1', () => {
    let done = false;
    service.delete(1).subscribe(() => done = true);

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null); // le back répond 204, sans contenu

    expect(done).toBe(true);
  });
});
