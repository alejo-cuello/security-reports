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
  claimSubcategories: any[] = [];
  idsTypes: any[] = [];
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

  getClaims( type?: string[], subcategory?: string[] ) {
    let endPoint = (this.menu === 'claim') ? 
      this.settings.endPoints.claim + this.settings.endPointsMethods.claim.favorites
      : this.settings.endPoints.insecurityFact;

    if(subcategory) endPoint += '?claimSubcategory=' + subcategory;
    else if(type) endPoint += '?claimType=' + type;

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.claims = response;
      })
      .catch( (error) => {
        console.log(error);
      })
  }

  goToClaim( action?: string, id?: string) {
    const role = this.global.load(this.settings.storage.role);
    this.pageService.navigateRoute( 'claim', { queryParams: { action, id, role, type: this.menu } } );
  }

  onSelectCategories(event) {
    this.selectedSubcategories = [];
    this.claimSubcategories = [];
    this.idsTypes = [];
    for( let type of this.selectedCategories ) {
      for( let subcategory of type.claimSubcategory ) {
        this.claimSubcategories.push(subcategory);
      }
      this.idsTypes.push(type.claimTypeId);
    }
    this.getClaims(this.idsTypes);
  }

  onSelectSubcategories(event) {
    this.getClaims(this.selectedCategories, this.selectedSubcategories);
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
            this.goToClaim(action, id);
          }
        }
      ]
    });

    await alert.present();
  }
}
