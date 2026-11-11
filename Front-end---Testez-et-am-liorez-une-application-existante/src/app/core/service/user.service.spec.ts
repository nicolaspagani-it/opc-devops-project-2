import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Register } from '../models/Register';
import { Login } from '../models/Login';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('register should send a POST on /api/register with the user', () => {
    const user: Register = { firstName: 'John', lastName: 'Doe', login: 'jdoe', password: 'secret' };

    service.register(user).subscribe();

    const req = httpMock.expectOne('/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);
    req.flush(null);
  });

  it('login should send a POST on /api/login and return the token as text', () => {
    const credentials: Login = { login: 'jdoe', password: 'secret' };

    let token: string | undefined;
    service.login(credentials).subscribe(response => token = response);

    const req = httpMock.expectOne('/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    // Le back renvoie le JWT en texte brut, pas en JSON
    expect(req.request.responseType).toBe('text');
    req.flush('the-jwt-token');

    expect(token).toBe('the-jwt-token');
  });
});
