import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InstitutionsPageRoutingModule } from './institutions-routing.module';

import { InstitutionsPage } from './institutions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InstitutionsPageRoutingModule
  ],
  declarations: [InstitutionsPage]
})
export class InstitutionsPageModule {}
