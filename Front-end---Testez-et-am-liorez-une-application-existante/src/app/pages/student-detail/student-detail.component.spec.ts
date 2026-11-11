import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { StudentDetailComponent } from './student-detail.component';
import { StudentService } from '../../core/service/student.service';
import { Student } from '../../core/models/Student';

describe('StudentDetailComponent', () => {
  let fixture: ComponentFixture<StudentDetailComponent>;
  let component: StudentDetailComponent;
  let router: Router;

  const student: Student = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@doe.com' };
  const studentServiceMock = { getById: jest.fn(), delete: jest.fn() };

  const createComponent = () => {
    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    studentServiceMock.getById.mockReturnValue(of(student));
    studentServiceMock.delete.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentServiceMock },
        // Fausse route : l'URL est /students/1, donc le paramètre "id" vaut "1"
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should load the student of the URL and display it', () => {
    createComponent();

    expect(studentServiceMock.getById).toHaveBeenCalledWith(1);
    expect(component.student).toEqual(student);
    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('John');
    expect(text).toContain('Doe');
    expect(text).toContain('john@doe.com');
  });

  it('should delete the student and go back to the list when the user confirms', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    createComponent();

    component.onDelete();

    expect(studentServiceMock.delete).toHaveBeenCalledWith(1);
    expect(router.navigate).toHaveBeenCalledWith(['/students']);
  });

  it('should not delete anything when the user cancels', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    createComponent();

    component.onDelete();

    expect(studentServiceMock.delete).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
