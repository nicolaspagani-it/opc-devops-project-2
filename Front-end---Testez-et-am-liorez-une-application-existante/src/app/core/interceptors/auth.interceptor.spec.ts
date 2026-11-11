import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../service/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        // On branche l'intercepteur sur le HttpClient, comme dans app.config.ts
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    // On remplace navigate par un espion : on vérifie l'appel sans vraiment naviguer
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add the Bearer token to a protected request', () => {
    authService.setToken('my-token');

    http.get('/api/students').subscribe();

    const req = httpMock.expectOne('/api/students');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush([]);
  });

  it('should not add the header when there is no token', () => {
    http.get('/api/students').subscribe();

    const req = httpMock.expectOne('/api/students');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('should not add the token to /api/login and /api/register', () => {
    authService.setToken('my-token');

    http.post('/api/login', {}).subscribe();
    http.post('/api/register', {}).subscribe();

    const loginReq = httpMock.expectOne('/api/login');
    const registerReq = httpMock.expectOne('/api/register');
    expect(loginReq.request.headers.has('Authorization')).toBe(false);
    expect(registerReq.request.headers.has('Authorization')).toBe(false);
    loginReq.flush('token');
    registerReq.flush(null);
  });
});
