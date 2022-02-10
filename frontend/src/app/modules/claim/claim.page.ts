import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.page.html',
  styleUrls: ['./claim.page.scss'],
})
export class ClaimPage extends BasePage {

  statuses: any = [
    'suspendido',
    'creado'
  ]

  goToMap() {
    this.pageService.navigateRoute('/map');
  }

  goToHome() {
    this.pageService.showSuccess('¡Reclamo creado con éxito!');
    this.pageService.navigateRoute('tabs/claims');
  }
}
