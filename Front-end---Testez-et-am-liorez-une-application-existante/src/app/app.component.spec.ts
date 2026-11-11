import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './core/service/auth.service';

describe('AppComponent', () => {
  const authServiceMock = { isLoggedIn: jest.fn(), logout: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    authServiceMock.isLoggedIn.mockReturnValue(false);
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'etudiant-frontend' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('etudiant-frontend');
  });

  it('should not display the navigation when the user is not logged in', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('nav')).toBeNull();
  });

  it('should display the navigation when the user is logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.textContent).toContain('Se déconnecter');
  });

  it('should log out and go to /login when the logout button is clicked', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('nav button')!.click();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
