import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ItemPage } from 'src/app/core/item.page';
import * as moment from 'moment';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { PageService } from 'src/app/core/page.service';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.page.html',
  styleUrls: ['./claim.page.scss'],
})
export class ClaimPage extends ItemPage {

  //Query params
  action: string;
  id: string;
  role: string;
  type: string;

  categories: any[];
  enableButton: boolean;
  picture: any;
  selectedClaimType: number;
  statuses: any[];
  subcategories: any[];
  today: any;

  currentUrl: string;
  prevUrl: string;

  constructor(
    public formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    public pageService: PageService,
    public changeDetectorRef: ChangeDetectorRef,
    public router: Router,
    public modalController: ModalController

  ) {
    super(formBuilder, activatedRoute, pageService, changeDetectorRef, router);
    this.activatedRoute.queryParams.subscribe( (params) => {
      this.action = params.action;
      this.type = params.type;
      if(params.role) this.role = params.role;
      if(params.id) this.id = params.id;
    });
  }

  async initializePre() {
    this.enableButton = (this.role === 'municipalAgent') ? false : true;    
    await this.getCategories().catch(error => {
      this.handleError(error);
    });
    await this.getStatus().catch(error => {
      this.handleError(error);
    });
  }

  ionViewWillEnter() {
    this.today = moment().format('YYYY-MM-DD');
    if(this.creating && this.form.value.photo) this.picture = this.pageService.trustResourceUrl(this.form.value.photo);
    
    let addressInfo = this.global.pop(this.settings.storage.addressInfo);
    if(addressInfo) {
      this.form.patchValue({
        latitude: addressInfo.coordinates[0],
        longitude: addressInfo.coordinates[1],
        street: addressInfo.street,
        streetNumber: addressInfo.streetNumber
      });
    }
  }

  showMapMessage() {
    if( ( this.action === 'edit' && this.role === 'neighbor' ) || this.creating ) {
      this.pageService.showWarning('Presione el botón localizar para establecer la ubicación en el mapa');
    }
  }

  setCategory() {
    let category = this.categories.find( category => !!category.claimSubcategory.find( subcategory => subcategory.claimSubcategoryId === this.item.claimSubcategoryId));
    this.selectedClaimType = category.claimTypeId;
    this.onChangeClaimType();
  }

  getButtonName() {
    if(this.role === 'neighbor') return this.creating ? 'Crear' : 'Editar';
    else return 'Tomar reclamo';
  }

  loadItemPost() {
    if(this.type == 'claim')  this.setCategory();
    if(this.item.photo) {
      this.picture = this.item.photo;
    }
  }

  getParamId() {
    return this.id ? this.id : 'new';
  }

  getFieldId() {
    return 'claimId';
  }

  getEndPoint() {
    return (this.type === 'claim') ?
      this.settings.endPoints.claim + this.settings.endPointsMethods.claim.claimById
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

  getStatus() {
    const endPoint = this.settings.endPoints.status;

    return new Promise((resolve, reject) => 
      this.pageService.httpGetAll(endPoint)
        .then( (res) => {
          this.statuses = res;
          resolve(true);
        })
        .catch( (err) => {
          reject(err);
        })
    );
  }

  getCategories() {
    const endPoint = (this.type === 'claim') ?
      this.settings.endPoints.claimTypes
      : this.settings.endPoints.insecurityFactTypes;

    return new Promise((resolve, reject) => 
      this.pageService.httpGetAll(endPoint)
        .then( (response) => {
          this.categories = response;
          resolve(true);
        })
        .catch( (error) => {
          reject(error);
        })
    );
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
        photo: [''],
        neighborId: [this.user.neighborId, Validators.required],
        municipalAgentId: [null],
        statusId: [1],
        claimSubcategoryId: [null],
        insecurityFactTypeId: [null],
      });
  }

  getFormEdit( item ) {
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
      resolutionRating: [item.resolutionRating || null, [Validators.min(1), Validators.max(10)]],
      photo: [item.photo],
      neighborId: [item.neighborId, Validators.required],
      municipalAgentId: [item.municipalAgentId],
      statusId: [item.statusId],
      claimSubcategoryId: [item.claimSubcategoryId],
      insecurityFactTypeId: [item.insecurityFactTypeId]
    });
  }

  savePre( item: any ) {

    item.bodyType = 'form-data';
    item.dateTimeObservation = moment(item.dateTimeObservation).toISOString();
    if(item.municipalAgentId === null)  delete item.municipalAgentId;
    if(item.resolutionRating === null)  delete item.resolutionRating;
    
    let field = this.type !== 'claim' ? 'claimSubcategoryId' : 'insecurityFactTypeId';
    delete item[field];

    if(this.creating) item.dateTimeCreation = moment().toISOString();
    if(this.role === 'municipalAgent')  item.bodyType = 'json';
  }

  savePreCheck( item ) {
    if(this.type == 'claim' && !item.claimSubcategoryId) {
      this.pageService.showError('Seleccione un tipo y una subcategoría de reclamo');
      return false;
    }
    else if(this.type !== 'claim' && !item.insecurityFactTypeId) {
      this.pageService.showError('Seleccione un tipo de hecho');
      return false;
    }
    return true;
  }

  savePost(item: any) {
    this.formReset();
    this.global.save(this.settings.storage.initialized, true);
    this.pageService.navigateRoute('tabs/claims');
  }

  onChangeStatus() {
    this.enableButton = (this.form.value.statusId === 1) ? false : true;
  }

  onChangeClaimType() {
    this.pageService.zone.run(() => {
      this.subcategories = this.categories.find(category => category.claimTypeId == this.selectedClaimType).claimSubcategory;
      if(!this.subcategories.find(subcategory => subcategory.claimSubcategoryId == this.form.value.claimSubcategoryId)) {
        this.form.patchValue({ claimSubcategoryId: null });
      }
    });
  }

  changePicture() {
    if(this.action === 'watch' || this.role === 'municipalAgent') return;
    if(this.type === 'claim' && !this.creating && this.item.statusId !== 1) return;
    
    this.pageService.showImageUpload()
      .then( (response) => {
        if(response) {
          this.form.patchValue( { photo: response } );
          this.picture = this.pageService.trustResourceUrl(response);
        }
      })
      .catch( (error) => {
        console.log(error);
      })
  }

  removePicture() {
    this.form.patchValue( { photo: '' } );
    this.picture = null;
  }

  isLoading() {
    return this.pageService.global.isLoading();
  }

  goToMap() {
    if(this.form.value.latitude && this.form.value.longitude && this.form.value.street && this.form.value.streetNumber) {
      let coordinates = [ this.form.value.latitude, this.form.value.longitude ];
      let addressInfo = {
        coordinates,
        street: this.form.value.street,
        streetNumber: this.form.value.streetNumber
      }
      this.global.save(this.settings.storage.addressInfo, addressInfo);
    }

    this.pageService.navigateRoute('/map', { queryParams: {hideMenu: true} });
  }

  handleFollow() {
    let endPoint = this.settings.endPoints.claim + '/';
    let method;

    if(this.item.hasFavorite) {
      endPoint += this.settings.endPointsMethods.favorites.deleteClaimMarkedAsFavorite;
      method = 'httpDelete';
    }
    else {
      endPoint += this.settings.endPointsMethods.favorites.markClaimAsFavorite;
      method = 'httpPost';
    }

    endPoint += '/' + this.item.claimId;
    this.global.showLoading();

    this.pageService[method](endPoint)
      .then( (res) => {
        this.item.hasFavorite = !this.item.hasFavorite;
      })
      .catch( (err) => this.pageService.showError(err) )
      .finally( () => this.global.hideLoading() )
  }

  async shareWhatsApp() {
    let type = this.item.insecurityFactTypeId ? 'Hecho' : 'Reclamo';
    let message = 'Report & Alert \n '
      + type + ' compartido! \n '
      + 'Fecha de observación: ' + this.pageService.getDate(this.item.dateTimeObservation) + ' \n '
      + 'Ubicación: ' + this.item.street + ' ' + this.item.streetNumber + ' \n '
      + 'Categoría: '
        + (
          this.item.CTdescription
            ? (this.item.CTdescription + ' ' + this.item.CSCdescription)
            : (this.item.insecurityFactType.IFTdescription)
        )
      + ' \n '
      + (this.item.comment ? ('Descripción: ' + this.item.comment) : '');

    if(this.picture) {
      const endPoint = this.settings.endPoints.files + `?imageUrl=${this.picture}`;
      this.pageService.httpGet(endPoint, false)
        .then(({ base64Image }) => {
          const image = base64Image ? "data:image/jpg;base64," + base64Image : null;
          this.pageService.socialSharing.shareViaWhatsApp(message, image, null)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => this.pageService.showError(err));
        })
        .catch((err) => {
          this.handleError(err);
        })
    }
    else {
      this.pageService.socialSharing.shareViaWhatsApp(message)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => this.pageService.showError(err));
    }
  }

}
