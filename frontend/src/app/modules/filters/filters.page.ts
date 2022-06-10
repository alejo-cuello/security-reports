import { Component, Input } from '@angular/core';
import * as moment from 'moment';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.page.html',
  styleUrls: ['./filters.page.scss'],
})
export class FiltersPage extends BasePage {

  @Input() filters: any;
  @Input() claimType: any;

  categories: any[];
  selectedSubcategories: any[];
  claimSubcategories: any[];
  idsTypes: any[];
  selectedCategories: any[] = [];
  selectedStatuses: any[];
  sort: string = 'rec.fechaHoraCreacion';
  today: any;
  dateFrom: any;
  dateTo: any;
  isInsecurityFact: boolean;
  statuses: any[];


  ionViewWillEnter() {
    this.isInsecurityFact = this.claimType === 'insecurityFact'
    this.isInsecurityFact ? this.getInsecurityFactTypes() : this.getClaimTypes();

    this.today = moment().format('YYYY-MM-DD');

    this.getStatuses();
  }

  getStatuses() {
    const endPoint = this.settings.endPoints.status;

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.statuses = response;
      })
      .catch( (error) => {
        this.pageService.showError(error);
      })
  }

  getClaimTypes() {
    const endPoint = this.settings.endPoints.claimTypes;

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.categories = response;
      })
      .catch( (error) => {
        this.pageService.showError(error);
      })
  }

  getInsecurityFactTypes( type?: string[] ) {
    const endPoint = this.settings.endPoints.insecurityFactTypes;

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.categories = response;
      })
      .catch( (error) => {
        this.pageService.showError(error);
      })
  }

  onSelectCategories() {
    this.selectedSubcategories = [];
    this.claimSubcategories = [];
    this.idsTypes = [];

    for( let type of this.selectedCategories ) {
      for( let subcategory of type.claimSubcategory ) {
        this.claimSubcategories.push(subcategory);
      }
      this.idsTypes.push(type.claimTypeId);
    }

    if(this.idsTypes.length === 0)  this.idsTypes = null;
  }
  
  sendFilters() {
    this.filters = {
      startDate: this.dateFrom ? this.dateFrom.split('T')[0] : null,
      endDate: this.dateTo ? this.dateTo.split('T')[0] : null,
      sort: this.sort || null,
      status: this.selectedStatuses || null
    }
    if(this.isInsecurityFact) {
      this.filters.insecurityFactType = this.idsTypes.length > 0 ? this.idsTypes : null;
    }
    else {
      this.filters.claimType = (this.idsTypes && this.idsTypes.length > 0) ? this.idsTypes : null;
      this.filters.claimSubcategory = (this.selectedSubcategories && this.selectedSubcategories.length > 0) ? this.selectedSubcategories : null;
    }
    this.closeModal();
  }

  cancel() {
    this.filters = null;
    this.closeModal();
  }

  closeModal() {
    console.log(this.filters)
    this.pageService.modalCtrl.dismiss(this.filters);
  }
}
