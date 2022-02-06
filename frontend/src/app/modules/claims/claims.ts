import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.page.html',
  styleUrls: ['./claims.scss'],
})
export class ClaimsPage extends BasePage {

  menu: string = 'claim';

  goToClaim() {
    this.pageService.navigateRoute('claim');
  }
}

