import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpGuard } from 'src/app/core/http.guard';

import { MapPage } from './map.page';

const routes: Routes = [
  {
    path: '',
    component: MapPage,
    canActivate: [HttpGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapPageRoutingModule {}
