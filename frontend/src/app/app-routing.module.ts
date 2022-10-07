import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'claim',
    loadChildren: () => import('./modules/claim/claim.module').then(m => m.ClaimPageModule)
  },
  {
    path: 'change-password',
    loadChildren: () => import('./modules/change-password/change-password.module').then(m => m.ChangePasswordPageModule)
  },
  {
    path: 'contacts',
    loadChildren: () => import('./modules/contacts/contacts.module').then(m => m.ContactsPageModule)
  },
  {
    path: 'emergency-numbers',
    loadChildren: () => import('./modules/emergency-numbers/emergency-numbers.module').then( m => m.EmergencyNumbersPageModule)
  },
  {
    path: 'institutions',
    loadChildren: () => import('./modules/institutions/institutions.module').then(m => m.InstitutionsPageModule)
  },
  {
    path: 'pre-login',
    loadChildren: () => import('./modules/pre-login/pre-login.module').then(m => m.PreLoginPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'map',
    loadChildren: () => import('./modules/map/map.module').then(m => m.MapPageModule)
  },
  {
    path: 'recover-password',
    loadChildren: () => import('./modules/recover-password/recover-password.module').then(m => m.RecoverPasswordPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./modules/user/user.module').then(m => m.UserPageModule)
  },
  {
    path: 'pre-register',
    loadChildren: () => import('./modules/pre-register/pre-register.module').then( m => m.PreRegisterPageModule)
  },
  {
    path: 'filters',
    loadChildren: () => import('./modules/filters/filters.module').then( m => m.FiltersPageModule)
  },
  {
    path: 'status-tracking/:id',
    loadChildren: () => import('./modules/status-tracking/status-tracking.module').then( m => m.StatusTrackingPageModule)
  },
  {
    path: 'terms-and-conditions',
    loadChildren: () => import('./modules/terms-and-conditions/terms-and-conditions.module').then( m => m.TermsAndConditionsPageModule)
  },
  {
    path: 'map-options',
    loadChildren: () => import('./modules/map-options/map-options.module').then( m => m.MapOptionsPageModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./modules/reports/reports.module').then( m => m.ReportsPageModule)
  },
  {
    path: 'reports-filters',
    loadChildren: () => import('./modules/reports-filters/reports-filters.module').then( m => m.ReportsFiltersPageModule)
  },
  {
    path: 'report',
    loadChildren: () => import('./modules/report/report.module').then( m => m.ReportPageModule)
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
