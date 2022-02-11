import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.page.html',
  styleUrls: ['./claims.page.scss'],
})
export class ClaimsPage extends BasePage {

  menu: string = 'claim';
  claims: any[] = [1,2,3,4,5];
  insecurityFacts: any[] = [1,2,3,4,5];

  goToClaim() {
    this.pageService.navigateRoute('claim');
  }
}

