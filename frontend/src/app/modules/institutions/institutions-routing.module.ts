import { HttpGuard } from 'src/app/core/http.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InstitutionsPage } from './institutions.page';

const routes: Routes = [
  {
    path: '',
    component: InstitutionsPage,
    canActivate: [HttpGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstitutionsPageRoutingModule {}
