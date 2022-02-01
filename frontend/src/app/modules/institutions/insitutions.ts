import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-institutions',
  templateUrl: './institutions.page.html',
  styleUrls: ['./institutions.scss'],
})
export class InstitutionsPage extends BasePage {
  
  institutions = [
    {
      name: 'comisaría 1',
      address: 'italia 1000'
    },
    {
      name: 'comisaría 2',
      address: 'españa 200'
    }
  ]

  goToInstitution() {
    this.pageService.navigateRoute('institution');
  }
}
