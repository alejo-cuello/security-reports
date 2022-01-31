import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClaimPage } from './claim';

const routes: Routes = [
  {
    path: '',
    component: ClaimPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClaimPageRoutingModule {}
