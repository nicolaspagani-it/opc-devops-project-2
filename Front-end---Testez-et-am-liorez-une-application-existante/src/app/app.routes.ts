import { Routes } from '@angular/router';
import {RegisterComponent} from './pages/register/register.component';
import {LoginComponent} from './pages/login/login.component';
import {StudentsComponent} from './pages/students/students.component';
import {StudentDetailComponent} from './pages/student-detail/student-detail.component';
import {StudentFormComponent} from './pages/student-form/student-form.component';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'students',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  // Écrans protégés : il faut être connecté (token valide)
  {
    path: 'students',
    canActivate: [authGuard],
    children: [
      { path: '', component: StudentsComponent },
      // "new" doit être déclaré avant ":id"
      { path: 'new', component: StudentFormComponent },
      { path: ':id', component: StudentDetailComponent },
      { path: ':id/edit', component: StudentFormComponent },
    ]
  },
  {
    path: '**',
    redirectTo: 'students'
  }
];
