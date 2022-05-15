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
  sort: string;
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

  onSelectTypes() {
    this.idsTypes = [];
    for( let type of this.selectedCategories ) {
      this.idsTypes.push(type);
    }
    if(this.idsTypes.length === 0)  this.idsTypes = null;
  }

  sendFilters() {
    this.filters = {
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      sort: this.sort,
      status: this.selectedStatuses
    }
    if(this.isInsecurityFact) {
      this.filters.types = this.idsTypes;
    }
    else {
      this.filters.categories = this.idsTypes;
      this.filters.subcategories = this.selectedSubcategories;
    }
    this.closeModal();
  }

  cancel() {
    this.filters = null;
    this.closeModal();
  }

  closeModal() {
    this.pageService.modalCtrl.dismiss(this.filters);
  }
}
