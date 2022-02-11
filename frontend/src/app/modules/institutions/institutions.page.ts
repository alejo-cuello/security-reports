import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-institutions',
  templateUrl: './institutions.page.html',
  styleUrls: ['./institutions.page.scss'],
})
export class InstitutionsPage extends BasePage {
  
  securityInstitutions = [1,2,3,4,5];
  healthInstitutions = [];
  menu: string = 'security';

}
