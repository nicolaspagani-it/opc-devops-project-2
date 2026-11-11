import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { StudentsComponent } from './students.component';
import { StudentService } from '../../core/service/student.service';
import { Student } from '../../core/models/Student';

describe('StudentsComponent', () => {
  let fixture: ComponentFixture<StudentsComponent>;
  let component: StudentsComponent;

  const students: Student[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@doe.com' },
    { id: 2, firstName: 'Jean', lastName: 'Dupont', email: 'jean@dupont.com' }
  ];
  const studentServiceMock = { getAll: jest.fn(), delete: jest.fn() };

  // Crée le composant. ngOnInit (donc getAll) s'exécute au premier detectChanges
  const createComponent = () => {
    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    studentServiceMock.getAll.mockReturnValue(of(students));
    studentServiceMock.delete.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [StudentsComponent],
      providers: [
        provideRouter([]), // nécessaire pour les routerLink du template
        { provide: StudentService, useValue: studentServiceMock },
      ]
    }).compileComponents();
  });

  it('should load the students on init and display them in a table', () => {
    createComponent();

    expect(studentServiceMock.getAll).toHaveBeenCalledTimes(1);
    expect(component.students).toEqual(students);
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('John');
    expect(rows[1].textContent).toContain('jean@dupont.com');
  });

  it('should display a message when there is no student', () => {
    studentServiceMock.getAll.mockReturnValue(of([]));

    createComponent();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aucun étudiant.');
    expect((fixture.nativeElement as HTMLElement).querySelector('table')).toBeNull();
  });

  it('should delete the student and reload the list when the user confirms', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    createComponent();

    component.onDelete(students[0]);

    expect(studentServiceMock.delete).toHaveBeenCalledWith(1);
    expect(studentServiceMock.getAll).toHaveBeenCalledTimes(2); // chargement initial + rechargement
  });

  it('should not delete anything when the user cancels', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    createComponent();

    component.onDelete(students[0]);

    expect(studentServiceMock.delete).not.toHaveBeenCalled();
  });
});
