import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'claims',
        loadChildren: () => import('../modules/claims/claims.module').then(m => m.ClaimsPageModule)
      },
      {
        path: 'claim',
        loadChildren: () => import('../modules/claim/claim.module').then(m => m.ClaimPageModule)
      },
      {
        path: 'map',
        loadChildren: () => import('../modules/map/map.module').then(m => m.MapPageModule)
      },
      {
        path: '',
        redirectTo: 'claims',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
