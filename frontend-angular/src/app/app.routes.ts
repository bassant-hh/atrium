import { Routes } from '@angular/router';
import { Requists } from './components/requists/requists';
import { Activedeliveries } from './components/activedeliveries/activedeliveries';

export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login').then(c => c.Login) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register').then(c => c.Register) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard').then(c => c.Dashboard) 
  },

  { path: 'requests', component: Requists },
  { path: 'active', component: Activedeliveries },
  { path: '**', redirectTo: 'login' }

];
