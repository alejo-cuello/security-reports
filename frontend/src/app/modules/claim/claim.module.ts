import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClaimPageRoutingModule } from './claim-routing.module';

import { ClaimPage } from './claim.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClaimPageRoutingModule
  ],
  declarations: [ClaimPage]
})
export class ClaimPageModule {}
