import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { UserService } from '../../core/service/user.service';
import { AuthService } from '../../core/service/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  // Faux services : on décide de ce qu'ils renvoient, sans appel réseau ni vrai localStorage
  const userServiceMock = { login: jest.fn() };
  const authServiceMock = { setToken: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // lance ngOnInit : crée le formulaire
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should store the token and go to /students when the login succeeds', () => {
    userServiceMock.login.mockReturnValue(of('jwt-token'));
    component.loginForm.setValue({ login: 'jdoe', password: 'secret' });

    component.onSubmit();

    expect(userServiceMock.login).toHaveBeenCalledWith({ login: 'jdoe', password: 'secret' });
    expect(authServiceMock.setToken).toHaveBeenCalledWith('jwt-token');
    expect(router.navigate).toHaveBeenCalledWith(['/students']);
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBeNull();
  });
});
