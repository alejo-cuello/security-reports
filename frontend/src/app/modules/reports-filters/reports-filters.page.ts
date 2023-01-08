import { Component } from '@angular/core';
import * as moment from 'moment';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-reports-filters',
  templateUrl: './reports-filters.page.html',
  styleUrls: ['./reports-filters.page.scss'],
})
export class ReportsFiltersPage extends BasePage {

  dateFrom: any;
  dateTo: any;
  filters: any;
  today: any;

  ionViewWillEnter() {
    this.today = moment().format('YYYY-MM-DD');
  }

  sendFilters() {
    if(moment(this.dateFrom).isAfter(this.dateTo)) {
      this.pageService.showError('La fecha desde no puede ser mayor a la fecha hasta');
      return;
    }
    this.filters = {
      startDate: this.dateFrom ? this.dateFrom.split('T')[0] : null,
      endDate: this.dateTo ? this.setEndDate(this.dateTo.split('T')[0], 1) : null,
    }
    this.closeModal();
  }

  setEndDate(date: string, number) {
    return moment(date).add(number, 'days').format('YYYY-MM-DD');
  }

  cancel() {
    this.filters = null;
    this.closeModal();
  }

  closeModal() {
    this.pageService.modalCtrl.dismiss(this.filters);
  }
}
