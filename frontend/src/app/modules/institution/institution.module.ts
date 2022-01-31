import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InstitutionPageRoutingModule } from './institution-routing.module';

import { InstitutionPage } from './insitution';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InstitutionPageRoutingModule
  ],
  declarations: [InstitutionPage]
})
export class InstitutionPageModule {}
