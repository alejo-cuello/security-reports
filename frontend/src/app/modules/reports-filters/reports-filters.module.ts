import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportsFiltersPageRoutingModule } from './reports-filters-routing.module';

import { ReportsFiltersPage } from './reports-filters.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportsFiltersPageRoutingModule
  ],
  declarations: [ReportsFiltersPage]
})
export class ReportsFiltersPageModule {}
