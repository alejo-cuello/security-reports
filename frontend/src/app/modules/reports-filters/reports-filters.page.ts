import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-reports-filters',
  templateUrl: './reports-filters.page.html',
  styleUrls: ['./reports-filters.page.scss'],
})
export class ReportsFiltersPage extends BasePage {

  dateFrom: any;
  dateTo: any;
}
