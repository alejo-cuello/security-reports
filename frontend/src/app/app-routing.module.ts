import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HttpGuard } from './core/http.guard';

const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    data: { noUser: false },
    canActivate: [HttpGuard]
  },
  {
    path: 'claim',
    loadChildren: () => import('./modules/claim/claim.module').then(m => m.ClaimPageModule),
    data: { noUser: false },
    canActivate: [HttpGuard]
  },
  {
    path: 'change-password',
    loadChildren: () => import('./modules/change-password/change-password.module').then(m => m.ChangePasswordPageModule),
    data: { noUser: true },
    canActivate: [HttpGuard]
  },
  {
    path: 'contacts',
    loadChildren: () => import('./modules/contacts/contacts.module').then(m => m.ContactsPageModule),
    data: { noUser: false },
    canActivate: [HttpGuard]
  },
  {
    path: 'emergency-numbers',
    loadChildren: () => import('./modules/emergency-numbers/emergency-numbers.module').then( m => m.EmergencyNumbersPageModule)
  },
  {
    path: 'institutions',
    loadChildren: () => import('./modules/institutions/institutions.module').then(m => m.InstitutionsPageModule),
    data: { noUser: false },
    canActivate: [HttpGuard]
  },
  {
    path: 'pre-login',
    loadChildren: () => import('./modules/pre-login/pre-login.module').then(m => m.PreLoginPageModule),
    data: { noUser: true },
    canActivate: [HttpGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then(m => m.LoginPageModule),
    data: { noUser: true },
    canActivate: [HttpGuard]
  },
  {
    path: 'map',
    loadChildren: () => import('./modules/map/map.module').then(m => m.MapPageModule),
    data: { noUser: false },
    canActivate: [HttpGuard]
  },
  {
    path: 'recover-password',
    loadChildren: () => import('./modules/recover-password/recover-password.module').then(m => m.RecoverPasswordPageModule),
    data: { noUser: true },
    canActivate: [HttpGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./modules/user/user.module').then(m => m.UserPageModule),
    data: { noUser: true },
    canActivate: [HttpGuard]
  },
  {
    path: 'pre-register',
    loadChildren: () => import('./modules/pre-register/pre-register.module').then( m => m.PreRegisterPageModule),
    data: { noUser: true },
    canActivate: [HttpGuard]
  },
  {
    path: 'filters',
    loadChildren: () => import('./modules/filters/filters.module').then( m => m.FiltersPageModule),
    data: { noUser: false },
    canActivate: [HttpGuard]
  },
  {
    path: 'status-tracking/:id',
    loadChildren: () => import('./modules/status-tracking/status-tracking.module').then( m => m.StatusTrackingPageModule),
    data: { noUser: false },
    canActivate: [HttpGuard]
  },
  {
    path: 'terms-and-conditions',
    loadChildren: () => import('./modules/terms-and-conditions/terms-and-conditions.module').then( m => m.TermsAndConditionsPageModule),
    data: { noUser: true },
    canActivate: [HttpGuard]
  },
  {
    path: 'map-options',
    loadChildren: () => import('./modules/map-options/map-options.module').then( m => m.MapOptionsPageModule),
    data: { noUser: false },
    canActivate: [HttpGuard]
  },
  {
    path: 'reports',
    loadChildren: () => import('./modules/reports/reports.module').then( m => m.ReportsPageModule),
    data: { noUser: false },
    canActivate: [HttpGuard]
  },
  {
    path: 'reports-filters',
    loadChildren: () => import('./modules/reports-filters/reports-filters.module').then( m => m.ReportsFiltersPageModule),
    data: { noUser: false },
    canActivate: [HttpGuard]
  },
  {
    path: 'report',
    loadChildren: () => import('./modules/report/report.module').then( m => m.ReportPageModule),
    data: { noUser: false },
    canActivate: [HttpGuard]
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
