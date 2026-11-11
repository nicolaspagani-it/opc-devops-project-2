import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { StudentService } from '../../core/service/student.service';
import { Student } from '../../core/models/Student';

@Component({
  selector: 'app-students',
  imports: [CommonModule, RouterLink],
  templateUrl: './students.component.html',
  standalone: true
})
export class StudentsComponent implements OnInit {
  private studentService = inject(StudentService);
  private destroyRef = inject(DestroyRef);

  students: Student[] = [];
  loading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.errorMessage = null;
    this.studentService.getAll()
      .pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: students => this.students = students,
        error: () => this.errorMessage = 'Impossible de charger les étudiants'
      });
  }

  onDelete(student: Student): void {
    if (!confirm(`Supprimer ${student.firstName} ${student.lastName} ?`)) {
      return;
    }
    this.studentService.delete(student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadStudents(),
        error: () => this.errorMessage = 'La suppression a échoué'
      });
  }
}
