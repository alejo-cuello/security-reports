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
  // {
  //   path: 'change-password',
  //   loadChildren: () => import('./modules/change-password/change-password.module').then(m => m.ChangePasswordPageModule)
  // },
  {
    path: 'claim',
    loadChildren: () => import('./modules/claim/claim.module').then(m => m.ClaimPageModule)
  },
  {
    path: 'claims',
    loadChildren: () => import('./modules/claims/claims.module').then(m => m.ClaimsPageModule)
  },
  {
    path: 'contacts',
    loadChildren: () => import('./modules/contacts/contacts.module').then(m => m.ContactsPageModule)
  },
  {
    path: 'institutions',
    loadChildren: () => import('./modules/institutions/institutions.module').then(m => m.InstitutionsPageModule)
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
    path: 'terms-and-conditions',
    loadChildren: () => import('./modules/terms-and-conditions/terms-and-conditions.module').then( m => m.TermsAndConditionsPageModule)
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
