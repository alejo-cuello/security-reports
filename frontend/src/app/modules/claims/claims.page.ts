import { Component } from '@angular/core';
import { AlertInput, ModalController } from '@ionic/angular';
import { BasePage } from 'src/app/core/base.page';
import { PageService } from 'src/app/core/page.service';
import { FiltersPage } from '../filters/filters.page';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.page.html',
  styleUrls: ['./claims.page.scss'],
})
export class ClaimsPage extends BasePage {

  menu: string;
  filters: any;
  role: string;

  claims: any[] = [];
  claimTypes: any[] = [];
  claimSubcategories: any[] = [];
  idsTypes: any[] = [];
  insecurityFacts: any[] = [];
  insecurityFactTypes: any[] = [];

  selectedCategories: any[] = [];
  selectedSubcategories: any[] = [];
  selectedStatuses: any[];

  constructor(
    public pageService: PageService,
    public modalController: ModalController
  ) {
    super(pageService);
  }

  ionViewWillEnter() {
    this.role = this.global.load(this.settings.storage.role);

    this.global.remove(this.settings.storage.coordinates);
    this.global.remove(this.settings.storage.street);
    this.global.remove(this.settings.storage.streetNumber);

    if(this.role === 'neighbor') {
      this.menu = 'claim';
      this.getClaims();
    }
    else {
      this.menu = 'pendingClaims';
      this.getPendingClaims();
    }
  }

  changeSegment() {
    if(this.role === 'neighbor') {
      this.getClaims();
    }
    else {
      if(this.menu === 'pendingClaims') this.getPendingClaims();
      else this.getTakenClaims();
    }
  }

  getColor( statusId: number ) {
    if(statusId <= 2)  return 'tertiary';
    else if(statusId <= 4)  return 'warning';
    else if(statusId == 5)  return 'success';
    else if(statusId <= 7)  return 'danger';
  }

  getPendingClaims() {
    const endPoint = this.settings.endPoints.claim
      + this.settings.endPointsMethods.claim.pending;

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.claims = response;
      })
      .catch( (error) => {
        this.pageService.showError(error);
      })
  }

  getTakenClaims() {
    const endPoint = this.settings.endPoints.claim
      + this.settings.endPointsMethods.claim.takenClaims;

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.claims = response;
      })
      .catch( (error) => {
        this.claims = [];
        // this.pageService.showError(error);
      })
  }

  getClaims( type?: string[], subcategory?: string[] ) {
    let endPoint = (this.menu === 'claim') ? 
      this.settings.endPoints.claim + this.settings.endPointsMethods.claim.favorites
      : this.settings.endPoints.insecurityFact;

    if(subcategory) endPoint += '?claimSubcategory=' + subcategory;
    else if(type) {
      if( this.menu === 'claim' ) endPoint += '?claimType=' + type;
      else endPoint += '?insecurityFactType=' + type;
    }

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        if(this.menu === 'claim') this.claims = response;
        else  this.insecurityFacts = response;
      })
      .catch( (error) => {
        console.log(error);
      })
  }

  goToClaim( action?: string, id?: string) {
    const role = this.global.load(this.settings.storage.role);
    this.pageService.navigateRoute( 'claim', { queryParams: { action, id, role, type: this.getType() } } );
  }

  async goToFilters() {
    const modal = await this.modalController.create({
      component: FiltersPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        filters: this.filters || {},
        claimType: this.menu
      }
    });

    modal.onDidDismiss().then( (data) => {
      console.log(data)
    });

    await modal.present();
  }

  getType() {
    return this.menu === 'insecurityFact' ? 'insecurityFact' : 'claim';
  }

  getNeighborOptions() {
    let options: AlertInput[] = [
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
      }
    ]
    return options;
  }

  openOptions( id: string ) {
    if(this.role === 'neighbor') {
      this.showNeighborOptions( id );
    }
    else  this.goToClaim('edit', id);
  }

  async showNeighborOptions( id: string ) {
    const alert = await this.pageService.alertCtrl.create({
      header: 'Opciones',
      inputs: this.getNeighborOptions(),
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
            if(action === 'delete') {
              let endPoint = (this.menu === 'claim') ? this.settings.endPoints.claim : this.settings.endPoints.insecurityFact;
              endPoint += '/' + id;
              this.pageService.httpDelete(endPoint)
                .then( (response) => {
                  this.pageService.showSuccess('Borrado exitosamente');
                  this.getClaims();
                })
                .catch( (error) => {
                  this.pageService.showError(error);
                })
            }
            else {
              this.goToClaim(action, id);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
