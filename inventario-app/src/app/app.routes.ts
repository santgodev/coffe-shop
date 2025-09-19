import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/tables', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { 
    path: '', 
    loadChildren: () => import('./layouts/main-layout/main-layout.module').then(m => m.MainLayoutModule)
  },
  { path: '**', redirectTo: '/tables' }
];