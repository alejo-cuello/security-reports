import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmergencyNumbersPage } from './emergency-numbers.page';

const routes: Routes = [
  {
    path: '',
    component: EmergencyNumbersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmergencyNumbersPageRoutingModule {}
