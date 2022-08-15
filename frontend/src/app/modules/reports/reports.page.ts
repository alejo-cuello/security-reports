import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';
import { PageService } from 'src/app/core/page.service';
import { ReportsFiltersPage } from '../reports-filters/reports-filters.page';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage extends BasePage {

  reportTypes: any[] = [];

  constructor(
    public pageService: PageService
  ) {
    super(pageService);
  }

  ionViewWillEnter() {
    this.reportTypes = Object.values(this.settings.reportTypes);
  }

  goReport(endPointMethod: string, filterDays: any) {
    this.pageService.navigateRoute('report', {
      queryParams: {
        type: endPointMethod,
        ...filterDays
      }
    });
  }

  
  async goToFilters(endPointMethod: string) {
    const modal = await this.pageService.modalCtrl.create({
      component: ReportsFiltersPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {}
    });

    modal.onDidDismiss().then( (data) => {
      if(data.data) this.goReport(endPointMethod, data.data);
    });

    await modal.present();
  }
}
