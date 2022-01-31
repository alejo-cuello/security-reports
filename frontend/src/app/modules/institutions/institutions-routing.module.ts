import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InstitutionsPage } from './insitutions';

const routes: Routes = [
  {
    path: '',
    component: InstitutionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstitutionsPageRoutingModule {}
