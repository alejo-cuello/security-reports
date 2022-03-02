import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PreRegisterPageRoutingModule } from './pre-register-routing.module';
import { PreRegisterPage } from './pre-register.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PreRegisterPageRoutingModule
  ],
  declarations: [PreRegisterPage]
})
export class PreRegisterPageModule {}
