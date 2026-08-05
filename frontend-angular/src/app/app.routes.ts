import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((c) => c.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then((c) => c.Register),
  },
  {
    path: 'pending',
    canActivate: [authGuard],
    loadComponent: () => import('./components/pending/pending').then((c) => c.Pending),
  },
  {
    path: 'rejected',
    loadComponent: () => import('./components/rejected/rejected').then((c) => c.Rejected),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout').then((c) => c.MainLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard').then((c) => c.Dashboard),
      },
      {
        path: 'requests',
        loadComponent: () => import('./components/requests/requests').then((c) => c.Requests),
      },
      {
        path: 'active',
        loadComponent: () => import('./components/active/active').then((c) => c.Active),
      },
      {
        path: 'history',
        loadComponent: () => import('./components/history/history').then((c) => c.History),
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile').then((c) => c.Profile),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
