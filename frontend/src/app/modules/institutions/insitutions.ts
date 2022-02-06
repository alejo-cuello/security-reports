import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-institutions',
  templateUrl: './institutions.page.html',
  styleUrls: ['./institutions.scss'],
})
export class InstitutionsPage extends BasePage {
  
  institutions = [1,2];

  goToInstitution() {
    this.pageService.navigateRoute('institution');
  }
}
