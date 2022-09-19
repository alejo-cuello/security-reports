import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportsFiltersPage } from './reports-filters.page';

const routes: Routes = [
  {
    path: '',
    component: ReportsFiltersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsFiltersPageRoutingModule {}
