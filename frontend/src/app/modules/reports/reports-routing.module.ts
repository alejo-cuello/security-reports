import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpGuard } from 'src/app/core/http.guard';

import { ReportsPage } from './reports.page';

const routes: Routes = [
  {
    path: '',
    component: ReportsPage,
    canActivate: [HttpGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsPageRoutingModule {}
