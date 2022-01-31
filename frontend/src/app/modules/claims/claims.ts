import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.page.html',
  styleUrls: ['./claims.scss'],
})
export class ClaimsPage extends BasePage {

  addresses = [];
  claims = [
    {
      date: '12/12/12',
      address: 'santa fe 1000',
      status: 'pendiente'
    },
    {
      date: '14/02/22',
      address: 'italia 1000',
      status: 'resuelto'
    }
  ];

  goToClaim() {
    this.pageService.navigateRoute('claim');
  }
}

