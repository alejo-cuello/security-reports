import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BasePage } from 'src/app/core/base.page';
import { PageService } from 'src/app/core/page.service';

@Component({
  selector: 'app-status-tracking',
  templateUrl: './status-tracking.page.html',
  styleUrls: ['./status-tracking.page.scss'],
})
export class StatusTrackingPage extends BasePage {

  claimId: string;
  statuses = []; 

  constructor(
    pageService: PageService,
    activatedRoute: ActivatedRoute
  ){
    super(pageService);
    activatedRoute.params.subscribe( (params) => {
      this.claimId = params.id;
      this.getStatusTracking();
    })
  }

  getStatusTracking() {
    const endPoint = this.settings.endPoints.claim + this.settings.endPointsMethods.claim.claimTracking;

    this.pageService.httpGetById(endPoint, this.claimId)
      .then( (res) => {
        this.statuses = res.status_claim;
      })
      .catch( (err) => {
        console.log(err);
        this.pageService.showError(err);
      })
  }

  getCheckImage(index: number) {
    this.statuses = [1,2,3]
    return index === (this.statuses.length - 1) ? 'assets/imgs/traking-check-finish.png' : 'assets/imgs/traking-check-up.png';
  }

}
