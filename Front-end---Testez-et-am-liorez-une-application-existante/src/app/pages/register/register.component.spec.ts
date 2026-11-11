import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from '../../core/service/user.service';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  // Faux service : un objet avec la méthode register simulée
  const userServiceMock = { register: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    // alert n'est pas implémenté dans jsdom : on le remplace par un espion
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        { provide: UserService, useValue: userServiceMock },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call the service with the form values when the form is valid', () => {
    userServiceMock.register.mockReturnValue(of({}));
    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      login: 'jdoe',
      password: 'secret'
    });

    component.onSubmit();

    expect(userServiceMock.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      login: 'jdoe',
      password: 'secret'
    });
    expect(window.alert).toHaveBeenCalled();
  });

  it('should reset the form and the submitted state on reset', () => {
    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      login: 'jdoe',
      password: 'secret'
    });
    component.onSubmit();

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.registerForm.value.firstName).toBeNull();
  });
});
