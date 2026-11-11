import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { StudentFormComponent } from './student-form.component';
import { StudentService } from '../../core/service/student.service';
import { Student } from '../../core/models/Student';

describe('StudentFormComponent', () => {
  let fixture: ComponentFixture<StudentFormComponent>;
  let component: StudentFormComponent;
  let router: Router;

  const student: Student = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@doe.com' };
  const studentServiceMock = { getById: jest.fn(), create: jest.fn(), update: jest.fn() };

  // Le composant sert à créer (/students/new, pas d'id) et à modifier (/students/1/edit).
  // On le configure donc avec ou sans "id" dans l'URL.
  const createComponent = async (id: string | null) => {
    await TestBed.configureTestingModule({
      imports: [StudentFormComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } }
        },
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    studentServiceMock.getById.mockReturnValue(of(student));
    studentServiceMock.create.mockReturnValue(of(student));
    studentServiceMock.update.mockReturnValue(of(student));
  });

  describe('creation mode (/students/new)', () => {
    beforeEach(async () => {
      await createComponent(null);
    });

    it('should start with an empty form and not be in edit mode', () => {
      expect(component.isEdit).toBe(false);
      expect(studentServiceMock.getById).not.toHaveBeenCalled();
      expect(component.studentForm.value).toEqual({ firstName: '', lastName: '', email: '' });
    });

    it('should create the student and go back to the list', () => {
      component.studentForm.setValue({ firstName: 'John', lastName: 'Doe', email: 'john@doe.com' });

      component.onSubmit();

      expect(studentServiceMock.create).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com'
      });
      expect(studentServiceMock.update).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/students']);
    });
  });

  describe('edit mode (/students/1/edit)', () => {
    beforeEach(async () => {
      await createComponent('1');
    });

    it('should load the student and fill the form', () => {
      expect(component.isEdit).toBe(true);
      expect(studentServiceMock.getById).toHaveBeenCalledWith(1);
      expect(component.studentForm.value).toEqual({ firstName: 'John', lastName: 'Doe', email: 'john@doe.com' });
    });

    it('should update the student and go back to the list', () => {
      component.studentForm.setValue({ firstName: 'Jean', lastName: 'Dupont', email: 'jean@dupont.com' });

      component.onSubmit();

      expect(studentServiceMock.update).toHaveBeenCalledWith(1, {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@dupont.com'
      });
      expect(studentServiceMock.create).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/students']);
    });
  });
});
