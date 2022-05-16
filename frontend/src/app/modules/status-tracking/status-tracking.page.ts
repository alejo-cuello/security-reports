import { Component, Input } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-status-tracking',
  templateUrl: './status-tracking.page.html',
  styleUrls: ['./status-tracking.page.scss'],
})
export class StatusTrackingPage extends BasePage {

  @Input() claimId: any;
  statuses = []; 

  ionViewWillEnter() {
    this.getStatusTracking();
  }

  getStatusTracking() {
    const endPoint = this.settings.endPoints.status + this.settings.endPointsMethods.status;

    this.pageService.httpGetAll(endPoint)
      .then( (res) => {
        this.statuses = res;
      })
      .catch( (err) => {
        console.log(err);
        this.pageService.showError(err);
      })
  }

}
