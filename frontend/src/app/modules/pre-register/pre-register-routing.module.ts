import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreRegisterPage } from './pre-register.page';

const routes: Routes = [
  {
    path: '',
    component: PreRegisterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreRegisterPageRoutingModule {}
