import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserPageRoutingModule } from './user-routing.module';
import { UserPage } from './user.page';
import { NeighborFormComponent } from './components/neighbor-form/neighbor-form.component';
import { MunicipalAgentFormComponent } from './components/municipal-agent-form/municipal-agent-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    UserPageRoutingModule
  ],
  declarations: [
    UserPage,
    NeighborFormComponent,
    MunicipalAgentFormComponent
  ],
})
export class UserPageModule {}
