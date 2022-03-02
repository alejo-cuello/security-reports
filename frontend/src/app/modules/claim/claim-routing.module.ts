import { HttpGuard } from 'src/app/core/http.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClaimPage } from './claim.page';

const routes: Routes = [
  {
    path: '',
    component: ClaimPage,
    canActivate: [HttpGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClaimPageRoutingModule {}
