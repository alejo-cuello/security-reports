import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.page.html',
  styleUrls: ['./claims.page.scss'],
})
export class ClaimsPage extends BasePage {

  menu: string = 'claim';
  claims: any[] = [];
  claimTypes: any[] = [];
  insecurityFacts: any[] = [];
  insecurityFactTypes: any[] = [];

  selectedCategories: any[] = [];
  selectedSubcategories: any[] = [];

  ionViewWillEnter() {
    this.getClaimTypes();
    this.getInsecurityFactTypes();
    this.getClaims();
  }

  changeSegment() {
    this.selectedCategories = [];
    this.selectedSubcategories = [];
    this.getClaims();
  }

  getClaimTypes() {
    const endPoint = this.settings.endPoints.claimTypes;

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.claimTypes = response;
      })
      .catch( (error) => {
        console.log(error);
        this.pageService.showError(error);
      })
  }

  getInsecurityFactTypes() {
    const endPoint = this.settings.endPoints.insecurityFactTypes;

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.insecurityFactTypes = response;
      })
      .catch( (error) => {
        console.log(error);
        this.pageService.showError(error);
      })
  }

  getClaims( type?: string ) {
    const endPoint = (this.menu === 'claim') ? 
      this.settings.endPoints.claim + this.settings.endPointsMethods.claim.favorites
      : this.settings.endPoints.insecurityFact;

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.claims = response;
      })
      .catch( (error) => {
        console.log(error);
        this.pageService.showError(error);
      })
  }

  goToClaim( action: string ) {
    this.pageService.navigateRoute( 'claim', { queryParams: { action } } );
  }

  async openOptions( id: string ) {
    const alert = await this.pageService.alertCtrl.create({
      header: 'Opciones',
      inputs: [
        { 
          type: 'radio',
          label: 'Ver detalle',
          value: 'watch'
        },
        { 
          type: 'radio',
          label: 'Editar',
          value: 'edit'
        },
        { 
          type: 'radio',
          label: 'Eliminar',
          value: 'delete'
        },
      ],
      buttons: [
        {
          text: 'CANCELAR',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'OK',
          handler: (action) => {
            this.goToClaim(action);
          }
        }
      ]
    });

    await alert.present();
  }
}
