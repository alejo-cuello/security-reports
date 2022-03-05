import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { ItemPage } from 'src/app/core/item.page';
import * as moment from 'moment';

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
  enableButton: boolean;
  picture: any;
  selectedClaimType: any;
  selectedStatus: any;
  statuses: any[];
  subcategories: any[];
  today: any;

  ionViewWillEnter() {
    this.enableButton = (this.role === 'municipalAgent') ? false : true;

    this.getStatus();

    this.today = moment().format('YYYY-MM-DD');

    let coordinates = this.global.pop(this.settings.storage.coordinates);
    let street = this.global.pop(this.settings.storage.street);
    let streetNumber = this.global.pop(this.settings.storage.streetNumber);

    if(coordinates && street && streetNumber) {
      this.form.patchValue({
        latitude: coordinates[0],
        longitude: coordinates[1],
        street,
        streetNumber
      });
    }
  }

  savePost(item: any) {
    this.pageService.navigateRoute('tabs/claims');
  }

  showMapMessage() {
    this.pageService.showWarning('Presione el botón localizar para establecer la ubicación en el mapa');
  }

  onChangeClaimType() {
    this.subcategories = this.form.value.selectedClaimType.claimSubcategory;
    this.form.patchValue({ category: null });
  }

  setCategory() {
    if(this.type === 'claim') {
      let category = this.categories.find( category => !!category.claimSubcategory.find( subcategory => subcategory.claimSubcategoryId === this.item.claimSubcategoryId));
      let subcategory = category.claimSubcategory.find( subcategory => subcategory.claimSubcategoryId === this.item.claimSubcategoryId);
      
      this.form.patchValue( {
        selectedClaimType: category,
      });
      this.subcategories = this.form.value.selectedClaimType.claimSubcategory;


      // FIXME: Ver otra forma de cargar el select
      setTimeout( () => {
        this.form.patchValue( {
          category: subcategory.claimSubcategoryId
        });
      }, 500);
    }
    else {
      let category = this.categories.find( category => category.insecurityFactTypeId === this.item.insecurityFactTypeId).insecurityFactTypeId;
      this.form.patchValue( { category } );
    }
  }

  getButtonName() {
    if(this.role === 'neighbor') {
      return this.creating ? 'Crear' : 'Editar';
    }
    else {
      return 'Tomar reclamo';
    }
  }

  loadItemPost() {
    this.picture = this.filesUrl + this.item.photo;
    this.setCategory();
  }

  getParamId() {
    return this.id ? this.id : 'new';
  }

  getFieldId() {
    return 'claimId';
  }

  getEndPoint() {
    return (this.type === 'claim') ?
      this.settings.endPoints.claim
      : this.settings.endPoints.insecurityFact;
  }

  getEndPointCreate() {
    return this.settings.endPoints.claim;
  }

  getEndPointUpdate() {
    let endPoint = this.settings.endPoints.claim;
    if(this.role === 'municipalAgent') endPoint += this.settings.endPointsMethods.claim.updateStatus;
    return endPoint;
  }

  initializePre() {
    this.activatedRoute.queryParams.subscribe( (params) => {
      this.action = params.action;
      this.type = params.type;
      if(params.role) this.role = params.role;
      if(params.id) this.id = params.id;
    });
    this.getCategories();
  }

  getStatus() {
    const endPoint = this.settings.endPoints.status;

    this.pageService.httpGetAll(endPoint)
      .then( (res) => {
        this.statuses = res;
      })
      .catch( (err) => {
        console.log(err);
        this.pageService.showError(err);
      })
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
        comment: [''],
        photo: [null],
        neighborId: [this.user.neighborId, Validators.required],
        municipalAgentId: [null],
        statusId: [1],
        //El campo category contendrá el tipo o subcategoría, según corresponda
        category: [null, Validators.required],
        selectedClaimType: [null]
      });
  }

  getFormEdit( item ) {
    if ( item.statusId === 5 ) {
      return this.formBuilder.group({
        claimId: [item.claimId],
        dateTimeCreation: [item.dateTimeCreation],
        dateTimeObservation: [item.dateTimeObservation, Validators.required],
        street: [item.street, Validators.required],
        streetNumber: [item.streetNumber, Validators.required],
        latitude: [item.latitude],
        longitude: [item.longitude],
        mapAddress: [item.mapAddress],
        comment: [item.comment],
        resolutionRating: [item.resolutionRating, [Validators.min(1), Validators.max(10)]],
        photo: [item.photo],
        neighborId: [item.neighborId, Validators.required],
        municipalAgentId: [item.municipalAgentId],
        statusId: [item.statusId],
        //El campo category contendrá el tipo o subcategoría, según corresponda
        category: [null, Validators.required],
        selectedClaimType: [null]
      });
    }
    return this.formBuilder.group({
      claimId: [item.claimId],
      dateTimeCreation: [item.dateTimeCreation],
      dateTimeObservation: [item.dateTimeObservation, Validators.required],
      street: [item.street, Validators.required],
      streetNumber: [item.streetNumber, Validators.required],
      latitude: [item.latitude],
      longitude: [item.longitude],
      mapAddress: [item.mapAddress],
      comment: [item.comment],
      photo: [item.photo],
      neighborId: [item.neighborId, Validators.required],
      municipalAgentId: [item.municipalAgentId],
      statusId: [item.statusId],
      //El campo category contendrá el tipo o subcategoría, según corresponda
      category: [null, Validators.required],
      selectedClaimType: [null]
    });
  }

  savePre( item: any ) {

    item.bodyType = 'form-data';
    item.dateTimeObservation = moment(item.dateTimeObservation).format('YYYY-MM-DD HH:mm:ss');
    if(item.municipalAgentId === null)  delete item.municipalAgentId;
    
    //Acá se llena el campo correspondiente según el tipo
    if(this.type == 'claim')  item.claimSubcategoryId = item.category;
    else  item.insecurityFactTypeId = item.category;
    
    delete item.category;
    if(item.selectedClaimType) delete item.selectedClaimType;

    if(this.creating) { 
      item.dateTimeCreation = moment().toISOString();
    }

    if(this.role === 'municipalAgent') {
      item.bodyType = 'json'
    };
  }

  onChangeStatus() {
    this.enableButton = (this.form.value.statusId === 1) ? false : true;
  }

  changePicture() {
    if(this.action === 'watch' || this.role === 'municipalAgent') return;
    this.pageService.showImageUpload()
      .then( (response) => {
        if(response) {
          this.form.patchValue( { photo: response } );
          this.picture = this.pageService.trustResourceUrl(response);
        }
      })
      .catch( (error) => {
        console.log(error);
        this.pageService.showError(error);
      })
  }

  goToMap() {
    if(this.form.value.latitude) {
      let coordinates = [ this.form.value.latitude, this.form.value.longitude ];
      this.global.save(this.settings.storage.coordinates, coordinates);
      this.global.save(this.settings.storage.street, this.form.value.street);
      this.global.save(this.settings.storage.streetNumber, this.form.value.streetNumber);
    }
    this.pageService.navigateRoute('/map');
  }

  goToHome() {
    this.pageService.showSuccess('¡Reclamo creado con éxito!');
    this.pageService.navigateRoute('tabs/claims');
  }
}
