import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { StudentService } from '../../core/service/student.service';
import { StudentRequest } from '../../core/models/Student';

// Un seul composant pour l'ajout (/students/new) et la modification (/students/:id/edit)
@Component({
  selector: 'app-student-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-form.component.html',
  standalone: true
})
export class StudentFormComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  studentForm: FormGroup = new FormGroup({});
  studentId: number | null = null;
  submitted = false;
  loading = false;
  errorMessage: string | null = null;

  get isEdit(): boolean {
    return this.studentId !== null;
  }

  get form() {
    return this.studentForm.controls;
  }

  ngOnInit(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentId = Number(id);
      this.loading = true;
      this.studentService.getById(this.studentId)
        .pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: student => this.studentForm.patchValue({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email
          }),
          error: () => this.errorMessage = 'Étudiant introuvable'
        });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    if (this.studentForm.invalid) {
      return;
    }
    const student: StudentRequest = {
      firstName: this.studentForm.get('firstName')?.value,
      lastName: this.studentForm.get('lastName')?.value,
      email: this.studentForm.get('email')?.value
    };
    const request$ = this.isEdit
      ? this.studentService.update(this.studentId!, student)
      : this.studentService.create(student);

    this.loading = true;
    request$
      .pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/students']),
        error: (error: HttpErrorResponse) => {
          // 400 : email déjà utilisé ou données invalides
          this.errorMessage = error.status === 400
            ? (error.error?.message ?? 'Données invalides')
            : 'Une erreur est survenue';
        }
      });
  }
}
