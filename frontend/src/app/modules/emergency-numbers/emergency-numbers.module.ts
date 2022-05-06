import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmergencyNumbersPageRoutingModule } from './emergency-numbers-routing.module';

import { EmergencyNumbersPage } from './emergency-numbers.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmergencyNumbersPageRoutingModule
  ],
  declarations: [EmergencyNumbersPage]
})
export class EmergencyNumbersPageModule {}
