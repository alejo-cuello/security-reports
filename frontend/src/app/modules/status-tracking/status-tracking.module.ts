import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StatusTrackingPageRoutingModule } from './status-tracking-routing.module';

import { StatusTrackingPage } from './status-tracking.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatusTrackingPageRoutingModule
  ],
  declarations: [StatusTrackingPage]
})
export class StatusTrackingPageModule {}
