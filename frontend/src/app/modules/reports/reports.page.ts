import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
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
    public pageService: PageService,
    public modalController: ModalController
  ) {
    super(pageService);
  }

  ionViewWillEnter() {
    this.reportTypes = Object.values(this.settings.reportTypes);
  }

  getReport(endPointMehod: string) {
    let endPoint = this.settings.endPoints.reports + this.settings.endPointsMethods.reports[endPointMehod];

    this.pageService.httpGet(endPoint, true)
      .then( (res) => {

      })
      .catch( (err) => {
        this.pageService.showError(err);
      })
  }

  
  async goToFilters() {
    const modal = await this.modalController.create({
      component: ReportsFiltersPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
      }
    });

    modal.onDidDismiss().then( (data) => {
    });

    await modal.present();
  }
}
