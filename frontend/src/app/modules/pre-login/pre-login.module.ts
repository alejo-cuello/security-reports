import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreLoginPageRoutingModule } from './pre-login-routing.module';

import { PreLoginPage } from './pre-login.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    PreLoginPageRoutingModule
  ],
  declarations: [PreLoginPage]
})
export class PreLoginPageModule {}
