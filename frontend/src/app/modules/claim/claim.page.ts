import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BasePage } from 'src/app/core/base.page';
import { PageService } from 'src/app/core/page.service';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.page.html',
  styleUrls: ['./claim.page.scss'],
})
export class ClaimPage extends BasePage {

  action: string;
  statuses: any = [
    'suspendido',
    'creado'
  ]

  constructor(
    public pageService: PageService,
    public activatedRoute: ActivatedRoute
  ) {
    super(pageService);
    this.activatedRoute.queryParams.subscribe( (params) => {
      this.action = params.action;
    });
  }

  goToMap() {
    this.pageService.navigateRoute('/map');
  }

  goToHome() {
    this.pageService.showSuccess('¡Reclamo creado con éxito!');
    this.pageService.navigateRoute('tabs/claims');
  }
}
