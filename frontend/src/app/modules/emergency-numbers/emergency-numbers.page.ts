import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-emergency-numbers',
  templateUrl: './emergency-numbers.page.html',
  styleUrls: ['./emergency-numbers.page.scss'],
})
export class EmergencyNumbersPage extends BasePage {

  emergencyTelephones: any = [];

  ionViewWillEnter() {
    this.getEmergencyNumbers();
  }

  getEmergencyNumbers() {
    const endPoint = this.settings.endPoints.emergencyTelephones;
    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.emergencyTelephones = response;
      })
      .catch( (error) => {
        this.handleError(error);
      })
  }

  callNumber( emergencyNumber: string ) {
    this.pageService.callNumber.callNumber(emergencyNumber, true)
      .then(res => this.pageService.showSuccess('Iniciando llamada'))
      .catch(error => this.pageService.showError('Error al iniciar la llamada'));
  }

}
