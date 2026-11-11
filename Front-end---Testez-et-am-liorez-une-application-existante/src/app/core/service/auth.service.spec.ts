import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

// Fabrique un faux JWT : en-tête.contenu.signature, où le contenu est du JSON encodé en base64.
// AuthService ne lit que le champ "exp" (date d'expiration, en secondes).
function makeToken(exp: number): string {
  return 'header.' + btoa(JSON.stringify({ sub: 'login', exp })) + '.signature';
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear(); // chaque test repart sans token
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setToken should store the token and getToken should return it', () => {
    service.setToken('abc');

    expect(service.getToken()).toBe('abc');
    expect(localStorage.getItem('auth_token')).toBe('abc');
  });

  it('getToken should return null when there is no token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('logout should remove the token', () => {
    service.setToken('abc');

    service.logout();

    expect(service.getToken()).toBeNull();
  });

  it('isLoggedIn should be false when there is no token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn should be true with a token that is not expired', () => {
    const inOneHour = Math.floor(Date.now() / 1000) + 3600;
    service.setToken(makeToken(inOneHour));

    expect(service.isLoggedIn()).toBe(true);
  });
});
