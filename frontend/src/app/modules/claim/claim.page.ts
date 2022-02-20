import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { ItemPage } from 'src/app/core/item.page';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.page.html',
  styleUrls: ['./claim.page.scss'],
})
export class ClaimPage extends ItemPage {

  action: string;
  id: string;
  role: string;
  type: string;

  categories: any[];
  selectedClaimType: any;

  statuses: any = [
    'suspendido',
    'creado'
  ];

  getEndPoint() {
    return (this.type === 'claim') ?
      this.settings.endPoints.claim
      : this.settings.endPoints.insecurityFact;
  }

  getEndPointCreate() {
    return this.settings.endPoints.claim;
  }

  getEndPointUpdate() {
    return this.settings.endPoints.claim;
  }

  initializePre() {
    this.activatedRoute.queryParams.subscribe( (params) => {
      this.action = params.action;
      this.type = params.type;
      if(params.role) this.role = params.role;
      if(params.id) this.id = params.id;
      console.log('params?', params)
    });
    this.getCategories();
  }

  getCategories() {
    const endPoint = (this.type === 'claim') ?
      this.settings.endPoints.claimTypes
      : this.settings.endPoints.insecurityFactTypes;

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.categories = response;
      })
      .catch( (error) => {
        console.log(error);
        this.pageService.showError(error);
      })
  }

  getFormNew() {
      return this.formBuilder.group({
        dateTimeCreation: [null],
        dateTimeObservation: [null, Validators.required],
        street: [null, Validators.required],
        streetNumber: [null, Validators.required],
        latitude: [null, Validators.required],
        longitude: [null, Validators.required],
        mapAddress: [null],
        comment: [null],
        photo: [null],
        neighborId: [this.user.neighborId, Validators.required],
        //El campo category contendrá el tipo o subcategoría, según corresponda
        category: [null, Validators.required],
        selectedClaimType: [null]
      });
  }

  savePre( item: any ) {

    if(this.creating) {
      //Acá se llena el campo correspondiente según el tipo
      if(this.type == 'claim')  item.claimSubcategoryId = item.category;
      else  item.insecurityFactTypeId = item.category;
      
      delete item.category;
      if(item.selectedClaimType) delete item.selectedClaimType;

      item.dateTimeCreation = Date.now();
    }
  }

  goToMap() {
    this.pageService.navigateRoute('/map');
  }

  goToHome() {
    this.pageService.showSuccess('¡Reclamo creado con éxito!');
    this.pageService.navigateRoute('tabs/claims');
  }
}
