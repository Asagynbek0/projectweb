import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Districts } from './pages/districts/districts';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { DistrictDetail } from './pages/district-detail/district-detail';
import { Register } from './pages/register/register';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'districts', component: Districts },
  { path: 'districts/:id', component: DistrictDetail },
  { path: 'dashboard', component: Dashboard },
  { path: 'login', component: Login },
  { path: 'register', component: Register }
];