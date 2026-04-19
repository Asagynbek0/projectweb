import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Districts } from './pages/districts/districts';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'districts', component: Districts },
  { path: 'dashboard', component: Dashboard },
  { path: 'login', component: Login }
];