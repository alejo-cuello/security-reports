import { Component } from '@angular/core';
import { AlertInput } from '@ionic/angular';
import { BasePage } from 'src/app/core/base.page';
import { PageService } from 'src/app/core/page.service';
import { FiltersPage } from '../filters/filters.page';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.page.html',
  styleUrls: ['./claims.page.scss'],
})
export class ClaimsPage extends BasePage {

  filters: any;
  haveFilters: boolean = false;
  initialized: boolean = false;
  menu: string;
  prevFilters: any;
  role: string;
  showFilterButton: boolean = false;

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
    public pageService: PageService
  ) {
    super(pageService);
    this.initialize();
  }

  initialize() {
    const initialized = this.global.pop(this.settings.storage.initialized);
    if(initialized) this.initialized = false;
    
    if(!this.initialized) {
      this.initialized = true;
      this.role = this.global.load(this.settings.storage.role);
      this.global.remove(this.settings.storage.addressInfo);
      
      if(!this.menu)  this.menu = this.role === 'neighbor' ? 'claim' : 'pendingClaims';
      else if(this.role === 'neighbor' && this.menu != 'claim' && this.menu != 'insecurityFact') this.menu = 'claim';
      else if(this.role === 'municipalAgent' && this.menu != 'pendingClaims' && this.menu != 'takenClaims') this.menu = 'pendingClaims';
      
      this.getClaimsByRole();
    }
  }

  ionViewWillEnter() {
    this.initialize();
  }

  ionViewWillLeave() {
    this.initialized = false;
  }

  changeSegment() {
    this.prevFilters = null;
    this.haveFilters = false;
    this.getClaimsByRole();
  }

  getColor( statusId: number ) {
    if(statusId <= 2)  return 'tertiary';
    else if(statusId <= 4)  return 'warning';
    else if(statusId == 5)  return 'success';
    else if(statusId <= 7)  return 'danger';
  }

  getClaimsByRole() {
    if(this.role === 'neighbor') this.getClaims();
    else  this.getPendingClaims();
  }

  getPendingClaims( filters?: any ) {
    let endPoint = this.settings.endPoints.claim;
    endPoint += this.menu === 'pendingClaims'
      ? this.settings.endPointsMethods.claim.pending
      : this.settings.endPointsMethods.claim.takenClaims;
    
    if(this.prevFilters) {
      endPoint += this.getQueryString(this.prevFilters);
      if(filters != '?')  this.haveFilters = true;
    }

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.claims = response;

        this.showFilterButton = response.length > 0;
      })
      .catch( (error) => {
        this.handleError(error);
      })
  }

  getClaims( filters?: any ) {
    let endPoint = (this.menu === 'claim')
      ? this.settings.endPoints.claim + this.settings.endPointsMethods.claim.favorites
      : this.settings.endPoints.insecurityFact;

    // Query filters
    if(this.prevFilters) {
      endPoint += this.getQueryString(this.prevFilters);
      if(filters != '?')  this.haveFilters = true;
    }

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        if(this.menu === 'claim') this.claims = response;
        else  this.insecurityFacts = response;

        this.showFilterButton = response.length > 0;
      })
      .catch( (error) => {
        this.handleError(error);
      })
  }

  isLoading() {
    return this.pageService.global.isLoading();
  }

  goToClaim(action?: string, id?: string) {
    const role = this.global.load(this.settings.storage.role);
    const type = this.menu === 'insecurityFact' ? 'insecurityFact' : 'claim';

    this.initialized = false;
    this.pageService.navigateRoute( 'claim', { queryParams: { action, id, role, type: type } } );
  }

  async goToFilters() {
    const modal = await this.pageService.modalCtrl.create({
      component: FiltersPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        filters: this.filters || {},
        claimType: this.menu,
        prevFilters: this.prevFilters || {}
      }
    });

    modal.onDidDismiss().then( (data) => {
      if(data.data) this.prevFilters = data.data;
      this.getClaimsByRole();
    });

    await modal.present();
  }

  deleteFilters() {
    this.haveFilters = false;
    this.prevFilters = null;
    this.getClaimsByRole();
  }

  getNeighborOptions(neighborId, isInsecurityFact) {
    let isOwnClaim = this.user.neighborId === neighborId;
    let options: AlertInput[] = [
      { 
        type: 'radio',
        label: 'Ver detalle',
        value: 'watch'
      }
    ];
    if(isOwnClaim) {
      options.push({ 
        type: 'radio',
        label: 'Editar',
        value: 'edit'
      });
    }
    options.push({ 
      type: 'radio',
      label: isOwnClaim ? 'Eliminar' : 'Eliminar favorito',
      value: isOwnClaim ? 'delete' : 'deleteFavorite'
    });
    if(!isInsecurityFact) {
      options.push({
        type: 'radio',
        label: 'Seguimiento de estados',
        value: 'tracking'
      });
    }
    return options;
  }

  openOptions( id: string, neighborId: string, isInsecurityFact = false ) {
    if(this.role === 'neighbor') {
      this.showNeighborOptions( id, neighborId, isInsecurityFact);
    }
    else  this.goToClaim('edit', id);
  }

  async showNeighborOptions( id: string, neighborId: string, isInsecurityFact: boolean) {
    const alert = await this.pageService.alertCtrl.create({
      header: 'Opciones',
      inputs: this.getNeighborOptions(neighborId, isInsecurityFact),
      mode: 'ios',
      backdropDismiss: false,
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
            if(!action) return;
            if(action === 'delete') {
              let endPoint = (this.menu === 'claim') ? this.settings.endPoints.claim : this.settings.endPoints.insecurityFact;
              endPoint += '/' + id;
              this.pageService.httpDelete(endPoint)
                .then( (response) => {
                  this.pageService.showSuccess('Borrado exitosamente');
                  this.getClaims();
                })
                .catch( (error) => {
                  this.handleError(error);
                })
            }
            else if(action === 'deleteFavorite') {
              let endPoint = this.settings.endPoints.claim;
              endPoint += this.settings.endPointsMethods.favorites.deleteClaimMarkedAsFavorite;
              endPoint += '/' + id;
              this.pageService.httpDelete(endPoint)
                .then( (response) => {
                  this.pageService.showSuccess('Favorito borrado exitosamente');
                  this.getClaims();
                })
                .catch( (error) => {
                  this.handleError(error);
                })
            }
            else {
              if(action === 'tracking') {
                this.goToStatustracking(id);
              }
              else {
                this.goToClaim(action, id);
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  goToStatustracking(id: string) {
    this.initialized = false;
    this.pageService.navigateRoute('status-tracking/' + id);
  }
}
