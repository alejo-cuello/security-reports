import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'user',
        loadChildren: () => import('../modules/user/user.module').then(m => m.UserPageModule)
      },
      {
        path: 'claims',
        loadChildren: () => import('../modules/claims/claims.module').then(m => m.ClaimsPageModule)
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
