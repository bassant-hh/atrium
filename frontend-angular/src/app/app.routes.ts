import { Routes } from '@angular/router';
import { Requists } from './components/requists/requists';
import { Activedeliveries } from './components/activedeliveries/activedeliveries';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((c) => c.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then((c) => c.Register),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard').then((c) => c.Dashboard),
  },
  { path: 'requests', canActivate: [authGuard], component: Requists },
  { path: 'active', canActivate: [authGuard], component: Activedeliveries },
  {
    path: 'pending',
    canActivate: [authGuard],
    loadComponent: () => import('./components/pending/pending').then((c) => c.Pending),
  },
  {
    path: 'rejected',
    loadComponent: () => import('./components/rejected/rejected').then((c) => c.Rejected),
  },
  { path: '**', redirectTo: 'login' },
];
